import {
  IncidentSummary,
  SpillDetection,
  DriftHindcastResult,
  AISVessel,
  FilteringPipelineSummary,
  CandidateScore,
  CounterfactualResult,
  InvestigationReport
} from '../types';

import {
  MOCK_INCIDENT_SUMMARY,
  MOCK_DETECTION,
  MOCK_DRIFT,
  MOCK_FLEET,
  MOCK_FILTERING_PIPELINE,
  MOCK_CANDIDATES,
  MOCK_COUNTERFACTUALS
} from '../data/mockIncidentData';

const API_HOST = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const BASE_URL = API_HOST ? `${API_HOST}/api` : '/api';

export const apiService = {
  async getHealth(): Promise<{ status: string; service: string }> {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return { status: "ONLINE (Local Engine)", service: "OCEAN-EYE Investigation Support Engine" };
  },

  async getIncidentSummary(incidentId = 'OCEAN-001'): Promise<IncidentSummary> {
    try {
      const res = await fetch(`${BASE_URL}/incidents/${incidentId}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return MOCK_INCIDENT_SUMMARY;
  },

  async runDetection(incidentId = 'OCEAN-001', simulateLookAlike = false): Promise<SpillDetection> {
    try {
      const res = await fetch(`${BASE_URL}/detection/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_id: incidentId, simulate_look_alike: simulateLookAlike })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    if (simulateLookAlike) {
      return {
        ...MOCK_DETECTION,
        confidence: 0.42,
        status: "Potential SAR Look-Alike (Unconfirmed)",
        look_alike_check: {
          is_warning: true,
          warning_type: "Low-Wind Region / Biogenic Film Risk",
          description: "Surface wind speed < 3.0 m/s detected in scene quadrant. Dark backscatter exhibits characteristics of natural biogenic slick.",
          recommended_action: "Do not initiate vessel attribution. Correlate with multi-spectral SST or airborne patrol."
        }
      };
    }
    return MOCK_DETECTION;
  },

  async runDriftHindcast(params?: {
    current_mps?: number;
    current_deg?: number;
    wind_mps?: number;
    wind_deg?: number;
    uncertainty_scale?: number;
  }): Promise<DriftHindcastResult> {
    try {
      const res = await fetch(`${BASE_URL}/drift/backtrack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: 'OCEAN-001',
          current_mps: params?.current_mps ?? 0.35,
          current_deg: params?.current_deg ?? 65.0,
          wind_mps: params?.wind_mps ?? 6.2,
          wind_deg: params?.wind_deg ?? 240.0,
          uncertainty_scale: params?.uncertainty_scale ?? 1.0
        })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return MOCK_DRIFT;
  },

  async getAISVessels(candidatesOnly = false): Promise<AISVessel[]> {
    try {
      const res = await fetch(`${BASE_URL}/incidents/OCEAN-001/ais?candidates_only=${candidatesOnly}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return candidatesOnly ? MOCK_FLEET.filter(v => v.is_candidate) : MOCK_FLEET;
  },

  async runAISFilter(): Promise<FilteringPipelineSummary> {
    try {
      const res = await fetch(`${BASE_URL}/ais/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_id: 'OCEAN-001' })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return MOCK_FILTERING_PIPELINE;
  },

  async rankCandidates(threshold = 50.0, weights?: Record<string, number>): Promise<CandidateScore[]> {
    try {
      const res = await fetch(`${BASE_URL}/attribution/rank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidence_threshold: threshold, weights })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    // Client-side exact calculation matching formula
    const wProx = weights?.proximity ?? 0.25;
    const wTemp = weights?.temporal ?? 0.20;
    const wDrift = weights?.drift ?? 0.20;
    const wTraj = weights?.trajectory ?? 0.15;
    const wBehav = weights?.behaviour ?? 0.10;
    const wAis = weights?.ais_anomaly ?? 0.10;

    return MOCK_CANDIDATES.map(c => {
      const p = c.evidence_breakdown.proximity_score;
      const t = c.evidence_breakdown.temporal_score;
      const d = c.evidence_breakdown.drift_score;
      const tr = c.evidence_breakdown.trajectory_score;
      const b = c.evidence_breakdown.behaviour_score;
      const a = c.evidence_breakdown.ais_anomaly_score;

      const calc = Number((wProx * p + wTemp * t + wDrift * d + wTraj * tr + wBehav * b + wAis * a).toFixed(1));
      let prio: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_EVIDENCE' = 'LOW';
      if (calc < threshold) prio = 'INSUFFICIENT_EVIDENCE';
      else if (calc >= 85.0) prio = 'HIGH';
      else if (calc >= 60.0) prio = 'MEDIUM';

      return {
        ...c,
        evidence_strength_score: calc,
        investigation_priority: prio
      };
    }).sort((a, b) => b.evidence_strength_score - a.evidence_strength_score)
      .map((c, idx) => ({ ...c, rank: idx + 1 }));
  },

  async runCounterfactual(vesselId = 'VESSEL-001'): Promise<CounterfactualResult> {
    try {
      const res = await fetch(`${BASE_URL}/counterfactual/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vessel_id: vesselId, incident_id: 'OCEAN-001' })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return MOCK_COUNTERFACTUALS[vesselId] || MOCK_COUNTERFACTUALS['VESSEL-001'];
  },

  async generateReport(analystRef = 'MGIU-07 / Coast Guard Liaison'): Promise<InvestigationReport> {
    try {
      const res = await fetch(`${BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_id: 'OCEAN-001', analyst_reference: analystRef })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    return {
      report_id: "MGIU-REP-OCEAN-001-20260906",
      incident_id: "OCEAN-001",
      generated_at: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      analyst_reference: analystRef,
      incident_summary: MOCK_INCIDENT_SUMMARY,
      detection_section: MOCK_DETECTION,
      drift_section: MOCK_DRIFT,
      ais_filtering_pipeline: MOCK_FILTERING_PIPELINE,
      candidate_rankings: MOCK_CANDIDATES,
      top_counterfactual: MOCK_COUNTERFACTUALS["VESSEL-001"],
      evidence_provenance_trail: [
        {
          step_index: "1",
          data_source: "Copernicus Sentinel-1 SAR C-Band",
          processing_step: "Backscatter Thresholding & Morphological Segmentation",
          timestamp_utc: "2026-09-06T10:45:12Z",
          model_algorithm: "OCEAN-EYE SAR Dark-Slick Segmentation Adapter v2.4",
          generated_output: "Spill Polygon (Area: 65.7 km², Centroid: [19.425, 71.848], Length: 22 km)"
        },
        {
          step_index: "2",
          data_source: "INCOIS / ECMWF Ocean Current & Surface Wind Reanalysis",
          processing_step: "2D Lagrangian Backward Particle Transport Hindcasting",
          timestamp_utc: "2026-09-06T10:48:30Z",
          model_algorithm: "Hydrodynamic 4.7h Backtracking Simulation",
          generated_output: "Probable Origin Region Ellipse ([19.280, 71.450]) & Release Window 06:00–10:00 UTC"
        },
        {
          step_index: "3",
          data_source: "Historical Terrestrial & Satellite AIS Fleet Feed",
          processing_step: "Spatiotemporal Corridor & Release Window Filtration (12 -> 5 -> 3)",
          timestamp_utc: "2026-09-06T10:50:15Z",
          model_algorithm: "Geospatial Bounding Box & Temporal Intersect Filter",
          generated_output: "3 Candidate Vessels: Vessel A, Vessel B, Vessel C"
        },
        {
          step_index: "4",
          data_source: "Multi-Source Correlated Telemetry & Anomaly Analytics",
          processing_step: "Multi-Factor Explainable Evidence Scoring & Ranking",
          timestamp_utc: "2026-09-06T10:52:00Z",
          model_algorithm: "6-Factor Weighted Evidence Matrix (Formula applied)",
          generated_output: "Vessel A (91.4 HIGH), Vessel B (67.8 MEDIUM), Vessel C (51.3 LOW)"
        },
        {
          step_index: "5",
          data_source: "Forward Plume Hypothesis Simulator",
          processing_step: "Counterfactual Plume Stress-Testing & Overlap Scoring",
          timestamp_utc: "2026-09-06T10:55:00Z",
          model_algorithm: "Forward Lagrangian Transport & IoU Geometric Consistency Evaluator",
          generated_output: "Hypothesis Consistency HIGH for Vessel A (IoU 0.88, centroid delta 0.9 km)"
        }
      ],
      uncertainty_and_limitations: [
        "SAR Dark Feature Ambiguity: Satellite dark patches can arise from natural biogenic slicks, low wind calm water, or grease ice. Look-alike check indicates baseline nominal risk, but ground validation is required.",
        "Hydrodynamic Model Resolution: Drift hindcasting relies on mesoscale current and wind grids (0.35 m/s @ 65°, 6.2 m/s @ 240°). Sub-mesoscale coastal eddies introduce spatial uncertainty represented by the origin dispersion ellipse.",
        "AIS Transmission Integrity: AIS anomalies (e.g. the 22-min gap on Vessel A) provide supporting evidence of unrecorded movement but do not prove intentional shutoff or operational discharge.",
        "Legal Attribution Boundary: Evidence Strength Scores (e.g. 91.4) represent investigative priority rankings, NOT legal liability or guilt."
      ],
      analyst_action_recommendations: [
        "Deploy Maritime Patrol Aircraft (MPA) or Coast Guard interceptor for visual and FLIR thermal sensor verification.",
        "Cross-examine port state control records and bunkering/sludge logbooks for Candidate Vessel A upon next port of call.",
        "Request high-resolution optical satellite constellation tasking over the origin corridor to search for lingering emulsion sheens.",
        "Human analyst sign-off is mandatory before forwarding intelligence dossiers to judicial or regulatory enforcement authorities."
      ],
      compliance_disclaimer: "RESPONSIBLE AI INVESTIGATION SUPPORT NOTICE: This report was compiled by OCEAN-EYE as a decision-support and investigative triage tool for maritime authorities. The contents represent probabilistic hypotheses and model inferences. This system does not prove legal guilt or sole responsibility."
    };
  }
};
