"""
Attribution & Explainability Scoring Engine for OCEAN-EYE
Calculates evidence strength scores using weighted normalized components:
Evidence Score = 0.25*Proximity + 0.20*Temporal + 0.20*Drift + 0.15*Trajectory + 0.10*Behaviour + 0.10*AIS_Anomaly
Adheres strictly to probabilistic, non-accusatory terminology with full data provenance.
"""

import math
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from app.models.schemas import CandidateScore, EvidenceBreakdown, ProvenanceEntry, AISVessel
from app.services.ais_service import haversine_distance_km, _parse_ts


class AttributionService:
    """
    Explainable Evidence Scoring & Dynamic Candidate Ranking Service for OCEAN-EYE.
    Calculates multi-factor Bayesian evidence scores from actual AIS tracks,
    reconstructed origin region, release window, and hydrodynamic drift parameters.
    """

    def __init__(self):
        # Demo calibrated benchmark fallback (used ONLY if no dynamic input is provided)
        self._demo_benchmark_candidates = [
            {
                "vessel_id": "VESSEL-001",
                "vessel_name": "Vessel A (MT Ocean Vanguard)",
                "mmsi": "419001284",
                "vessel_type": "Crude Oil Tanker",
                "proximity_score": 96.0,
                "temporal_score": 94.0,
                "drift_score": 92.0,
                "trajectory_score": 90.0,
                "behaviour_score": 80.0,
                "ais_anomaly_score": 87.0,
                "why_higher": [
                    "Strong spatial consistency: Traversed within 0.8 km of probable origin centroid",
                    "Strong temporal overlap: Positioned in origin ellipse at 08:25 UTC (center of 06:00–10:00 UTC window)",
                    "High drift consistency: Course angle 60.5° aligns with backward transport streamlines",
                    "Trajectory compatible: Direct transit across reconstructed release axis",
                    "AIS Continuity signal: 22-min gap (08:15–08:37 UTC) with 2.6 kt speed dip (supporting evidence only)"
                ],
                "why_lower": [],
                "observed_evidence": "Sentinel-1 SAR dark slick (65.7 km²) + AIS point at 08:15 UTC (lat 19.274, lng 71.432) & 08:37 UTC.",
                "model_inference": "Backward Lagrangian simulation places origin at [19.280, 71.450] during 06:00–10:00 UTC.",
                "investigation_hypothesis": "If a release occurred from Vessel A at ~08:25 UTC, current/wind advection reconstructs observed spill geometry with 91.4% evidence consistency.",
                "provenance": [
                    ProvenanceEntry(component="Proximity (25%)", source="Terrestrial AIS & Lagrangian Ellipse", timestamp_utc="2026-09-06 08:25:00 UTC", observed_vs_inferred="Inferred Intersection", calculation_method="Geodesic minimum distance to centroid (0.8 km) -> Normalized score 96.0"),
                    ProvenanceEntry(component="Temporal Overlap (20%)", source="AIS Timestamp & Drift Release Window", timestamp_utc="2026-09-06 08:25:00 UTC", observed_vs_inferred="Observed AIS Time", calculation_method="Time delta from window center -> Normalized score 94.0"),
                    ProvenanceEntry(component="Drift Vector (20%)", source="INCOIS Current & ECMWF Wind Fields", timestamp_utc="2026-09-06 10:00:00 UTC", observed_vs_inferred="Hydrodynamic Vector Model", calculation_method="Cosine similarity between ship heading (60.5°) and drift vector (62.0°) -> Normalized score 92.0"),
                    ProvenanceEntry(component="Trajectory (15%)", source="Historical Track Points", timestamp_utc="2026-09-06 05:30-12:00 UTC", observed_vs_inferred="Observed Trajectory", calculation_method="Bounding corridor spatial intersection -> Normalized score 90.0"),
                    ProvenanceEntry(component="Operational Behaviour (10%)", source="Vessel Speed & Classification", timestamp_utc="2026-09-06 08:25:00 UTC", observed_vs_inferred="Observed Telemetry", calculation_method="Tanker profile & speed reduction analysis -> Normalized score 80.0"),
                    ProvenanceEntry(component="AIS Continuity (10%)", source="Coastal AIS Receiver Log", timestamp_utc="2026-09-06 08:15-08:37 UTC", observed_vs_inferred="Signal Anomaly Detector", calculation_method="Transmission gap duration (22 min) -> Supporting signal score 87.0")
                ]
            },
            {
                "vessel_id": "VESSEL-002",
                "vessel_name": "Vessel B (MV Bharat Star)",
                "mmsi": "419008712",
                "vessel_type": "Bulk Carrier",
                "proximity_score": 72.0,
                "temporal_score": 68.0,
                "drift_score": 65.0,
                "trajectory_score": 70.0,
                "behaviour_score": 65.0,
                "ais_anomaly_score": 62.0,
                "why_higher": [
                    "Moderate proximity: Transited 11.2 km north of probable origin centroid",
                    "Continuous AIS broadcast: Zero gaps, constant speed profile (11.4 kts)",
                    "Consistent heading across northern corridor"
                ],
                "why_lower": [
                    "Weaker temporal overlap: Transited early in release window (06:45 UTC)",
                    "Lower drift consistency: Northern offset would require higher northward current than observed",
                    "Trajectory does not intersect primary slick dispersion axis"
                ],
                "observed_evidence": "AIS track at 06:45 UTC (lat 19.380, lng 71.390, SOG 11.2 kts).",
                "model_inference": "Forward drift from Vessel B track yields slick centroid 14 km North-East of observed polygon.",
                "investigation_hypothesis": "Moderate hypothesis consistency; lower priority candidate compared to Vessel A.",
                "provenance": [
                    ProvenanceEntry(component="Proximity (25%)", source="Terrestrial AIS & Lagrangian Ellipse", timestamp_utc="2026-09-06 06:45:00 UTC", observed_vs_inferred="Inferred Distance", calculation_method="Distance to origin 11.2 km -> Normalized score 72.0"),
                    ProvenanceEntry(component="Temporal Overlap (20%)", source="AIS Timestamp", timestamp_utc="2026-09-06 06:45:00 UTC", observed_vs_inferred="Observed AIS Time", calculation_method="Early transit at 06:45 UTC -> Normalized score 68.0"),
                    ProvenanceEntry(component="Drift Vector (20%)", source="INCOIS Currents", timestamp_utc="2026-09-06 10:00:00 UTC", observed_vs_inferred="Vector Alignment", calculation_method="Vector alignment score 65.0"),
                    ProvenanceEntry(component="Trajectory (15%)", source="Historical Track Points", timestamp_utc="2026-09-06 05:30-11:30 UTC", observed_vs_inferred="Observed Track", calculation_method="Corridor alignment score 70.0"),
                    ProvenanceEntry(component="Operational Behaviour (10%)", source="Cargo Profile", timestamp_utc="2026-09-06 06:45:00 UTC", observed_vs_inferred="Observed Telemetry", calculation_method="Constant speed bulk carrier -> Normalized score 65.0"),
                    ProvenanceEntry(component="AIS Continuity (10%)", source="AIS Receiver Log", timestamp_utc="2026-09-06 06:45:00 UTC", observed_vs_inferred="Nominal Stream", calculation_method="Continuous broadcast without anomaly -> Score 62.0")
                ]
            },
            {
                "vessel_id": "VESSEL-003",
                "vessel_name": "Vessel C (MV Sagar Ratna)",
                "mmsi": "419003450",
                "vessel_type": "Container Carrier",
                "proximity_score": 55.0,
                "temporal_score": 48.0,
                "drift_score": 52.0,
                "trajectory_score": 50.0,
                "behaviour_score": 44.5,
                "ais_anomaly_score": 56.0,
                "why_higher": [
                    "Transited western periphery of surveillance bounding box",
                    "Continuous AIS broadcast without transmission gaps"
                ],
                "why_lower": [
                    "Weak temporal overlap: Cleared sector at 06:05 UTC at high speed (16.2 kts)",
                    "Divergent heading: Course 140° (SE) diverges from origin-to-slick transport axis",
                    "Substantial spatial distance (18.5 km South-West of origin center)"
                ],
                "observed_evidence": "AIS track at 06:05 UTC (lat 19.220, lng 71.430, SOG 16.0 kts).",
                "model_inference": "Hypothetical release at 06:05 UTC advects south of observed Sentinel-1 slick bounds.",
                "investigation_hypothesis": "Low hypothesis consistency; classified as Low Investigation Priority.",
                "provenance": [
                    ProvenanceEntry(component="Proximity (25%)", source="Terrestrial AIS", timestamp_utc="2026-09-06 06:05:00 UTC", observed_vs_inferred="Inferred Distance", calculation_method="Distance to origin 18.5 km -> Normalized score 55.0"),
                    ProvenanceEntry(component="Temporal Overlap (20%)", source="AIS Timestamp", timestamp_utc="2026-09-06 06:05:00 UTC", observed_vs_inferred="Observed Time", calculation_method="Cleared sector at 06:05 UTC -> Normalized score 48.0"),
                    ProvenanceEntry(component="Drift Vector (20%)", source="INCOIS Currents", timestamp_utc="2026-09-06 10:00:00 UTC", observed_vs_inferred="Vector Alignment", calculation_method="Divergent course 140° -> Normalized score 52.0"),
                    ProvenanceEntry(component="Trajectory (15%)", source="Historical Track Points", timestamp_utc="2026-09-06 05:00-08:00 UTC", observed_vs_inferred="Observed Track", calculation_method="Peripheral track -> Normalized score 50.0"),
                    ProvenanceEntry(component="Operational Behaviour (10%)", source="Container Profile", timestamp_utc="2026-09-06 06:05:00 UTC", observed_vs_inferred="Observed Telemetry", calculation_method="High constant transit speed (16.2 kts) -> Score 44.5"),
                    ProvenanceEntry(component="AIS Continuity (10%)", source="AIS Receiver Log", timestamp_utc="2026-09-06 06:05:00 UTC", observed_vs_inferred="Nominal Stream", calculation_method="Continuous broadcast -> Score 56.0")
                ]
            }
        ]

    def evaluate_vessel_dynamically(
        self,
        vessel: Any,
        origin_lat: float = 19.280,
        origin_lon: float = 71.450,
        window_start_str: str = "2026-09-06T06:00:00Z",
        window_end_str: str = "2026-09-06T10:00:00Z",
        drift_direction_deg: float = 62.0
    ) -> Dict[str, Any]:
        """
        Dynamically computes the 6 evidence component scores and provenance for any given vessel track.
        """
        # Parse inputs
        w_start = _parse_ts(window_start_str)
        w_end = _parse_ts(window_end_str)
        w_center = (w_start + w_end) / 2.0

        v_name = getattr(vessel, "name", None) or vessel.get("name", "Unknown Vessel")
        v_mmsi = getattr(vessel, "mmsi", None) or vessel.get("mmsi", "Unknown MMSI")
        v_id = getattr(vessel, "vessel_id", None) or vessel.get("vessel_id", v_mmsi)
        v_type = getattr(vessel, "vessel_type", None) or vessel.get("vessel_type", "Commercial Vessel")
        v_track = getattr(vessel, "track", None) or vessel.get("track", [])

        # 1. Proximity Score (25%)
        min_dist_km = float("inf")
        closest_pt = None
        for pt in v_track:
            lat = getattr(pt, "lat", None) or pt.get("lat", 0.0)
            lng = getattr(pt, "lng", None) or pt.get("lng", 0.0)
            d = haversine_distance_km(lat, lng, origin_lat, origin_lon)
            if d < min_dist_km:
                min_dist_km = d
                closest_pt = pt

        if min_dist_km == float("inf"):
            min_dist_km = 50.0
            prox_score = 10.0
        else:
            prox_score = max(10.0, min(100.0, 100.0 - (min_dist_km * 3.5)))
        prox_score = round(prox_score, 1)

        # 2. Temporal Overlap Score (20%)
        min_time_delta_hrs = float("inf")
        closest_time_pt = None
        has_overlap = False

        for pt in v_track:
            ts_val = getattr(pt, "timestamp", None) or pt.get("timestamp") or pt.get("time", "")
            try:
                ts = _parse_ts(ts_val)
                if w_start <= ts <= w_end:
                    has_overlap = True
                delta_hrs = abs(ts - w_center) / 3600.0
                if delta_hrs < min_time_delta_hrs:
                    min_time_delta_hrs = delta_hrs
                    closest_time_pt = pt
            except Exception:
                pass

        if not has_overlap:
            temp_score = max(10.0, 50.0 - (min_time_delta_hrs * 10.0))
        else:
            temp_score = max(20.0, min(100.0, 100.0 - (min_time_delta_hrs * 15.0)))
        temp_score = round(temp_score, 1)

        # 3. Drift Vector Consistency (20%)
        # Calculate vessel heading / course alignment with drift direction
        cog_val = 0.0
        if closest_pt:
            cog_val = getattr(closest_pt, "cog_deg", None) or closest_pt.get("cog_deg") or closest_pt.get("cog", 0.0)
        angle_diff = abs(cog_val - drift_direction_deg) % 360.0
        if angle_diff > 180.0:
            angle_diff = 360.0 - angle_diff
        cos_align = math.cos(math.radians(angle_diff))
        drift_score = round(max(15.0, min(100.0, 50.0 + 45.0 * cos_align)), 1)

        # 4. Trajectory Consistency (15%)
        traj_score = round(max(15.0, min(100.0, 100.0 - (min_dist_km * 2.5))), 1)

        # 5. Operational Behaviour Score (10%)
        type_lower = v_type.lower()
        if "tanker" in type_lower or "crude" in type_lower:
            base_b = 80.0
        elif "chemical" in type_lower or "lpg" in type_lower:
            base_b = 75.0
        elif "bulk" in type_lower or "cargo" in type_lower:
            base_b = 65.0
        elif "container" in type_lower:
            base_b = 45.0
        else:
            base_b = 40.0
        behav_score = round(base_b, 1)

        # 6. AIS Continuity / Anomaly Score (10%)
        has_anomaly = False
        anomaly_detail = getattr(vessel, "ais_anomaly_detail", None) or (vessel.get("ais_anomaly_detail") if isinstance(vessel, dict) else None)
        if getattr(vessel, "ais_anomaly_flag", False) or (isinstance(vessel, dict) and vessel.get("ais_anomaly_flag")):
            has_anomaly = True
        for pt in v_track:
            if getattr(pt, "has_anomaly", False) or (isinstance(pt, dict) and pt.get("has_anomaly")):
                has_anomaly = True

        if has_anomaly:
            ais_score = 87.0
        else:
            ais_score = 60.0

        # Provenance entries
        pt_ts_str = "Observed Telemetry"
        if closest_pt:
            pt_ts_str = getattr(closest_pt, "timestamp", None) or (closest_pt.get("timestamp") if isinstance(closest_pt, dict) else "Live")

        provenance = [
            ProvenanceEntry(
                component="Proximity (25%)",
                source="Dynamic AIS Geodesic Engine",
                timestamp_utc=str(pt_ts_str),
                observed_vs_inferred="Inferred Minimum Distance",
                calculation_method=f"Geodesic distance to origin {min_dist_km:.2f} km -> Score {prox_score}"
            ),
            ProvenanceEntry(
                component="Temporal Overlap (20%)",
                source="Drift Window Time Intersection",
                timestamp_utc=str(pt_ts_str),
                observed_vs_inferred="Observed AIS Timestamp",
                calculation_method=f"Delta to window center {min_time_delta_hrs:.2f} hrs -> Score {temp_score}"
            ),
            ProvenanceEntry(
                component="Drift Vector (20%)",
                source="Lagrangian Vector Field Model",
                timestamp_utc=str(pt_ts_str),
                observed_vs_inferred="Transport Vector Cosine Angle",
                calculation_method=f"Angle diff |{cog_val:.1f}° - {drift_direction_deg:.1f}°| = {angle_diff:.1f}° -> Score {drift_score}"
            ),
            ProvenanceEntry(
                component="Trajectory (15%)",
                source="Historical Fleet Waypoints",
                timestamp_utc=str(pt_ts_str),
                observed_vs_inferred="Observed Corridor Transit",
                calculation_method=f"Corridor proximity metric -> Score {traj_score}"
            ),
            ProvenanceEntry(
                component="Operational Behaviour (10%)",
                source="Vessel Telemetry & Classification",
                timestamp_utc=str(pt_ts_str),
                observed_vs_inferred="Vessel Class Profile",
                calculation_method=f"Classification: {v_type} -> Score {behav_score}"
            ),
            ProvenanceEntry(
                component="AIS Continuity (10%)",
                source="Receiver Stream Anomaly Filter",
                timestamp_utc=str(pt_ts_str),
                observed_vs_inferred="Signal Anomaly Classifier",
                calculation_method=f"Transmission continuity check (Anomaly={has_anomaly}) -> Score {ais_score}"
            )
        ]

        why_higher = []
        why_lower = []
        if min_dist_km <= 3.0:
            why_higher.append(f"Strong spatial proximity: Track approached within {min_dist_km:.1f} km of origin centroid")
        else:
            why_lower.append(f"Separation distance: Minimum offset of {min_dist_km:.1f} km from probable origin")

        if temp_score >= 80.0:
            why_higher.append("Strong temporal overlap: Track intersects center of estimated release window")
        else:
            why_lower.append("Temporal mismatch: Vessel transited outside optimal release window")

        if drift_score >= 80.0:
            why_higher.append(f"Drift alignment: Vessel transit vector ({cog_val:.1f}°) closely aligns with backward drift ({drift_direction_deg:.1f}°)")

        if has_anomaly:
            why_higher.append(f"AIS Signal Anomaly: {anomaly_detail or 'Transmission gap observed'}")

        return {
            "vessel_id": str(v_id),
            "vessel_name": str(v_name),
            "mmsi": str(v_mmsi),
            "vessel_type": str(v_type),
            "proximity_score": prox_score,
            "temporal_score": temp_score,
            "drift_score": drift_score,
            "trajectory_score": traj_score,
            "behaviour_score": behav_score,
            "ais_anomaly_score": ais_score,
            "why_higher": why_higher,
            "why_lower": why_lower,
            "observed_evidence": f"AIS track points in sector with min distance {min_dist_km:.1f} km.",
            "model_inference": f"Lagrangian transport model at origin [{origin_lat:.3f}, {origin_lon:.3f}].",
            "investigation_hypothesis": f"Hypothesis testing for {v_name} under observed current/wind fields.",
            "provenance": provenance
        }

    def rank_candidates(
        self,
        evidence_threshold: float = 50.0,
        weights: Optional[Dict[str, float]] = None,
        custom_candidates: Optional[List[Dict[str, Any]]] = None,
        dynamic_vessels: Optional[List[Any]] = None,
        origin_lat: float = 19.280,
        origin_lon: float = 71.450,
        window_start_str: str = "2026-09-06T06:00:00Z",
        window_end_str: str = "2026-09-06T10:00:00Z",
        drift_direction_deg: float = 62.0
    ) -> List[CandidateScore]:
        """
        Dynamically calculates normalized evidence strength scores and ranks candidates.
        """
        w_prox = 0.25
        w_temp = 0.20
        w_drift = 0.20
        w_traj = 0.15
        w_behav = 0.10
        w_ais = 0.10

        if weights:
            w_prox = weights.get("proximity", w_prox)
            w_temp = weights.get("temporal", w_temp)
            w_drift = weights.get("drift", w_drift)
            w_traj = weights.get("trajectory", w_traj)
            w_behav = weights.get("behaviour", w_behav)
            w_ais = weights.get("ais_anomaly", w_ais)

        # Determine raw candidate list
        if dynamic_vessels is not None:
            raw_list = [
                self.evaluate_vessel_dynamically(
                    v,
                    origin_lat=origin_lat,
                    origin_lon=origin_lon,
                    window_start_str=window_start_str,
                    window_end_str=window_end_str,
                    drift_direction_deg=drift_direction_deg
                )
                for v in dynamic_vessels
            ]
        elif custom_candidates is not None:
            raw_list = custom_candidates
        else:
            raw_list = self._demo_benchmark_candidates

        scores: List[CandidateScore] = []

        for item in raw_list:
            p_score = item.get("proximity_score", 50.0)
            t_score = item.get("temporal_score", 50.0)
            d_score = item.get("drift_score", 50.0)
            tr_score = item.get("trajectory_score", 50.0)
            b_score = item.get("behaviour_score", 50.0)
            a_score = item.get("ais_anomaly_score", 50.0)

            calc_score = round(
                (w_prox * p_score) +
                (w_temp * t_score) +
                (w_drift * d_score) +
                (w_traj * tr_score) +
                (w_behav * b_score) +
                (w_ais * a_score),
                1
            )

            # Assign Investigation Priority
            if calc_score < evidence_threshold:
                priority = "INSUFFICIENT_EVIDENCE"
            elif calc_score >= 85.0:
                priority = "HIGH"
            elif calc_score >= 60.0:
                priority = "MEDIUM"
            else:
                priority = "LOW"

            evidence_bd = EvidenceBreakdown(
                proximity_score=p_score,
                temporal_score=t_score,
                drift_score=d_score,
                trajectory_score=tr_score,
                behaviour_score=b_score,
                ais_anomaly_score=a_score,
                provenance_entries=item.get("provenance")
            )

            candidate_obj = CandidateScore(
                vessel_id=item["vessel_id"],
                vessel_name=item["vessel_name"],
                mmsi=item["mmsi"],
                vessel_type=item.get("vessel_type", "Commercial Vessel"),
                evidence_strength_score=calc_score,
                investigation_priority=priority,
                rank=1,
                evidence_breakdown=evidence_bd,
                why_ranked_higher=item.get("why_higher", []),
                why_ranked_lower=item.get("why_lower", []),
                observed_evidence_summary=item.get("observed_evidence", ""),
                model_inference_summary=item.get("model_inference", ""),
                investigation_hypothesis=item.get("investigation_hypothesis", ""),
                disclaimer="Evidence strength scores represent investigative priority ranking, NOT proof of legal liability."
            )
            scores.append(candidate_obj)

        scores.sort(key=lambda x: x.evidence_strength_score, reverse=True)
        for idx, s in enumerate(scores):
            s.rank = idx + 1

        return scores

    def get_candidate_by_id(self, vessel_id: str, threshold: float = 50.0) -> Optional[CandidateScore]:
        candidates = self.rank_candidates(evidence_threshold=threshold)
        for c in candidates:
            if c.vessel_id == vessel_id or c.mmsi == vessel_id:
                return c
        return None


attribution_service = AttributionService()

