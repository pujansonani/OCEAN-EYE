"""
Attribution & Explainability Scoring Engine for OCEAN-EYE
Calculates evidence strength scores using weighted normalized components:
Evidence Score = 0.25*Proximity + 0.20*Temporal + 0.20*Drift + 0.15*Trajectory + 0.10*Behaviour + 0.10*AIS_Anomaly
Adheres strictly to probabilistic, non-accusatory terminology.
"""

from typing import List, Optional, Dict, Any
from app.models.schemas import CandidateScore, EvidenceBreakdown


class AttributionService:
    """
    Explainable Evidence Scoring & Candidate Ranking Service.
    """

    def __init__(self):
        # Default component matrices for controlled demonstration
        self._raw_candidates = [
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
                    "AIS Anomaly present: 22-min gap (08:15–08:37 UTC) with 2.6 kt speed dip (supporting evidence only)"
                ],
                "why_lower": [],
                "observed_evidence": "Sentinel-1 SAR dark slick (65.7 km²) + AIS point at 08:15 UTC (lat 19.274, lng 71.432) & 08:37 UTC.",
                "model_inference": "Backward Lagrangian simulation places origin at [19.280, 71.450] during 06:00–10:00 UTC.",
                "investigation_hypothesis": "If a release occurred from Vessel A at ~08:25 UTC, current/wind advection reconstructs observed spill geometry with 91.4% evidence consistency."
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
                "investigation_hypothesis": "Moderate hypothesis consistency; lower priority candidate compared to Vessel A."
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
                "investigation_hypothesis": "Low hypothesis consistency; classified as Low Investigation Priority."
            }
        ]

    def rank_candidates(
        self,
        evidence_threshold: float = 50.0,
        weights: Optional[Dict[str, float]] = None
    ) -> List[CandidateScore]:
        """
        Calculates normalized evidence strength scores and ranks candidates.
        If score < evidence_threshold, flags priority appropriately.
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

        scores: List[CandidateScore] = []

        for item in self._raw_candidates:
            p_score = item["proximity_score"]
            t_score = item["temporal_score"]
            d_score = item["drift_score"]
            tr_score = item["trajectory_score"]
            b_score = item["behaviour_score"]
            a_score = item["ais_anomaly_score"]

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
                ais_anomaly_score=a_score
            )

            candidate_obj = CandidateScore(
                vessel_id=item["vessel_id"],
                vessel_name=item["vessel_name"],
                mmsi=item["mmsi"],
                vessel_type=item["vessel_type"],
                evidence_strength_score=calc_score,
                investigation_priority=priority,
                rank=1,  # will sort below
                evidence_breakdown=evidence_bd,
                why_ranked_higher=item["why_higher"],
                why_ranked_lower=item["why_lower"],
                observed_evidence_summary=item["observed_evidence"],
                model_inference_summary=item["model_inference"],
                investigation_hypothesis=item["investigation_hypothesis"],
                disclaimer="Demo Evidence Scores — Not probability of guilt. Supports investigative triage only."
            )
            scores.append(candidate_obj)

        # Sort descending by calculated evidence strength score
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
