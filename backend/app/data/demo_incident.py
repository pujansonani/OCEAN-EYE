"""
Demo Incident Data Repository for OCEAN-EYE
Incident ID: OCEAN-001 (Offshore Oil Spill Investigation, Arabian Sea / Mumbai High Sector)
All data is synthetic demonstration data generated for SIH 2026 Round 2 evaluation.
"""

import math
from typing import List, Dict, Any

# Geometric coordinates for observed spill polygon (Lat, Lng)
# Centered around [19.425, 71.848], elongated along 158 degrees
SPILL_POLYGON_COORDS: List[List[float]] = [
    [19.510, 71.810],
    [19.490, 71.825],
    [19.460, 71.838],
    [19.425, 71.848],
    [19.385, 71.860],
    [19.340, 71.875],
    [19.310, 71.890],
    [19.315, 71.905],
    [19.348, 71.895],
    [19.395, 71.880],
    [19.440, 71.868],
    [19.480, 71.852],
    [19.515, 71.830],
    [19.520, 71.815],
    [19.510, 71.810],
]

# Probable Origin Region Ellipse boundary coords (Lat, Lng)
# Centered around [19.280, 71.450]
ORIGIN_POLYGON_COORDS: List[List[float]] = [
    [19.325, 71.430],
    [19.315, 71.465],
    [19.295, 71.490],
    [19.270, 71.495],
    [19.245, 71.470],
    [19.238, 71.435],
    [19.252, 71.410],
    [19.280, 71.405],
    [19.310, 71.412],
    [19.325, 71.430],
]

# Backward drift particle trajectories (12 representative particle streamlines)
def generate_backward_particles() -> List[Dict[str, Any]]:
    trajectories = []
    # Base offsets from spill centroid backwards to origin
    # Start at T=10:42 UTC (0 mins ago) to T=06:00 UTC (282 mins ago)
    seed_offsets = [
        (0.0, 0.0), (0.015, -0.005), (-0.02, 0.008), (0.04, -0.012),
        (-0.045, 0.015), (0.06, -0.018), (-0.07, 0.022), (0.025, 0.005),
        (-0.03, -0.008), (0.05, 0.010), (-0.055, -0.014), (0.01, -0.02)
    ]
    
    start_lat, start_lng = 19.425, 71.848
    end_lat, end_lng = 19.280, 71.450
    
    for idx, (d_lat, d_lng) in enumerate(seed_offsets):
        pts = []
        steps = 10
        for step in range(steps + 1):
            progress = step / steps
            # Add non-linear ocean current meander
            meander_lat = 0.015 * math.sin(progress * math.pi * 1.8 + idx * 0.5)
            meander_lng = 0.010 * math.cos(progress * math.pi * 1.5 + idx * 0.4)
            
            cur_lat = (start_lat + d_lat) * (1 - progress) + (end_lat + d_lat * 0.6) * progress + meander_lat
            cur_lng = (start_lng + d_lng) * (1 - progress) + (end_lng + d_lng * 0.6) * progress + meander_lng
            
            mins_ago = int(progress * 282)
            total_mins = 10 * 60 + 42 - mins_ago
            h = total_mins // 60
            m = total_mins % 60
            time_str = f"2026-09-06T{h:02d}:{m:02d}:00Z"
            
            pts.append({
                "time_utc": time_str,
                "lat": round(cur_lat, 5),
                "lng": round(cur_lng, 5),
                "step_minutes_ago": mins_ago
            })
        trajectories.append({
            "particle_id": idx + 1,
            "points": pts
        })
    return trajectories

BACKWARD_PARTICLES = generate_backward_particles()

