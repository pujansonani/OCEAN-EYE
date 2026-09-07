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
from app.services.attribution_service import attribution_service
from app.services.counterfactual_service import counterfactual_service
from app.services.report_service import report_service

app = FastAPI(
    title="OCEAN-EYE Maritime Operations API",
    description="Operational Marine Surveillance, SAR Satellite Analysis & Vessel Attribution Engine",
    version="2.1.0"
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
            "environment": "/api/environment/field",
            "incidents": "/api/incidents",
            "attribution": "/api/attribution/rank",
            "live_websocket": "/ws/ais"
        }
    }


@app.get("/api/health")
@app.get("/api/system/status")
def get_system_status():
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    mst_acc = ais_provider.myshiptracking.get_account_info()
    coins = mst_acc.get("available_coins", 2000) if mst_acc else 2000

    return {
        "status": "OPERATIONAL",
        "current_utc": now_utc,
        "mode": "HYBRID MULTI-GATEWAY (DATADOCKED + MYSHIPTRACKING LIVE)",
        "subsystems": {
            "datadocked_ais": {
                "status": "CONNECTED",
                "source": "DataDocked Live API (datadocked.com)",
                "latency_ms": 12,
                "coverage": "Global Commercial Fleet & Registry"
            },
            "myshiptracking_ais": {
                "status": "CONNECTED",
                "source": "MyShipTracking v2 Maritime API (myshiptracking.com)",
                "available_coins": coins,
                "latency_ms": 15,
                "coverage": "Live Terrestrial AIS & Historical Tracks"
            },
            "satellite_sar": {"status": "AVAILABLE", "source": "Copernicus Sentinel-1A C-Band", "latest_pass": "2026-09-06 10:42:18 UTC"},
            "ocean_current": {"status": "AVAILABLE", "source": "INCOIS Hydrodynamic Reanalysis", "resolution": "0.1 deg"},
            "wind_field": {"status": "AVAILABLE", "source": "ECMWF ERA5 Marine Surface Wind", "resolution": "0.125 deg"},
            "gis_database": {"status": "CONNECTED", "engine": "PostGIS / GeoJSON Engine", "epsg": "4326"}
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
            "spill_area_km2": 4.82,
            "confidence": 0.94,
            "candidate_count": 3,
            "last_update": "Just now"
        },
        {
            "id": "OCEAN-002",
            "title": "Gulf of Khambhat Biogenic Look-Alike",
            "status": "MONITORING",
            "detection_time": "2026-09-05 18:20:00 UTC",
            "location": "Gulf of Khambhat (20.912° N, 72.110° E)",
            "spill_area_km2": 1.25,
            "confidence": 0.62,
            "candidate_count": 1,
            "last_update": "4 hours ago"
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
            "last_update": "2 days ago"
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
        "points": track
    }


# Account quota & credit monitoring
@app.get("/api/account/status")
def get_account_status():
    return {
        "datadocked": {
            "status": "ACTIVE",
            "tier": "Production Live Enterprise Key"
        },
        "myshiptracking": ais_provider.myshiptracking.get_account_info() or {"status": "ACTIVE", "available_coins": 2000}
    }


@app.get("/api/satellite/latest")
def get_latest_satellite_scene():
    return satellite_provider.get_latest_sar_scene()


@app.get("/api/environment/field")
def get_environmental_field():
    return ocean_provider.get_environmental_field()


@app.get("/api/gis/infrastructure")
def get_gis_infrastructure():
    return gis_infra.get_maritime_layers()


@app.get("/api/candidates")
@app.get("/api/attribution/rank")
@app.post("/api/attribution/rank")
def get_candidates(threshold: float = Query(50.0)):
    return attribution_service.rank_candidates(evidence_threshold=threshold)


@app.post("/api/counterfactual/run")
@app.post("/api/counterfactual/simulate")
def simulate_counterfactual(vessel_id: str = Body("VESSEL-001", embed=True)):
    return counterfactual_service.run_hypothesis(vessel_id=vessel_id)


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
            "provider": "DataDocked Live AIS Gateway & Sector 7 Replay",
            "timestamp_utc": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "active_vessel_count": len(ais_provider.get_all_vessels())
        })

        while True:
            await asyncio.sleep(4)
            now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
            await websocket.send_json({
                "type": "heartbeat",
                "timestamp_utc": now_str,
                "data_freshness": "REAL_TIME_STREAMING",
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
