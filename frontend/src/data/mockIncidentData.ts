import {
  SpillDetection,
  DriftHindcastResult,
  AISVessel,
  FilteringPipelineSummary,
  CandidateScore,
  CounterfactualResult,
  InvestigationReport,
  IncidentSummary
} from '../types';

export const MOCK_SPILL_POLYGON: number[][] = [
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
];

export const MOCK_ORIGIN_POLYGON: number[][] = [
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
];

export const MOCK_COUNTERFACTUAL_VESSEL_A: number[][] = [
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
];

export const MOCK_COUNTERFACTUAL_VESSEL_B: number[][] = [
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
];

export const MOCK_COUNTERFACTUAL_VESSEL_C: number[][] = [
  [19.350, 71.740],
  [19.320, 71.765],
  [19.290, 71.785],
  [19.260, 71.810],
  [19.250, 71.825],
  [19.280, 71.815],
  [19.320, 71.790],
  [19.355, 71.760],
  [19.350, 71.740],
];

export const MOCK_INCIDENT_SUMMARY: IncidentSummary = {
  id: "OCEAN-001",
  title: "Offshore Oil Spill Investigation (Arabian Sea / Mumbai High Sector)",
  status: "Under Investigation",
  timestamp: "2026-09-06T10:42:00Z",
  suspected_spill_area_km2: 65.7,
  detection_confidence: 0.86,
  probable_origin_status: "Estimated via Lagrangian Backward Drift Hindcasting",
  release_time_window: "06:00–10:00 UTC",
  candidate_vessels_count: 3,
  top_candidate_vessel: "Vessel A (MT Ocean Vanguard)",
  top_evidence_strength: 91.4,
  recommended_next_step: "Independent human analyst verification & SAR look-alike ground truth",
  provenance_watermark: "SYNTHETIC DEMONSTRATION DATA — SIH 2026 ROUND 2"
};

export const MOCK_DETECTION: SpillDetection = {
  incident_id: "OCEAN-001",
  status: "Suspected Oil Slick",
  confidence: 0.86,
  area_km2: 65.7,
  centroid: { lat: 19.425, lng: 71.848 },
  length_km: 22.0,
  width_km: 4.6,
  orientation_deg: 158.0,
  polygon: MOCK_SPILL_POLYGON,
  look_alike_check: {
    is_warning: false,
    warning_type: null,
    description: "Nominal VV/VH polarization backscatter contrast ratio (-4.8 dB). High boundary gradient.",
    recommended_action: "Proceed to physical backward drift hindcasting."
  },
  sensor_name: "Sentinel-1 SAR C-Band (IW Mode - VV/VH)",
  observation_timestamp: "2026-09-06T10:42:00Z",
  provenance_tag: "Synthetic SAR Demonstration Image"
};

const generateMockParticles = () => {
  const seedOffsets = [
    [0.0, 0.0], [0.015, -0.005], [-0.02, 0.008], [0.04, -0.012],
    [-0.045, 0.015], [0.06, -0.018], [-0.07, 0.022], [0.025, 0.005],
    [-0.03, -0.008], [0.05, 0.010], [-0.055, -0.014], [0.01, -0.02]
  ];
  const startLat = 19.425;
  const startLng = 71.848;
  const endLat = 19.280;
  const endLng = 71.450;

  return seedOffsets.map(([dLat, dLng], idx) => {
    const pts = [];
    const steps = 10;
    for (let step = 0; step <= steps; step++) {
      const progress = step / steps;
      const meanderLat = 0.015 * Math.sin(progress * Math.PI * 1.8 + idx * 0.5);
      const meanderLng = 0.010 * Math.cos(progress * Math.PI * 1.5 + idx * 0.4);

      const curLat = (startLat + dLat) * (1 - progress) + (endLat + dLat * 0.6) * progress + meanderLat;
      const curLng = (startLng + dLng) * (1 - progress) + (endLng + dLng * 0.6) * progress + meanderLng;
      const minsAgo = Math.floor(progress * 282);
      const totalMins = 10 * 60 + 42 - minsAgo;
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      pts.push({
        time_utc: `2026-09-06T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00Z`,
        lat: Number(curLat.toFixed(5)),
        lng: Number(curLng.toFixed(5)),
        step_minutes_ago: minsAgo
      });
    }
    return {
      particle_id: idx + 1,
      points: pts
    };
  });
};

