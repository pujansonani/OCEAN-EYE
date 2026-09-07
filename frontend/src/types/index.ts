export interface GeoPoint {
  lat: float;
  lng: float;
}

export type float = number;

export interface SARLookAlikeCheck {
  is_warning: boolean;
  warning_type: string | null;
  description: string;
  recommended_action: string;
}

export interface SpillDetection {
  incident_id: string;
  status: string;
  confidence: number;
  area_km2: number;
  centroid: GeoPoint;
  length_km: number;
  width_km: number;
  orientation_deg: number;
  polygon: number[][];
  look_alike_check: SARLookAlikeCheck;
  sensor_name: string;
  observation_timestamp: string;
  provenance_tag: string;
}

export interface ParticleTrackPoint {
  time_utc: string;
  lat: number;
  lng: number;
  step_minutes_ago: number;
}

export interface ParticleTrajectory {
  particle_id: number;
  points: ParticleTrackPoint[];
}

export interface ProbableOriginRegion {
  center: GeoPoint;
  semi_major_km: number;
  semi_minor_km: number;
  azimuth_deg: number;
  boundary_polygon: number[][];
  confidence_level: number;
}

export interface DriftHindcastResult {
  incident_id: string;
  current_velocity_mps: number;
  current_direction_deg: number;
  wind_velocity_mps: number;
  wind_direction_deg: number;
  windage_leeway_factor: number;
  backward_hours: number;
  release_window_start: string;
  release_window_end: string;
  release_window_label: string;
  origin_confidence: number;
  probable_origin: ProbableOriginRegion;
  particle_trajectories: ParticleTrajectory[];
  methodology_note: string;
  provenance_tag: string;
}

export interface AISPoint {
  timestamp: string;
  lat: number;
  lng: number;
  sog_knots: number;
  cog_deg: number;
  heading_deg?: number;
  nav_status: string;
  has_anomaly: boolean;
  anomaly_description?: string;
}

export interface AISVessel {
  vessel_id: string;
  name: string;
  mmsi: string;
  imo: string;
  vessel_type: string;
  flag_state: string;
  length_m: number;
  beam_m: number;
  is_candidate: boolean;
  filter_stage_eliminated?: string | null;
  track: AISPoint[];
  ais_anomaly_flag: boolean;
  ais_anomaly_detail?: string | null;
}

export interface EvidenceBreakdown {
  proximity_score: number;
  temporal_score: number;
  drift_score: number;
  trajectory_score: number;
  behaviour_score: number;
  ais_anomaly_score: number;
  weights_formula_applied: string;
  design_weights_note: string;
}

export interface CandidateScore {
  vessel_id: string;
  vessel_name: string;
  mmsi: string;
  vessel_type: string;
  evidence_strength_score: number;
  investigation_priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_EVIDENCE';
  rank: number;
  evidence_breakdown: EvidenceBreakdown;
  why_ranked_higher: string[];
  why_ranked_lower: string[];
  observed_evidence_summary: string;
  model_inference_summary: string;
  investigation_hypothesis: string;
  disclaimer: string;
}

export interface CounterfactualResult {
  incident_id: string;
  vessel_id: string;
  vessel_name: string;
  hypothesis_statement: string;
  release_point_tested: GeoPoint;
  release_time_tested: string;
  simulated_slick_polygon: number[][];
  spatial_consistency: string;
  temporal_consistency: string;
  drift_consistency: string;
  overall_hypothesis_consistency: string;
  consistency_metrics: {
    iou_overlap: number;
    centroid_displacement_km: number;
    orientation_delta_deg: number;
    transport_vector_alignment?: number;
  };
  disclaimer: string;
}

export interface FilteringPipelineSummary {
  initial_detected_count: number;
  after_spatial_filter_count: number;
  after_temporal_filter_count: number;
  final_candidate_count: number;
  elimination_log: Array<{
    stage: string;
    criteria: string;
    eliminated_vessels?: Array<{ name: string; mmsi: string; reason: string }>;
    retained_candidates?: Array<{ name: string; mmsi: string; status: string }>;
  }>;
}

export interface IncidentSummary {
  id: string;
  title: string;
  status: string;
  timestamp: string;
  suspected_spill_area_km2: number;
  detection_confidence: number;
  probable_origin_status: string;
  release_time_window: string;
  candidate_vessels_count: number;
  top_candidate_vessel: string;
  top_evidence_strength: number;
  recommended_next_step: string;
  provenance_watermark: string;
}

export interface InvestigationReport {
  report_id: string;
  incident_id: string;
  generated_at: string;
  analyst_reference: string;
  incident_summary: IncidentSummary;
  detection_section: SpillDetection;
  drift_section: DriftHindcastResult;
  ais_filtering_pipeline: FilteringPipelineSummary;
  candidate_rankings: CandidateScore[];
  top_counterfactual: CounterfactualResult;
  evidence_provenance_trail: Array<{
    step_index: string;
    data_source: string;
    processing_step: string;
    timestamp_utc: string;
    model_algorithm: string;
    generated_output: string;
  }>;
  uncertainty_and_limitations: string[];
  analyst_action_recommendations: string[];
  compliance_disclaimer: string;
}

export type ActivePage =
  | 'overview'
  | 'detection'
  | 'drift'
  | 'ais'
  | 'counterfactual'
  | 'report'
  | 'responsible-ai';

export interface MapLayerControls {
  showSARBounds: boolean;
  showSpillPolygon: boolean;
  showSpillCentroid: boolean;
  showOriginRegion: boolean;
  showBackwardDrift: boolean;
  showVesselTracks: boolean;
  showCandidateMarkers: boolean;
  showCounterfactual: boolean;
}
