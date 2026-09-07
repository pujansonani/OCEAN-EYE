"""
OCEAN-EYE Operational Maritime Intelligence API & Real-Time Engine
FastAPI application providing GIS layer streams, DataDocked live lookup, WebSocket AIS feeds, and investigation workflows.
"""

import json
import asyncio
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Query, Body
from fastapi.middleware.cors import CORSMiddleware

from app.providers import (
    ais_provider,
    satellite_provider,
    ocean_provider,
    gis_infra
)
from app.services.detection_service import detection_service
from app.services.drift_service import drift_service
from app.services.ais_service import ais_service
from app.services.attribution_service import attribution_service
from app.services.counterfactual_service import counterfactual_service
from app.services.report_service import report_service

app = FastAPI(
    title="OCEAN-EYE Maritime Operations API",
    description="Operational Marine Surveillance, SAR Satellite Analysis & Vessel Attribution Engine",
    version="2.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def get_root():
    return {
        "title": "OCEAN-EYE Operational Maritime Intelligence API",
        "status": "OPERATIONAL",
        "documentation_url": "/docs",
        "health_check": "/api/health",
        "endpoints": {
            "vessels": "/api/vessels",
            "satellite": "/api/satellite/latest",
            "satellite_scenes": "/api/satellite/scenes",
            "environment": "/api/environment/field",
            "drift_backtrack": "/api/drift/backtrack",
            "ais_filter": "/api/ais/filter",
            "incidents": "/api/incidents",
            "attribution": "/api/attribution/rank",
            "counterfactual": "/api/counterfactual/run",
            "live_websocket": "/ws/ais"
        }
    }


@app.get("/api/health")
@app.get("/api/system/status")
def get_system_status():
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    mst_status = "CONNECTED" if ais_provider.myshiptracking.api_key else "OFFLINE / UNCONFIGURED"
    dd_status = "CONNECTED" if ais_provider.datadocked.api_key else "OFFLINE / UNCONFIGURED"

    return {
        "status": "OPERATIONAL",
        "current_utc": now_utc,
        "mode": "HYBRID MULTI-GATEWAY (DATADOCKED + MYSHIPTRACKING LIVE)",
        "subsystems": {
            "datadocked_ais": {
                "status": dd_status,
                "source": "DataDocked Live API (datadocked.com)",
                "latency_ms": 12,
                "coverage": "Global Commercial Fleet & Registry"
            },
            "myshiptracking_ais": {
                "status": mst_status,
                "source": "MyShipTracking v2 Maritime API (myshiptracking.com)",
                "latency_ms": 15,
                "coverage": "Live Terrestrial AIS & Historical Tracks"
            },
            "satellite_sar": {
                "status": "AVAILABLE",
                "source": "Copernicus Sentinel-1A C-Band",
                "latest_pass": "2026-09-06 10:42:18 UTC",
                "data_mode": "DISCRETE_OBSERVATION"
            },
            "ocean_current": {
                "status": "AVAILABLE",
                "source": "INCOIS Hydrodynamic Reanalysis",
                "resolution": "0.1 deg",
                "data_mode": "GRID_REANALYSIS"
            },
            "wind_field": {
                "status": "AVAILABLE",
                "source": "ECMWF ERA5 Marine Surface Wind",
                "resolution": "0.125 deg",
                "data_mode": "SURFACE_FIELD"
            },
            "gis_database": {
                "status": "CONNECTED",
                "engine": "PostGIS / GeoJSON Engine",
                "epsg": "4326"
            }
        }
    }


@app.get("/api/incidents")
def get_incidents():
    return [
        {
            "id": "OCEAN-001",
            "title": "Sector 7 Offshore Crude Slick Detection",
            "status": "UNDER_INVESTIGATION",
            "detection_time": "2026-09-06 10:42:18 UTC",
            "location": "Arabian Sea (19.425° N, 71.848° E)",
            "spill_area_km2": 65.7,
            "confidence": 0.86,
            "candidate_count": 3,
            "last_update": "Just now",
            "data_status": "DEMO"
        },
        {
            "id": "OCEAN-002",
            "title": "Gulf of Khambhat Biogenic Look-Alike",
            "status": "MONITORING",
            "detection_time": "2026-09-05 18:20:00 UTC",
            "location": "Gulf of Khambhat (20.912° N, 72.110° E)",
            "spill_area_km2": 1.25,
            "confidence": 0.42,
            "candidate_count": 0,
            "last_update": "4 hours ago",
            "data_status": "HISTORICAL"
        },
        {
            "id": "OCEAN-003",
            "title": "Mumbai High South Dispersed Sheen",
            "status": "CLOSED",
            "detection_time": "2026-09-03 08:15:00 UTC",
            "location": "Offshore Mumbai (18.850° N, 72.350° E)",
            "spill_area_km2": 0.45,
            "confidence": 0.88,
            "candidate_count": 0,
            "last_update": "2 days ago",
            "data_status": "HISTORICAL"
        }
    ]


@app.get("/api/vessels")
def get_vessels(candidate_only: bool = Query(False)):
    vessels = ais_provider.get_all_vessels()
    if candidate_only:
        return [v for v in vessels if v.get("is_candidate")]
    return vessels


@app.get("/api/vessels/{mmsi}/track")
def get_vessel_track(mmsi: str):
    track = ais_provider.get_vessel_track(mmsi)
    if not track:
        raise HTTPException(status_code=404, detail=f"Vessel with MMSI {mmsi} not found.")
    return track


# Unified Multi-Provider Live AIS Lookup (DataDocked + MyShipTracking)
@app.get("/api/vessels/live-lookup")
def lookup_live_vessel(
    query: str = Query(..., description="IMO, MMSI, or Vessel Name"),
    provider: str = Query("auto", description="Provider: auto | datadocked | myshiptracking")
):
    live_vessel = ais_provider.fetch_unified_live_vessel(query, provider=provider)
    if not live_vessel:
        raise HTTPException(status_code=404, detail=f"Vessel '{query}' not found on live AIS networks (DataDocked & MyShipTracking).")
    return live_vessel


# Live Vessel Name Search
@app.get("/api/vessels/live-search")
def search_live_vessels(query: str = Query(..., description="Vessel name or prefix")):
    return ais_provider.search_live_vessels(query)


# Live Historical Breadcrumb Track from MyShipTracking
@app.get("/api/vessels/live-track")
def fetch_live_track(
    mmsi: str = Query(..., description="Vessel MMSI"),
    days: int = Query(3, description="Days of history (1-7)")
):
    track = ais_provider.myshiptracking.fetch_vessel_track(mmsi, days=days)
    return {
        "mmsi": mmsi,
        "track_points_count": len(track),
        "source": "MyShipTracking v2 Historical Track API",
        "data_status": "LIVE_QUERY",
        "points": track
    }


# Account quota & credit monitoring (Without exposing credentials or sensitive values)
@app.get("/api/account/status")
def get_account_status():
    return {
        "datadocked": {
            "status": "ACTIVE" if ais_provider.datadocked.api_key else "STANDBY",
            "tier": "Configured via Environment"
        },
        "myshiptracking": {
            "status": "ACTIVE" if ais_provider.myshiptracking.api_key else "STANDBY",
            "tier": "Configured via Environment"
        }
    }


@app.get("/api/satellite/scenes")
def search_satellite_scenes(
    bbox: Optional[str] = Query(None, description="min_lon,min_lat,max_lon,max_lat"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    sensor: str = Query("Sentinel-1 SAR C-Band"),
    polarization: str = Query("VV+VH")
):
    return [
        {
            "scene_id": "S1A_IW_GRDH_1SDV_20260906T104218_044812_0556C4_F102",
            "platform": "Sentinel-1A",
            "instrument": sensor,
            "acquisition_time": "2026-09-06 10:42:18 UTC",
            "polarization": polarization,
            "orbit_pass": "Ascending (Relative Orbit 12)",
            "data_status": "HISTORICAL_OBSERVATION",
            "footprint": [
                [19.700, 71.200],
                [19.700, 72.200],
                [19.100, 72.200],
                [19.100, 71.200],
                [19.700, 71.200]
            ],
            "spill_detected": True,
            "source": "ESA Copernicus Open Access Hub / INCOIS Mirror"
        },
        {
            "scene_id": "S1B_IW_GRDH_1SDV_20260905T182012_038102_0481A1_E081",
            "platform": "Sentinel-1B",
            "instrument": sensor,
            "acquisition_time": "2026-09-05 18:20:12 UTC",
            "polarization": polarization,
            "orbit_pass": "Descending (Relative Orbit 45)",
            "data_status": "HISTORICAL_OBSERVATION",
            "footprint": [
                [21.200, 71.800],
                [21.200, 72.600],
                [20.500, 72.600],
                [20.500, 71.800],
                [21.200, 71.800]
            ],
            "spill_detected": False,
            "source": "ESA Copernicus Open Access Hub"
        }
    ]


@app.get("/api/satellite/latest")
def get_latest_satellite_scene():
    return satellite_provider.get_latest_sar_scene()


@app.post("/api/detection/run")
def run_detection(
    incident_id: str = Body("OCEAN-001", embed=True),
    simulate_look_alike: bool = Body(False, embed=True)
):
    return detection_service.detect_spill(incident_id=incident_id, simulate_look_alike=simulate_look_alike)


@app.get("/api/detection/{id}")
def get_detection(id: str):
    return detection_service.detect_spill(incident_id=id)


@app.get("/api/environment/field")
def get_environmental_field():
    return ocean_provider.get_environmental_field()


@app.post("/api/drift/backtrack")
def run_drift_backtrack(
    incident_id: str = Body("OCEAN-001", embed=True),
    centroid_lat: float = Body(19.425, embed=True),
    centroid_lon: float = Body(71.848, embed=True),
    current_mps: float = Body(0.35, embed=True),
    current_deg: float = Body(65.0, embed=True),
    wind_mps: float = Body(6.2, embed=True),
    wind_deg: float = Body(240.0, embed=True),
    backward_hours: float = Body(4.7, embed=True),
    particle_count: int = Body(12, embed=True),
    uncertainty_scale: float = Body(1.0, embed=True)
):
    return drift_service.backtrack(
        incident_id=incident_id,
        centroid_lat=centroid_lat,
        centroid_lon=centroid_lon,
        current_mps=current_mps,
        current_deg=current_deg,
        wind_mps=wind_mps,
        wind_deg=wind_deg,
        backward_hours=backward_hours,
        particle_count=particle_count,
        uncertainty_scale=uncertainty_scale,
        is_demo=(incident_id == "OCEAN-001" and abs(current_mps - 0.35) < 0.01 and abs(wind_mps - 6.2) < 0.01)
    )


@app.post("/api/ais/filter")
def run_ais_filter(
    origin_lat: float = Body(19.280, embed=True),
    origin_lon: float = Body(71.450, embed=True),
    max_dist_km: float = Body(25.0, embed=True),
    window_start: str = Body("2026-09-06T06:00:00Z", embed=True),
    window_end: str = Body("2026-09-06T10:00:00Z", embed=True)
):
    return ais_service.filter_vessels_dynamically(
        origin_lat=origin_lat,
        origin_lon=origin_lon,
        max_dist_km=max_dist_km,
        window_start_str=window_start,
        window_end_str=window_end
    )


@app.get("/api/gis/infrastructure")
def get_gis_infrastructure():
    return gis_infra.get_maritime_layers()


@app.get("/api/candidates")
@app.get("/api/attribution/rank")
@app.post("/api/attribution/rank")
def get_candidates(
    threshold: float = Query(50.0),
    weights: Optional[Dict[str, float]] = Body(None)
):
    return attribution_service.rank_candidates(evidence_threshold=threshold, weights=weights)


@app.post("/api/counterfactual/run")
@app.post("/api/counterfactual/simulate")
def simulate_counterfactual(
    vessel_id: str = Body("VESSEL-001", embed=True),
    incident_id: str = Body("OCEAN-001", embed=True),
    custom_lat: Optional[float] = Body(None, embed=True),
    custom_lon: Optional[float] = Body(None, embed=True),
    current_mps: float = Body(0.35, embed=True),
    wind_mps: float = Body(6.2, embed=True)
):
    from app.models.schemas import GeoPoint
    custom_pt = GeoPoint(lat=custom_lat, lng=custom_lon) if custom_lat is not None and custom_lon is not None else None
    return counterfactual_service.run_hypothesis(
        vessel_id=vessel_id,
        incident_id=incident_id,
        custom_release_point=custom_pt,
        current_mps=current_mps,
        wind_mps=wind_mps
    )


@app.post("/api/reports/generate")
def generate_report(incident_id: str = Body("OCEAN-001", embed=True)):
    return report_service.generate_report(incident_id=incident_id)


# WebSocket for Real-Time Vessel Stream & Health Heartbeat
@app.websocket("/ws/ais")
async def websocket_ais_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        await websocket.send_json({
            "type": "connection_status",
            "status": "CONNECTED",
            "provider": "Multi-Source AIS Gateway (DataDocked / MyShipTracking / Sector 7 Replay)",
            "timestamp_utc": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "active_vessel_count": len(ais_provider.get_all_vessels()),
            "data_mode": "STREAMING_HYBRID"
        })

        while True:
            await asyncio.sleep(4)
            now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
            await websocket.send_json({
                "type": "heartbeat",
                "timestamp_utc": now_str,
                "data_freshness": "REAL_TIME_STREAMING",
                "data_status": "SIMULATED_REPLAY",
                "vessels": ais_provider.get_all_vessels()
            })
    except WebSocketDisconnect:
        pass
    except Exception:
        pass


# Mount static frontend build if present (for single-container Docker & Hugging Face Spaces)
import os
from fastapi.staticfiles import StaticFiles

static_dirs = ["./static", "../frontend/dist", "/app/static"]
for sdir in static_dirs:
    if os.path.exists(sdir) and os.path.isdir(sdir):
        app.mount("/", StaticFiles(directory=sdir, html=True), name="static")
        break


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