export const MOCK_DRIFT: DriftHindcastResult = {
  incident_id: "OCEAN-001",
  current_velocity_mps: 0.35,
  current_direction_deg: 65.0,
  wind_velocity_mps: 6.2,
  wind_direction_deg: 240.0,
  windage_leeway_factor: 0.03,
  backward_hours: 4.7,
  release_window_start: "2026-09-06T06:00:00Z",
  release_window_end: "2026-09-06T10:00:00Z",
  release_window_label: "06:00–10:00 UTC",
  origin_confidence: 0.72,
  probable_origin: {
    center: { lat: 19.280, lng: 71.450 },
    semi_major_km: 9.5,
    semi_minor_km: 4.2,
    azimuth_deg: 62.0,
    boundary_polygon: MOCK_ORIGIN_POLYGON,
    confidence_level: 0.72
  },
  particle_trajectories: generateMockParticles(),
  methodology_note: "Origin estimate is reconstructed from historical environmental conditions and is subject to uncertainty in current, wind, and spill dynamics.",
  provenance_tag: "Synthetic Demonstration Environmental Conditions"
};

export const MOCK_FLEET: AISVessel[] = [
  {
    vessel_id: "VESSEL-001",
    name: "Vessel A (MT Ocean Vanguard)",
    mmsi: "419001284",
    imo: "IMO 9428190",
    vessel_type: "Crude Oil Tanker",
    flag_state: "India [IN]",
    length_m: 244.0,
    beam_m: 42.0,
    is_candidate: true,
    filter_stage_eliminated: null,
    ais_anomaly_flag: true,
    ais_anomaly_detail: "22-minute AIS transmission gap detected (08:15–08:37 UTC) followed by slight speed reduction from 13.8 to 11.2 kts.",
    track: [
      { timestamp: "2026-09-06T05:30:00Z", lat: 19.120, lng: 71.050, sog_knots: 14.1, cog_deg: 64.0, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T06:15:00Z", lat: 19.170, lng: 71.180, sog_knots: 13.9, cog_deg: 63.5, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T07:00:00Z", lat: 19.215, lng: 71.290, sog_knots: 13.8, cog_deg: 62.0, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T07:45:00Z", lat: 19.250, lng: 71.375, sog_knots: 13.5, cog_deg: 61.0, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T08:15:00Z", lat: 19.274, lng: 71.432, sog_knots: 13.2, cog_deg: 60.5, nav_status: "Under way using engine", has_anomaly: true, anomaly_description: "AIS Signal Lost" },
      { timestamp: "2026-09-06T08:37:00Z", lat: 19.288, lng: 71.472, sog_knots: 11.2, cog_deg: 59.0, nav_status: "Under way using engine", has_anomaly: true, anomaly_description: "AIS Signal Resumed with speed dip" },
      { timestamp: "2026-09-06T09:15:00Z", lat: 19.325, lng: 71.565, sog_knots: 12.0, cog_deg: 58.5, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T10:00:00Z", lat: 19.365, lng: 71.670, sog_knots: 12.8, cog_deg: 58.0, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T10:45:00Z", lat: 19.410, lng: 71.775, sog_knots: 13.0, cog_deg: 57.5, nav_status: "Under way using engine", has_anomaly: false },
    ]
  },
  {
    vessel_id: "VESSEL-002",
    name: "Vessel B (MV Bharat Star)",
    mmsi: "419008712",
    imo: "IMO 9381024",
    vessel_type: "Bulk Carrier",
    flag_state: "Liberia [LR]",
    length_m: 189.0,
    beam_m: 32.2,
    is_candidate: true,
    filter_stage_eliminated: null,
    ais_anomaly_flag: false,
    ais_anomaly_detail: "Continuous AIS broadcast. No signal gaps or abnormal heading deviations.",
    track: [
      { timestamp: "2026-09-06T05:30:00Z", lat: 19.340, lng: 71.100, sog_knots: 11.5, cog_deg: 84.0, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T06:15:00Z", lat: 19.360, lng: 71.240, sog_knots: 11.4, cog_deg: 83.5, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T06:45:00Z", lat: 19.380, lng: 71.390, sog_knots: 11.2, cog_deg: 82.0, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T07:30:00Z", lat: 19.400, lng: 71.530, sog_knots: 11.3, cog_deg: 81.0, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T08:15:00Z", lat: 19.420, lng: 71.670, sog_knots: 11.5, cog_deg: 80.5, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T09:00:00Z", lat: 19.440, lng: 71.810, sog_knots: 11.6, cog_deg: 80.0, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T10:00:00Z", lat: 19.470, lng: 71.990, sog_knots: 11.4, cog_deg: 79.5, nav_status: "Under way using engine", has_anomaly: false },
    ]
  },
  {
    vessel_id: "VESSEL-003",
    name: "Vessel C (MV Sagar Ratna)",
    mmsi: "419003450",
    imo: "IMO 9512398",
    vessel_type: "Container Carrier",
    flag_state: "Panama [PA]",
    length_m: 260.0,
    beam_m: 32.5,
    is_candidate: true,
    filter_stage_eliminated: null,
    ais_anomaly_flag: false,
    ais_anomaly_detail: "Continuous AIS broadcast. Minor 4-degree course trim at 06:10 UTC.",
    track: [
      { timestamp: "2026-09-06T05:00:00Z", lat: 19.380, lng: 71.280, sog_knots: 16.5, cog_deg: 142.0, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T05:45:00Z", lat: 19.300, lng: 71.360, sog_knots: 16.2, cog_deg: 140.0, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T06:15:00Z", lat: 19.220, lng: 71.430, sog_knots: 16.0, cog_deg: 139.0, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T07:00:00Z", lat: 19.120, lng: 71.520, sog_knots: 16.4, cog_deg: 138.0, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T08:00:00Z", lat: 18.980, lng: 71.640, sog_knots: 16.6, cog_deg: 137.0, nav_status: "Under way using engine", has_anomaly: false },
    ]
  },
  {
    vessel_id: "VESSEL-004",
    name: "MV Western Breeze",
    mmsi: "419004512",
    imo: "IMO 9210984",
    vessel_type: "Offshore Supply Vessel",
    flag_state: "India [IN]",
    length_m: 75.0,
    beam_m: 16.0,
    is_candidate: false,
    filter_stage_eliminated: "Stage 2 (Temporal)",
    ais_anomaly_flag: false,
    track: [
      { timestamp: "2026-09-06T01:00:00Z", lat: 19.260, lng: 71.440, sog_knots: 8.0, cog_deg: 45.0, nav_status: "Engaged in towing", has_anomaly: false },
      { timestamp: "2026-09-06T03:30:00Z", lat: 19.340, lng: 71.550, sog_knots: 8.2, cog_deg: 46.0, nav_status: "Engaged in towing", has_anomaly: false },
    ]
  },
  {
    vessel_id: "VESSEL-005",
    name: "MT Al-Khor Chemist",
    mmsi: "419005991",
    imo: "IMO 9645011",
    vessel_type: "Chemical Tanker",
    flag_state: "Marshall Islands [MH]",
    length_m: 145.0,
    beam_m: 24.0,
    is_candidate: false,
    filter_stage_eliminated: "Stage 2 (Temporal)",
    ais_anomaly_flag: false,
    track: [
      { timestamp: "2026-09-06T12:00:00Z", lat: 19.270, lng: 71.460, sog_knots: 12.0, cog_deg: 190.0, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T14:30:00Z", lat: 19.110, lng: 71.410, sog_knots: 12.2, cog_deg: 191.0, nav_status: "Under way using engine", has_anomaly: false },
    ]
  },
  {
    vessel_id: "VESSEL-006",
    name: "MV Coastal Explorer",
    mmsi: "419006118",
    imo: "IMO 9128472",
    vessel_type: "General Cargo",
    flag_state: "Singapore [SG]",
    length_m: 120.0,
    beam_m: 20.0,
    is_candidate: false,
    filter_stage_eliminated: "Stage 1 (Spatial)",
    ais_anomaly_flag: false,
    track: [
      { timestamp: "2026-09-06T07:00:00Z", lat: 19.850, lng: 72.100, sog_knots: 10.5, cog_deg: 170.0, nav_status: "Under way using engine", has_anomaly: false },
      { timestamp: "2026-09-06T09:00:00Z", lat: 19.650, lng: 72.150, sog_knots: 10.4, cog_deg: 169.0, nav_status: "Under way using engine", has_anomaly: false },
    ]
  }
];

export const MOCK_FILTERING_PIPELINE: FilteringPipelineSummary = {
  initial_detected_count: 12,
  after_spatial_filter_count: 5,
  after_temporal_filter_count: 3,
  final_candidate_count: 3,
  elimination_log: [
    {
      stage: "Stage 1 (Spatial Filter)",
      criteria: "Distance to probable origin corridor > 25 km",
      eliminated_vessels: [
        { name: "MV Coastal Explorer", mmsi: "419006118", reason: "Sailing 55 km North-East of corridor" },
        { name: "MT Gulf Pearl", mmsi: "419007204", reason: "Sailing 70 km South of origin centroid" },
        { name: "FV Matsya Kanya", mmsi: "419008910", reason: "Coastal fishing zone, outside drift corridor" },
        { name: "MV Deccan Trader", mmsi: "419009112", reason: "Transiting northern shipping lane" },
        { name: "MT Indus Pioneer", mmsi: "419010334", reason: "South-bound, 60 km distant" },
        { name: "MV Konkan Express", mmsi: "419011456", reason: "Inbound Mumbai channel, 65 km East" },
        { name: "Tug Samudra Rakshak", mmsi: "419012990", reason: "Stationary at offshore field platform" }
      ]
    },
    {
      stage: "Stage 2 (Temporal Filter)",
      criteria: "Timestamp outside release window (06:00–10:00 UTC)",
      eliminated_vessels: [
        { name: "MV Western Breeze", mmsi: "419004512", reason: "Transited at 01:00–03:30 UTC (> 2.5 hours prior to window)" },
        { name: "MT Al-Khor Chemist", mmsi: "419005991", reason: "Transited at 12:00–14:30 UTC (> 2 hours after window)" }
      ]
    },
    {
      stage: "Stage 3 (Candidate Vessel Set)",
      criteria: "Passed both spatial corridor and temporal release window checks",
      retained_candidates: [
        { name: "Vessel A (MT Ocean Vanguard)", mmsi: "419001284", status: "Retained for Multi-Factor Attribution" },
        { name: "Vessel B (MV Bharat Star)", mmsi: "419008712", status: "Retained for Multi-Factor Attribution" },
        { name: "Vessel C (MV Sagar Ratna)", mmsi: "419003450", status: "Retained for Multi-Factor Attribution" }
      ]
    }
  ]
};

export const MOCK_CANDIDATES: CandidateScore[] = [
  {
    vessel_id: "VESSEL-001",
    vessel_name: "Vessel A (MT Ocean Vanguard)",
    mmsi: "419001284",
    vessel_type: "Crude Oil Tanker",
    evidence_strength_score: 91.4,
    investigation_priority: "HIGH",
    rank: 1,
    evidence_breakdown: {
      proximity_score: 96.0,
      temporal_score: 94.0,
      drift_score: 92.0,
      trajectory_score: 90.0,
      behaviour_score: 80.0,
      ais_anomaly_score: 87.0,
      weights_formula_applied: "0.25*Proximity + 0.20*Temporal + 0.20*Drift + 0.15*Trajectory + 0.10*Behaviour + 0.10*AIS_Anomaly",
      design_weights_note: "These weights are used for prototype demonstration. Production calibration would require labelled historical incidents and validation."
    },
    why_ranked_higher: [
      "Strong spatial consistency: Traversed within 0.8 km of probable origin centroid",
      "Strong temporal overlap: Positioned in origin ellipse at 08:25 UTC (center of 06:00–10:00 UTC window)",
      "High drift consistency: Course angle 60.5° aligns with backward transport streamlines",
      "Trajectory compatible: Direct transit across reconstructed release axis",
      "AIS Anomaly present: 22-min gap (08:15–08:37 UTC) with 2.6 kt speed dip (supporting evidence only)"
    ],
    why_ranked_lower: [],
    observed_evidence_summary: "Sentinel-1 SAR dark slick (65.7 km²) + AIS point at 08:15 UTC (lat 19.274, lng 71.432) & 08:37 UTC.",
    model_inference_summary: "Backward Lagrangian simulation places origin at [19.280, 71.450] during 06:00–10:00 UTC.",
    investigation_hypothesis: "If a release occurred from Vessel A at ~08:25 UTC, current/wind advection reconstructs observed spill geometry with 91.4% evidence consistency.",
    disclaimer: "Demo Evidence Scores — Not probability of guilt. Supports investigative triage only."
  },
  {
    vessel_id: "VESSEL-002",
    vessel_name: "Vessel B (MV Bharat Star)",
    mmsi: "419008712",
    vessel_type: "Bulk Carrier",
    evidence_strength_score: 67.8,
    investigation_priority: "MEDIUM",
    rank: 2,
    evidence_breakdown: {
      proximity_score: 72.0,
      temporal_score: 68.0,
      drift_score: 65.0,
      trajectory_score: 70.0,
      behaviour_score: 65.0,
      ais_anomaly_score: 62.0,
      weights_formula_applied: "0.25*Proximity + 0.20*Temporal + 0.20*Drift + 0.15*Trajectory + 0.10*Behaviour + 0.10*AIS_Anomaly",
      design_weights_note: "These weights are used for prototype demonstration. Production calibration would require labelled historical incidents and validation."
    },
    why_ranked_higher: [
      "Moderate proximity: Transited 11.2 km north of probable origin centroid",
      "Continuous AIS broadcast: Zero gaps, constant speed profile (11.4 kts)",
      "Consistent heading across northern corridor"
    ],
    why_ranked_lower: [
      "Weaker temporal overlap: Transited early in release window (06:45 UTC)",
      "Lower drift consistency: Northern offset would require higher northward current than observed",
      "Trajectory does not intersect primary slick dispersion axis"
    ],
    observed_evidence_summary: "AIS track at 06:45 UTC (lat 19.380, lng 71.390, SOG 11.2 kts).",
    model_inference_summary: "Forward drift from Vessel B track yields slick centroid 14 km North-East of observed polygon.",
    investigation_hypothesis: "Moderate hypothesis consistency; lower priority candidate compared to Vessel A.",
    disclaimer: "Demo Evidence Scores — Not probability of guilt. Supports investigative triage only."
  },
  {
    vessel_id: "VESSEL-003",
    vessel_name: "Vessel C (MV Sagar Ratna)",
    mmsi: "419003450",
    vessel_type: "Container Carrier",
    evidence_strength_score: 51.3,
    investigation_priority: "LOW",
    rank: 3,
    evidence_breakdown: {
      proximity_score: 55.0,
      temporal_score: 48.0,
      drift_score: 52.0,
      trajectory_score: 50.0,
      behaviour_score: 44.5,
      ais_anomaly_score: 56.0,
      weights_formula_applied: "0.25*Proximity + 0.20*Temporal + 0.20*Drift + 0.15*Trajectory + 0.10*Behaviour + 0.10*AIS_Anomaly",
      design_weights_note: "These weights are used for prototype demonstration. Production calibration would require labelled historical incidents and validation."
    },
    why_ranked_higher: [
      "Transited western periphery of surveillance bounding box",
      "Continuous AIS broadcast without transmission gaps"
    ],
    why_ranked_lower: [
      "Weak temporal overlap: Cleared sector at 06:05 UTC at high speed (16.2 kts)",
      "Divergent heading: Course 140° (SE) diverges from origin-to-slick transport axis",
      "Substantial spatial distance (18.5 km South-West of origin center)"
    ],
    observed_evidence_summary: "AIS track at 06:05 UTC (lat 19.220, lng 71.430, SOG 16.0 kts).",
    model_inference_summary: "Hypothetical release at 06:05 UTC advects south of observed Sentinel-1 slick bounds.",
    investigation_hypothesis: "Low hypothesis consistency; classified as Low Investigation Priority.",
    disclaimer: "Demo Evidence Scores — Not probability of guilt. Supports investigative triage only."
  }
];

export const MOCK_COUNTERFACTUALS: Record<string, CounterfactualResult> = {
  "VESSEL-001": {
    incident_id: "OCEAN-001",
    vessel_id: "VESSEL-001",
    vessel_name: "Vessel A (MT Ocean Vanguard)",
    hypothesis_statement: "Forward physical transport simulated from Vessel A position at 08:25 UTC ([19.278, 71.442]) advecting under 0.35 m/s current & 6.2 m/s wind across 2.3 hours.",
    release_point_tested: { lat: 19.278, lng: 71.442 },
    release_time_tested: "2026-09-06T08:25:00Z",
    simulated_slick_polygon: MOCK_COUNTERFACTUAL_VESSEL_A,
    spatial_consistency: "HIGH",
    temporal_consistency: "HIGH",
    drift_consistency: "HIGH",
    overall_hypothesis_consistency: "HIGH (92.4% Spatial Overlap)",
    consistency_metrics: {
      iou_overlap: 0.88,
      centroid_displacement_km: 0.9,
      orientation_delta_deg: 2.5,
      transport_vector_alignment: 0.94
    },
    disclaimer: "Counterfactual verification supports investigation prioritization. It does not establish legal responsibility."
  },
  "VESSEL-002": {
    incident_id: "OCEAN-001",
    vessel_id: "VESSEL-002",
    vessel_name: "Vessel B (MV Bharat Star)",
    hypothesis_statement: "Forward physical transport simulated from Vessel B track at 06:45 UTC ([19.380, 71.390]) advecting under environmental field across 4.0 hours.",
    release_point_tested: { lat: 19.380, lng: 71.390 },
    release_time_tested: "2026-09-06T06:45:00Z",
    simulated_slick_polygon: MOCK_COUNTERFACTUAL_VESSEL_B,
    spatial_consistency: "LOW",
    temporal_consistency: "MEDIUM",
    drift_consistency: "MEDIUM",
    overall_hypothesis_consistency: "LOW-MEDIUM (24.1% Spatial Overlap)",
    consistency_metrics: {
      iou_overlap: 0.22,
      centroid_displacement_km: 14.2,
      orientation_delta_deg: 18.0,
      transport_vector_alignment: 0.65
    },
    disclaimer: "Counterfactual verification supports investigation prioritization. It does not establish legal responsibility."
  },
  "VESSEL-003": {
    incident_id: "OCEAN-001",
    vessel_id: "VESSEL-003",
    vessel_name: "Vessel C (MV Sagar Ratna)",
    hypothesis_statement: "Forward physical transport simulated from Vessel C track at 06:05 UTC ([19.220, 71.430]) advecting under environmental field across 4.6 hours.",
    release_point_tested: { lat: 19.220, lng: 71.430 },
    release_time_tested: "2026-09-06T06:05:00Z",
    simulated_slick_polygon: MOCK_COUNTERFACTUAL_VESSEL_C,
    spatial_consistency: "LOW",
    temporal_consistency: "LOW",
    drift_consistency: "LOW",
    overall_hypothesis_consistency: "LOW (8.5% Spatial Overlap)",
    consistency_metrics: {
      iou_overlap: 0.08,
      centroid_displacement_km: 21.6,
      orientation_delta_deg: 32.0,
      transport_vector_alignment: 0.48
    },
    disclaimer: "Counterfactual verification supports investigation prioritization. It does not establish legal responsibility."
  }
};