# Synthetic AIS Fleet Database (12 vessels in the maritime surveillance sector)
SYNTHETIC_FLEET_DATA = [
    {
        "vessel_id": "VESSEL-001",
        "name": "Vessel A (MT Ocean Vanguard)",
        "mmsi": "419001284",
        "imo": "IMO 9428190",
        "vessel_type": "Crude Oil Tanker",
        "flag_state": "India [IN]",
        "length_m": 244.0,
        "beam_m": 42.0,
        "is_candidate": True,
        "filter_stage_eliminated": None,
        "ais_anomaly_flag": True,
        "ais_anomaly_detail": "22-minute AIS transmission gap detected (08:15–08:37 UTC) followed by slight speed reduction from 13.8 to 11.2 kts.",
        "track": [
            {"timestamp": "2026-09-06T05:30:00Z", "lat": 19.120, "lng": 71.050, "sog_knots": 14.1, "cog_deg": 64.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T06:15:00Z", "lat": 19.170, "lng": 71.180, "sog_knots": 13.9, "cog_deg": 63.5, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T07:00:00Z", "lat": 19.215, "lng": 71.290, "sog_knots": 13.8, "cog_deg": 62.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T07:45:00Z", "lat": 19.250, "lng": 71.375, "sog_knots": 13.5, "cog_deg": 61.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T08:15:00Z", "lat": 19.274, "lng": 71.432, "sog_knots": 13.2, "cog_deg": 60.5, "nav_status": "Under way using engine", "has_anomaly": True, "anomaly_description": "AIS Signal Lost"},
            # AIS Gap occurs right within origin ellipse at ~08:25 UTC
            {"timestamp": "2026-09-06T08:37:00Z", "lat": 19.288, "lng": 71.472, "sog_knots": 11.2, "cog_deg": 59.0, "nav_status": "Under way using engine", "has_anomaly": True, "anomaly_description": "AIS Signal Resumed with speed dip"},
            {"timestamp": "2026-09-06T09:15:00Z", "lat": 19.325, "lng": 71.565, "sog_knots": 12.0, "cog_deg": 58.5, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T10:00:00Z", "lat": 19.365, "lng": 71.670, "sog_knots": 12.8, "cog_deg": 58.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T10:45:00Z", "lat": 19.410, "lng": 71.775, "sog_knots": 13.0, "cog_deg": 57.5, "nav_status": "Under way using engine", "has_anomaly": False},
        ]
    },
    {
        "vessel_id": "VESSEL-002",
        "name": "Vessel B (MV Bharat Star)",
        "mmsi": "419008712",
        "imo": "IMO 9381024",
        "vessel_type": "Bulk Carrier",
        "flag_state": "Liberia [LR]",
        "length_m": 189.0,
        "beam_m": 32.2,
        "is_candidate": True,
        "filter_stage_eliminated": None,
        "ais_anomaly_flag": False,
        "ais_anomaly_detail": "Continuous AIS broadcast. No signal gaps or abnormal heading deviations.",
        "track": [
            {"timestamp": "2026-09-06T05:30:00Z", "lat": 19.340, "lng": 71.100, "sog_knots": 11.5, "cog_deg": 84.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T06:15:00Z", "lat": 19.360, "lng": 71.240, "sog_knots": 11.4, "cog_deg": 83.5, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T06:45:00Z", "lat": 19.380, "lng": 71.390, "sog_knots": 11.2, "cog_deg": 82.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T07:30:00Z", "lat": 19.400, "lng": 71.530, "sog_knots": 11.3, "cog_deg": 81.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T08:15:00Z", "lat": 19.420, "lng": 71.670, "sog_knots": 11.5, "cog_deg": 80.5, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T09:00:00Z", "lat": 19.440, "lng": 71.810, "sog_knots": 11.6, "cog_deg": 80.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T10:00:00Z", "lat": 19.470, "lng": 71.990, "sog_knots": 11.4, "cog_deg": 79.5, "nav_status": "Under way using engine", "has_anomaly": False},
        ]
    },
    {
        "vessel_id": "VESSEL-003",
        "name": "Vessel C (MV Sagar Ratna)",
        "mmsi": "419003450",
        "imo": "IMO 9512398",
        "vessel_type": "Container Carrier",
        "flag_state": "Panama [PA]",
        "length_m": 260.0,
        "beam_m": 32.5,
        "is_candidate": True,
        "filter_stage_eliminated": None,
        "ais_anomaly_flag": False,
        "ais_anomaly_detail": "Continuous AIS broadcast. Minor 4-degree course trim at 06:10 UTC.",
        "track": [
            {"timestamp": "2026-09-06T05:00:00Z", "lat": 19.380, "lng": 71.280, "sog_knots": 16.5, "cog_deg": 142.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T05:45:00Z", "lat": 19.300, "lng": 71.360, "sog_knots": 16.2, "cog_deg": 140.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T06:15:00Z", "lat": 19.220, "lng": 71.430, "sog_knots": 16.0, "cog_deg": 139.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T07:00:00Z", "lat": 19.120, "lng": 71.520, "sog_knots": 16.4, "cog_deg": 138.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T08:00:00Z", "lat": 18.980, "lng": 71.640, "sog_knots": 16.6, "cog_deg": 137.0, "nav_status": "Under way using engine", "has_anomaly": False},
        ]
    },
    # 9 Additional vessels in the sector demonstrating spatial & temporal filtering
    {
        "vessel_id": "VESSEL-004",
        "name": "MV Western Breeze",
        "mmsi": "419004512",
        "imo": "IMO 9210984",
        "vessel_type": "Offshore Supply Vessel",
        "flag_state": "India [IN]",
        "length_m": 75.0,
        "beam_m": 16.0,
        "is_candidate": False,
        "filter_stage_eliminated": "Stage 2 (Temporal)",
        "ais_anomaly_flag": False,
        "ais_anomaly_detail": None,
        "track": [
            {"timestamp": "2026-09-06T01:00:00Z", "lat": 19.260, "lng": 71.440, "sog_knots": 8.0, "cog_deg": 45.0, "nav_status": "Engaged in towing", "has_anomaly": False},
            {"timestamp": "2026-09-06T03:30:00Z", "lat": 19.340, "lng": 71.550, "sog_knots": 8.2, "cog_deg": 46.0, "nav_status": "Engaged in towing", "has_anomaly": False},
        ]
    },
    {
        "vessel_id": "VESSEL-005",
        "name": "MT Al-Khor Chemist",
        "mmsi": "419005991",
        "imo": "IMO 9645011",
        "vessel_type": "Chemical Tanker",
        "flag_state": "Marshall Islands [MH]",
        "length_m": 145.0,
        "beam_m": 24.0,
        "is_candidate": False,
        "filter_stage_eliminated": "Stage 2 (Temporal)",
        "ais_anomaly_flag": False,
        "ais_anomaly_detail": None,
        "track": [
            {"timestamp": "2026-09-06T12:00:00Z", "lat": 19.270, "lng": 71.460, "sog_knots": 12.0, "cog_deg": 190.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T14:30:00Z", "lat": 19.110, "lng": 71.410, "sog_knots": 12.2, "cog_deg": 191.0, "nav_status": "Under way using engine", "has_anomaly": False},
        ]
    },
    {
        "vessel_id": "VESSEL-006",
        "name": "MV Coastal Explorer",
        "mmsi": "419006118",
        "imo": "IMO 9128472",
        "vessel_type": "General Cargo",
        "flag_state": "Singapore [SG]",
        "length_m": 120.0,
        "beam_m": 20.0,
        "is_candidate": False,
        "filter_stage_eliminated": "Stage 1 (Spatial)",
        "ais_anomaly_flag": False,
        "ais_anomaly_detail": None,
        "track": [
            {"timestamp": "2026-09-06T07:00:00Z", "lat": 19.850, "lng": 72.100, "sog_knots": 10.5, "cog_deg": 170.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T09:00:00Z", "lat": 19.650, "lng": 72.150, "sog_knots": 10.4, "cog_deg": 169.0, "nav_status": "Under way using engine", "has_anomaly": False},
        ]
    },
    {
        "vessel_id": "VESSEL-007",
        "name": "MT Gulf Pearl",
        "mmsi": "419007204",
        "imo": "IMO 9781290",
        "vessel_type": "LPG Tanker",
        "flag_state": "Liberia [LR]",
        "length_m": 174.0,
        "beam_m": 28.0,
        "is_candidate": False,
        "filter_stage_eliminated": "Stage 1 (Spatial)",
        "ais_anomaly_flag": False,
        "ais_anomaly_detail": None,
        "track": [
            {"timestamp": "2026-09-06T06:30:00Z", "lat": 18.650, "lng": 71.100, "sog_knots": 15.0, "cog_deg": 90.0, "nav_status": "Under way using engine", "has_anomaly": False},
            {"timestamp": "2026-09-06T08:30:00Z", "lat": 18.660, "lng": 71.450, "sog_knots": 14.8, "cog_deg": 89.0, "nav_status": "Under way using engine", "has_anomaly": False},
        ]
    },
    {
        "vessel_id": "VESSEL-008",
        "name": "FV Matsya Kanya",
        "mmsi": "419008910",
        "imo": "IMO N/A",
        "vessel_type": "Fishing Trawler",
        "flag_state": "India [IN]",
        "length_m": 28.0,
        "beam_m": 7.0,
        "is_candidate": False,
        "filter_stage_eliminated": "Stage 1 (Spatial)",
        "ais_anomaly_flag": False,
        "ais_anomaly_detail": None,
        "track": [
            {"timestamp": "2026-09-06T06:00:00Z", "lat": 19.680, "lng": 71.550, "sog_knots": 4.5, "cog_deg": 220.0, "nav_status": "Engaged in fishing", "has_anomaly": False},
        ]
    },
    {
        "vessel_id": "VESSEL-009",
        "name": "MV Deccan Trader",
        "mmsi": "419009112",
        "imo": "IMO 9345871",
        "vessel_type": "Bulk Carrier",
        "flag_state": "India [IN]",
        "length_m": 190.0,
        "beam_m": 32.0,
        "is_candidate": False,
        "filter_stage_eliminated": "Stage 1 (Spatial)",
        "ais_anomaly_flag": False,
        "ais_anomaly_detail": None,
        "track": [
            {"timestamp": "2026-09-06T08:00:00Z", "lat": 19.920, "lng": 71.900, "sog_knots": 12.0, "cog_deg": 135.0, "nav_status": "Under way using engine", "has_anomaly": False},
        ]
    },
    {
        "vessel_id": "VESSEL-010",
        "name": "MT Indus Pioneer",
        "mmsi": "419010334",
        "imo": "IMO 9456720",
        "vessel_type": "Oil Products Tanker",
        "flag_state": "India [IN]",
        "length_m": 182.0,
        "beam_m": 27.4,
        "is_candidate": False,
        "filter_stage_eliminated": "Stage 1 (Spatial)",
        "ais_anomaly_flag": False,
        "ais_anomaly_detail": None,
        "track": [
            {"timestamp": "2026-09-06T07:15:00Z", "lat": 18.820, "lng": 71.900, "sog_knots": 13.5, "cog_deg": 315.0, "nav_status": "Under way using engine", "has_anomaly": False},
        ]
    },
    {
        "vessel_id": "VESSEL-011",
        "name": "MV Konkan Express",
        "mmsi": "419011456",
        "imo": "IMO 9187342",
        "vessel_type": "Ro-Ro Cargo",
        "flag_state": "Cyprus [CY]",
        "length_m": 160.0,
        "beam_m": 24.5,
        "is_candidate": False,
        "filter_stage_eliminated": "Stage 1 (Spatial)",
        "ais_anomaly_flag": False,
        "ais_anomaly_detail": None,
        "track": [
            {"timestamp": "2026-09-06T09:30:00Z", "lat": 19.750, "lng": 71.300, "sog_knots": 17.0, "cog_deg": 110.0, "nav_status": "Under way using engine", "has_anomaly": False},
        ]
    },
    {
        "vessel_id": "VESSEL-012",
        "name": "Tug Samudra Rakshak",
        "mmsi": "419012990",
        "imo": "IMO 8920194",
        "vessel_type": "Tug / Offshore Support",
        "flag_state": "India [IN]",
        "length_m": 45.0,
        "beam_m": 12.0,
        "is_candidate": False,
        "filter_stage_eliminated": "Stage 1 (Spatial)",
        "ais_anomaly_flag": False,
        "ais_anomaly_detail": None,
        "track": [
            {"timestamp": "2026-09-06T06:00:00Z", "lat": 19.550, "lng": 72.300, "sog_knots": 6.5, "cog_deg": 270.0, "nav_status": "Restricted maneuverability", "has_anomaly": False},
        ]
    },
]

# Simulated Counterfactual Slick Polygon for Vessel A (High alignment with observed spill)
COUNTERFACTUAL_VESSEL_A_SLICK: List[List[float]] = [
    [19.505, 71.815],
    [19.488, 71.828],
    [19.458, 71.840],
    [19.422, 71.850],
    [19.382, 71.862],
    [19.338, 71.878],
    [19.312, 71.892],
    [19.318, 71.902],
    [19.350, 71.892],
    [19.398, 71.878],
    [19.442, 71.865],
    [19.478, 71.850],
    [19.512, 71.828],
    [19.518, 71.818],
    [19.505, 71.815],
]

# Simulated Counterfactual Slick Polygon for Vessel B (Drifted further North-East, low overlap)
COUNTERFACTUAL_VESSEL_B_SLICK: List[List[float]] = [
    [19.580, 71.910],
    [19.560, 71.925],
    [19.525, 71.940],
    [19.490, 71.955],
    [19.450, 71.970],
    [19.440, 71.985],
    [19.470, 71.975],
    [19.510, 71.960],
    [19.550, 71.945],
    [19.585, 71.925],
    [19.580, 71.910],
]

# Simulated Counterfactual Slick Polygon for Vessel C (Drifted further South-East)
COUNTERFACTUAL_VESSEL_C_SLICK: List[List[float]] = [
    [19.350, 71.740],
    [19.320, 71.765],
    [19.290, 71.785],
    [19.260, 71.810],
    [19.250, 71.825],
    [19.280, 71.815],
    [19.320, 71.790],
    [19.355, 71.760],
    [19.350, 71.740],
]
