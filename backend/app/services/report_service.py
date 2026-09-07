"""
Investigation Report Generation Service for OCEAN-EYE
Compiles standardized intelligence dossiers distinguishing Observed Evidence vs
Model Inference vs Investigation Hypotheses with complete Evidence Provenance audit trails.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone
from app.models.schemas import InvestigationReport, IncidentSummary
from app.services.detection_service import detection_service
from app.services.drift_service import drift_service
from app.services.ais_service import ais_service
from app.services.attribution_service import attribution_service
from app.services.counterfactual_service import counterfactual_service


class ReportService:
    """
    Standardized Maritime Intelligence Report Compiler.
    """

    def generate_report(
        self,
        incident_id: str = "OCEAN-001",
        analyst_reference: str = "MGIU-07 / Coast Guard Liaison"
    ) -> InvestigationReport:
        detection = detection_service.detect_spill(incident_id=incident_id)
        drift = drift_service.backtrack(incident_id=incident_id)
        pipeline = ais_service.get_filtering_pipeline_summary()
        candidates = attribution_service.rank_candidates()
        top_counterfactual = counterfactual_service.run_hypothesis(vessel_id="VESSEL-001")

        summary = IncidentSummary(
            id=incident_id,
            title="Offshore Oil Spill Investigation (Arabian Sea / Mumbai High Sector)",
            status="Under Investigation",
            timestamp="2026-09-06T10:42:00Z",
            suspected_spill_area_km2=detection.area_km2,
            detection_confidence=detection.confidence,
            probable_origin_status="Estimated via Lagrangian Backward Drift Hindcasting",
            release_time_window="06:00–10:00 UTC",
            candidate_vessels_count=len(candidates),
            top_candidate_vessel=f"{candidates[0].vessel_name} (MMSI {candidates[0].mmsi})",
            top_evidence_strength=candidates[0].evidence_strength_score,
            recommended_next_step="Independent human analyst verification, airborne reconnaissance, and SAR look-alike ground truth"
        )

        provenance_trail = [
            {
                "step_index": "1",
                "data_source": "Copernicus Sentinel-1 SAR C-Band",
                "processing_step": "Backscatter Thresholding & Morphological Segmentation",
                "timestamp_utc": "2026-09-06T10:45:12Z",
                "model_algorithm": "OCEAN-EYE SAR Dark-Slick Segmentation Adapter v2.4",
                "generated_output": "Spill Polygon (Area: 65.7 km², Centroid: [19.425, 71.848], Length: 22 km)"
            },
            {
                "step_index": "2",
                "data_source": "INCOIS / ECMWF Ocean Current & Surface Wind Reanalysis",
                "processing_step": "2D Lagrangian Backward Particle Transport Hindcasting",
                "timestamp_utc": "2026-09-06T10:48:30Z",
                "model_algorithm": "Hydrodynamic 4.7h Backtracking Simulation",
                "generated_output": "Probable Origin Region Ellipse ([19.280, 71.450]) & Release Window 06:00–10:00 UTC"
            },
            {
                "step_index": "3",
                "data_source": "Historical Terrestrial & Satellite AIS Fleet Feed",
                "processing_step": "Spatiotemporal Corridor & Release Window Filtration (12 -> 5 -> 3)",
                "timestamp_utc": "2026-09-06T10:50:15Z",
                "model_algorithm": "Geospatial Bounding Box & Temporal Intersect Filter",
                "generated_output": "3 Candidate Vessels: Vessel A, Vessel B, Vessel C"
            },
            {
                "step_index": "4",
                "data_source": "Multi-Source Correlated Telemetry & Anomaly Analytics",
                "processing_step": "Multi-Factor Explainable Evidence Scoring & Ranking",
                "timestamp_utc": "2026-09-06T10:52:00Z",
                "model_algorithm": "6-Factor Weighted Evidence Matrix (Formula applied)",
                "generated_output": "Vessel A (91.4 HIGH), Vessel B (67.8 MEDIUM), Vessel C (51.3 LOW)"
            },
            {
                "step_index": "5",
                "data_source": "Forward Plume Hypothesis Simulator",
                "processing_step": "Counterfactual Plume Stress-Testing & Overlap Scoring",
                "timestamp_utc": "2026-09-06T10:55:00Z",
                "model_algorithm": "Forward Lagrangian Transport & IoU Geometric Consistency Evaluator",
                "generated_output": "Hypothesis Consistency HIGH for Vessel A (IoU 0.88, centroid delta 0.9 km)"
            }
        ]

        uncertainty_notes = [
            "SAR Dark Feature Ambiguity: Satellite dark patches can arise from natural biogenic slicks, low wind calm water, or grease ice. Look-alike check indicates baseline nominal risk, but ground validation is required.",
            "Hydrodynamic Model Resolution: Drift hindcasting relies on mesoscale current and wind grids (0.35 m/s @ 65°, 6.2 m/s @ 240°). Sub-mesoscale coastal eddies introduce spatial uncertainty represented by the origin dispersion ellipse.",
            "AIS Transmission Integrity: AIS anomalies (e.g. the 22-min gap on Vessel A) provide supporting evidence of unrecorded movement but do not prove intentional shutoff or operational discharge.",
            "Legal Attribution Boundary: Evidence Strength Scores (e.g. 91.4) represent investigative priority rankings, NOT legal liability or guilt."
        ]

        recommendations = [
            "Deploy Maritime Patrol Aircraft (MPA) or Coast Guard interceptor for visual and FLIR thermal sensor verification.",
            "Cross-examine port state control records and bunkering/sludge logbooks for Candidate Vessel A upon next port of call.",
            "Request high-resolution optical satellite constellation tasking over the origin corridor to search for lingering emulsion sheens.",
            "Human analyst sign-off is mandatory before forwarding intelligence dossiers to judicial or regulatory enforcement authorities."
        ]

        disclaimer = (
            "RESPONSIBLE AI INVESTIGATION SUPPORT NOTICE: This report was compiled by OCEAN-EYE "
            "as a decision-support and investigative triage tool for maritime authorities. "
            "The contents represent probabilistic hypotheses and model inferences. "
            "This system does not prove legal guilt or sole responsibility."
        )

        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        return InvestigationReport(
            report_id=f"MGIU-REP-{incident_id}-20260906",
            incident_id=incident_id,
            generated_at=now_str,
            analyst_reference=analyst_reference,
            incident_summary=summary,
            detection_section=detection,
            drift_section=drift,
            ais_filtering_pipeline=pipeline,
            candidate_rankings=candidates,
            top_counterfactual=top_counterfactual,
            evidence_provenance_trail=provenance_trail,
            uncertainty_and_limitations=uncertainty_notes,
            analyst_action_recommendations=recommendations,
            compliance_disclaimer=disclaimer
        )


report_service = ReportService()
