"""
Pydantic schemas and data models for OCEAN-EYE Investigation-Support System.
Strictly adheres to probabilistic, non-accusatory terminology.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class GeoPoint(BaseModel):
    lat: float
    lng: float


class GeoPolygon(BaseModel):
    coordinates: List[List[float]]  # [[lat, lng], [lat, lng], ...]


class SARLookAlikeCheck(BaseModel):
    is_warning: bool = False
    warning_type: Optional[str] = None  # "Low-Wind Region", "Biogenic Film", "Natural Seep", "None"
    description: str = "Nominal dark signature backscatter profile. Look-alike risk within baseline bounds."
    recommended_action: str = "Proceed with environmental multi-source correlation."


class SpillDetection(BaseModel):
    incident_id: str
    status: str = "Suspected Oil Slick"
    confidence: float = 0.86  # Detection Confidence (Demo value)
    area_km2: float = 65.7
    centroid: GeoPoint = Field(default_factory=lambda: GeoPoint(lat=19.425, lng=71.848))
    length_km: float = 22.0
    width_km: float = 4.6
    orientation_deg: float = 158.0
    polygon: List[List[float]] = []  # Outer boundary coords
    look_alike_check: SARLookAlikeCheck = Field(default_factory=SARLookAlikeCheck)
    sensor_name: str = "Sentinel-1 SAR C-Band (IW Mode - VV/VH)"
    observation_timestamp: str = "2026-09-06T10:42:00Z"
    provenance_tag: str = "Synthetic SAR Demonstration Image"


class ParticleTrackPoint(BaseModel):
    time_utc: str
    lat: float
    lng: float
    step_minutes_ago: int


class ParticleTrajectory(BaseModel):
    particle_id: int
    points: List[ParticleTrackPoint]


class ProbableOriginRegion(BaseModel):
    center: GeoPoint
    semi_major_km: float
    semi_minor_km: float
    azimuth_deg: float
    boundary_polygon: List[List[float]]
    confidence_level: float = 0.72  # Origin Confidence


class DriftHindcastResult(BaseModel):
    incident_id: str
    current_velocity_mps: float = 0.35
    current_direction_deg: float = 65.0  # ENE
    wind_velocity_mps: float = 6.2
    wind_direction_deg: float = 240.0  # WSW
    windage_leeway_factor: float = 0.03
    backward_hours: float = 4.7
    release_window_start: str = "2026-09-06T06:00:00Z"
    release_window_end: str = "2026-09-06T10:00:00Z"
    release_window_label: str = "06:00–10:00 UTC"
    origin_confidence: float = 0.72
    probable_origin: ProbableOriginRegion
    particle_trajectories: List[ParticleTrajectory]
    methodology_note: str = (
        "Origin estimate is reconstructed from historical environmental conditions and is "
        "subject to uncertainty in current, wind, and spill dynamics."
    )
    provenance_tag: str = "Synthetic Demonstration Environmental Conditions"


class AISPoint(BaseModel):
    timestamp: str
    lat: float
    lng: float
    sog_knots: float  # Speed over ground
    cog_deg: float    # Course over ground
    heading_deg: Optional[float] = None
    nav_status: str = "Under way using engine"
    has_anomaly: bool = False
    anomaly_description: Optional[str] = None


class AISVessel(BaseModel):
    vessel_id: str
    name: str
    mmsi: str
    imo: str
    vessel_type: str
    flag_state: str
    length_m: float
    beam_m: float
    is_candidate: bool
    filter_stage_eliminated: Optional[str] = None  # None if candidate, "Stage 1 (Spatial)" or "Stage 2 (Temporal)"
    track: List[AISPoint]
    ais_anomaly_flag: bool = False
    ais_anomaly_detail: Optional[str] = None


class EvidenceBreakdown(BaseModel):
    proximity_score: float = Field(..., description="Proximity to probable origin (0-100), weight 25%")
    temporal_score: float = Field(..., description="Temporal overlap with release window (0-100), weight 20%")
    drift_score: float = Field(..., description="Drift consistency vector alignment (0-100), weight 20%")
    trajectory_score: float = Field(..., description="Trajectory compatibility with origin corridor (0-100), weight 15%")
    behaviour_score: float = Field(..., description="Operational & speed profile consistency (0-100), weight 10%")
    ais_anomaly_score: float = Field(..., description="AIS transmission continuity (0-100), weight 10%")
    weights_formula_applied: str = (
        "0.25*Proximity + 0.20*Temporal + 0.20*Drift + 0.15*Trajectory + 0.10*Behaviour + 0.10*AIS_Anomaly"
    )
    design_weights_note: str = (
        "These weights are used for prototype demonstration. Production calibration would require "
        "labelled historical incidents and validation."
    )


class CandidateScore(BaseModel):
    vessel_id: str
    vessel_name: str
    mmsi: str
    vessel_type: str
    evidence_strength_score: float  # e.g., 91.4 (Demo Evidence Scores — Not probability of guilt)
    investigation_priority: str     # "HIGH", "MEDIUM", "LOW", "INSUFFICIENT_EVIDENCE"
    rank: int
    evidence_breakdown: EvidenceBreakdown
    why_ranked_higher: List[str]
    why_ranked_lower: List[str]
    observed_evidence_summary: str
    model_inference_summary: str
    investigation_hypothesis: str
    disclaimer: str = "Demo Evidence Scores — Not probability of guilt. Supports investigative triage only."


class CounterfactualResult(BaseModel):
    incident_id: str
    vessel_id: str
    vessel_name: str
    hypothesis_statement: str
    release_point_tested: GeoPoint
    release_time_tested: str
    simulated_slick_polygon: List[List[float]]
    spatial_consistency: str  # "HIGH", "MEDIUM", "LOW"
    temporal_consistency: str
    drift_consistency: str
    overall_hypothesis_consistency: str
    consistency_metrics: Dict[str, float]  # IoU overlap, centroid displacement km, orientation delta deg
    disclaimer: str = (
        "Counterfactual verification supports investigation prioritization. "
        "It does not establish legal responsibility."
    )


class FilteringPipelineSummary(BaseModel):
    initial_detected_count: int = 12
    after_spatial_filter_count: int = 5
    after_temporal_filter_count: int = 3
    final_candidate_count: int = 3
    elimination_log: List[Dict[str, Any]]


class IncidentSummary(BaseModel):
    id: str = "OCEAN-001"
    title: str = "Offshore Oil Spill Investigation (Arabian Sea / Mumbai High Sector)"
    status: str = "Under Investigation"
    timestamp: str = "2026-09-06T10:42:00Z"
    suspected_spill_area_km2: float = 65.7
    detection_confidence: float = 0.86
    probable_origin_status: str = "Estimated via Backward Drift Hindcasting"
    release_time_window: str = "06:00–10:00 UTC"
    candidate_vessels_count: int = 3
    top_candidate_vessel: str = "Vessel A (MT Ocean Vanguard)"
    top_evidence_strength: float = 91.4
    recommended_next_step: str = "Independent human analyst verification & SAR look-alike ground truth"
    provenance_watermark: str = "SYNTHETIC DEMONSTRATION DATA — SIH 2026 ROUND 2"


class InvestigationReport(BaseModel):
    report_id: str
    incident_id: str
    generated_at: str
    analyst_reference: str = "Maritime Geospatial Investigation Unit (MGIU-07)"
    incident_summary: IncidentSummary
    detection_section: SpillDetection
    drift_section: DriftHindcastResult
    ais_filtering_pipeline: FilteringPipelineSummary
    candidate_rankings: List[CandidateScore]
    top_counterfactual: CounterfactualResult
    evidence_provenance_trail: List[Dict[str, str]]
    uncertainty_and_limitations: List[str]
    analyst_action_recommendations: List[str]
    compliance_disclaimer: str
