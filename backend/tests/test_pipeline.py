"""
Comprehensive Verification Tests for OCEAN-EYE Investigation Support Engine
Tests data structures, scoring formulas, dynamic 2D drift hindcasting, spatiotemporal filtering,
counterfactual verification, uncertainty thresholds, and fallback robustness.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.detection_service import detection_service
from app.services.drift_service import drift_service
from app.services.ais_service import ais_service, haversine_distance_km
from app.services.attribution_service import attribution_service
from app.services.counterfactual_service import counterfactual_service
from app.services.report_service import report_service
from app.providers import LiveDataDockedAISProvider, MyShipTrackingAISProvider, AISProvider


def test_detection_service():
    det = detection_service.detect_spill(incident_id="OCEAN-001", simulate_look_alike=False)
    assert det.status == "Suspected Oil Slick"
    assert det.area_km2 == 65.7
    assert det.confidence == 0.86
    assert len(det.polygon) > 3
    assert not det.look_alike_check.is_warning

    # Test Look-alike branch
    look_alike_det = detection_service.detect_spill(simulate_look_alike=True)
    assert look_alike_det.look_alike_check.is_warning
    assert look_alike_det.confidence < 0.50
    print("✓ Detection Service & Look-alike check passed.")


def test_drift_service_numerical_integration():
    # 1. Test benchmark demo reconstruction
    drift_demo = drift_service.backtrack(incident_id="OCEAN-001", is_demo=True)
    assert drift_demo.release_window_label == "06:00–10:00 UTC"
    assert drift_demo.origin_confidence == 0.72
    assert len(drift_demo.particle_trajectories) == 12

    # 2. Test dynamic numerical integration with custom current & wind
    drift_dyn = drift_service.backtrack(
        incident_id="OCEAN-CUSTOM",
        centroid_lat=19.425,
        centroid_lon=71.848,
        current_mps=0.50,
        current_deg=90.0,
        wind_mps=8.0,
        wind_deg=270.0,
        backward_hours=6.0,
        particle_count=10,
        uncertainty_scale=1.2,
        is_demo=False
    )
    assert len(drift_dyn.particle_trajectories) == 10
    # Backward integration under East current should place origin West of observed centroid
    assert drift_dyn.probable_origin.center.lng < 71.848
    assert len(drift_dyn.probable_origin.boundary_polygon) > 5
    assert drift_dyn.origin_confidence > 0.0
    print("✓ Dynamic 2D Backward Lagrangian Drift Simulation passed.")


def test_ais_spatiotemporal_filtering():
    # Distance utility test
    d = haversine_distance_km(19.0, 71.0, 19.0, 72.0)
    assert 100.0 < d < 115.0

    # Dynamic filter test
    dyn = ais_service.filter_vessels_dynamically(
        origin_lat=19.280,
        origin_lon=71.450,
        max_dist_km=25.0,
        window_start_str="2026-09-06T06:00:00Z",
        window_end_str="2026-09-06T10:00:00Z"
    )
    assert dyn["initial_count"] == 12
    assert dyn["spatial_count"] == 5
    assert dyn["temporal_count"] == 3
    assert len(dyn["retained_candidates"]) == 3

    # Summary funnel test
    pipeline = ais_service.get_filtering_pipeline_summary()
    assert pipeline.initial_detected_count == 12
    assert pipeline.after_spatial_filter_count == 5
    assert pipeline.after_temporal_filter_count == 3
    assert pipeline.final_candidate_count == 3
    print("✓ Dynamic AIS Spatiotemporal Funnel & Distance Calculation passed.")


def test_attribution_scoring_and_weights():
    # Standard weights test
    ranked = attribution_service.rank_candidates(evidence_threshold=50.0)
    assert len(ranked) == 3
    assert ranked[0].vessel_name == "Vessel A (MT Ocean Vanguard)"
    assert ranked[0].evidence_strength_score == 91.4
    assert ranked[0].investigation_priority == "HIGH"
    assert ranked[0].evidence_breakdown.provenance_entries is not None

    # Custom weights perturbation test
    custom_weights = {
        "proximity": 0.50,
        "temporal": 0.10,
        "drift": 0.10,
        "trajectory": 0.10,
        "behaviour": 0.10,
        "ais_anomaly": 0.10
    }
    ranked_custom = attribution_service.rank_candidates(evidence_threshold=50.0, weights=custom_weights)
    assert ranked_custom[0].evidence_strength_score > 0.0

    # Insufficient Evidence Threshold test (<50% -> INSUFFICIENT_EVIDENCE)
    high_threshold_ranked = attribution_service.rank_candidates(evidence_threshold=95.0)
    for c in high_threshold_ranked:
        assert c.investigation_priority == "INSUFFICIENT_EVIDENCE"
    print("✓ Explainable Attribution Scoring, Provenance & Threshold Cases passed.")


def test_counterfactual_service_metrics():
    # Benchmark vessel test
    cf_a = counterfactual_service.run_hypothesis(vessel_id="VESSEL-001")
    assert cf_a.spatial_consistency == "HIGH"
    assert cf_a.consistency_metrics["iou_overlap"] >= 0.80
    assert cf_a.consistency_metrics["centroid_displacement_km"] < 2.0

    cf_b = counterfactual_service.run_hypothesis(vessel_id="VESSEL-002")
    assert cf_b.spatial_consistency == "LOW"
    assert cf_b.consistency_metrics["centroid_displacement_km"] > 10.0

    # Custom release point test
    from app.models.schemas import GeoPoint
    custom_cf = counterfactual_service.run_hypothesis(
        vessel_id="VESSEL-CUSTOM",
        custom_release_point=GeoPoint(lat=19.420, lng=71.840)
    )
    assert custom_cf.consistency_metrics["centroid_displacement_km"] < 5.0
    assert custom_cf.consistency_metrics["iou_overlap"] > 0.50
    print("✓ Counterfactual Forward Hypothesis & Metric Evaluation passed.")


def test_report_generation():
    rep = report_service.generate_report(incident_id="OCEAN-001")
    assert rep.incident_summary.id == "OCEAN-001"
    assert len(rep.evidence_provenance_trail) == 5
    assert len(rep.uncertainty_and_limitations) == 4
    assert "PROBABILITY OF GUILT" not in rep.model_dump_json().upper() or "NOT PROBABILITY OF GUILT" in rep.model_dump_json().upper()
    print("✓ Investigation Report Compilation & Responsible AI passed.")


def test_live_providers_resilience():
    # Test DataDocked Provider
    dd = LiveDataDockedAISProvider()
    v_dd = dd.fetch_live_vessel("9870666")
    assert v_dd is not None
    assert v_dd["name"] == "NORMA"
    assert v_dd["imo"] == "9870666"

    # Test MyShipTracking Provider
    mst = MyShipTrackingAISProvider()
    v_mst = mst.fetch_live_vessel("9870666")
    assert v_mst is not None
    assert v_mst["name"] == "NORMA"

    # Test Unified AIS Provider
    ais = AISProvider()
    unified = ais.fetch_unified_live_vessel("9870666")
    assert unified is not None
    assert unified["name"] == "NORMA"
def test_dynamic_attribution_ranking_changes_with_inputs():
    # 1. Benchmark input ranking -> Vessel A is #1
    ranked_standard = attribution_service.rank_candidates(
        origin_lat=19.280,
        origin_lon=71.450,
        window_start_str="2026-09-06T06:00:00Z",
        window_end_str="2026-09-06T10:00:00Z"
    )
    assert ranked_standard[0].vessel_name == "Vessel A (MT Ocean Vanguard)"
    assert ranked_standard[0].rank == 1

    # 2. Shift origin to northern corridor [19.380, 71.390] -> Vessel B (MV Bharat Star) ranking shifts up
    from app.data.demo_incident import SYNTHETIC_FLEET_DATA
    ranked_shifted = attribution_service.rank_candidates(
        dynamic_vessels=SYNTHETIC_FLEET_DATA,
        origin_lat=19.380,
        origin_lon=71.390,
        window_start_str="2026-09-06T06:00:00Z",
        window_end_str="2026-09-06T08:00:00Z"
    )
    assert ranked_shifted[0].vessel_name == "Vessel B (MV Bharat Star)"
    assert ranked_shifted[0].evidence_breakdown.proximity_score > 90.0
    print("✓ Dynamic Attribution Candidate Ranking Shift with Input Changes passed.")


def test_environmental_and_satellite_providers():
    # 1. Satellite Scene Search
    from app.providers import satellite_provider, ocean_provider
    scenes = satellite_provider.search_scenes()
    assert len(scenes) >= 2
    assert scenes[0]["scene_id"].startswith("S1A_")
    assert scenes[0]["data_status"] in ["HISTORICAL", "SIMULATED", "LIVE"]
    assert "acquisition_time" in scenes[0]

    # 2. Environmental Field
    env = ocean_provider.get_environmental_field()
    assert "current_velocity_mps" in env
    assert "wind_velocity_mps" in env
    assert "current_vectors" in env
    assert len(env["current_vectors"]) > 10
    assert env["data_status"] in ["LIVE", "HISTORICAL", "SIMULATED", "DEMO"]
    print("✓ Environmental Metocean & Satellite Scene Discovery Providers passed.")


def test_scientific_closed_loop_drift_validation():
    """
    Controlled Synthetic Scientific Test:
    Known release point & time -> forward simulate spill advection -> run backward drift
    -> verify estimated probable origin center is within acceptable physical tolerance (< 2.5 km).
    """
    known_release_lat = 19.280
    known_release_lon = 71.450
    known_release_time = "2026-09-06T08:25:00Z"
    obs_time = "2026-09-06T10:42:00Z"

    # 1. Forward physics advection
    fwd = counterfactual_service.forward_simulate_slick(
        release_lat=known_release_lat,
        release_lon=known_release_lon,
        release_time_str=known_release_time,
        observation_time_str=obs_time,
        incident_id="OCEAN-VALIDATION",
        current_mps=0.35,
        wind_mps=6.2
    )
    sim_obs_lat, sim_obs_lon = fwd["sim_centroid"]

    # 2. Backward Lagrangian hindcast from forward-simulated centroid
    hindcast = drift_service.backtrack(
        incident_id="OCEAN-VALIDATION",
        centroid_lat=sim_obs_lat,
        centroid_lon=sim_obs_lon,
        current_mps=0.35,
        current_deg=65.0,
        wind_mps=6.2,
        wind_deg=240.0,
        backward_hours=2.283,
        particle_count=12,
        is_demo=False
    )

    estimated_origin_lat = hindcast.probable_origin.center.lat
    estimated_origin_lon = hindcast.probable_origin.center.lng

    # 3. Calculate spatial error tolerance
    error_km = haversine_distance_km(known_release_lat, known_release_lon, estimated_origin_lat, estimated_origin_lon)
    assert error_km < 2.5, f"Estimated origin error {error_km:.2f} km exceeds scientific tolerance threshold (2.5 km)"
    print(f"✓ Controlled Closed-Loop Synthetic Drift Validation passed (Error: {error_km:.2f} km).")


def test_insufficient_evidence_threshold_and_reasons():
    # 1. Score below threshold assigns INSUFFICIENT_EVIDENCE
    ranked_strict = attribution_service.rank_candidates(evidence_threshold=95.0)
    for c in ranked_strict:
        assert c.investigation_priority == "INSUFFICIENT_EVIDENCE"

    # 2. Insufficient candidate tracking
    untracked_vessel = {
        "vessel_id": "VESSEL-EMPTY",
        "name": "Ghost Vessel",
        "mmsi": "000000000",
        "vessel_type": "Tug",
        "track": []
    }
    dyn_eval = attribution_service.evaluate_vessel_dynamically(untracked_vessel)
    assert dyn_eval["proximity_score"] == 10.0
    assert len(dyn_eval["why_lower"]) > 0
    print("✓ Insufficient Evidence & Threshold Rejection passed.")


def test_ais_gap_and_continuity_detection():
    from app.data.demo_incident import SYNTHETIC_FLEET_DATA
    vessel_a = next(v for v in SYNTHETIC_FLEET_DATA if v["vessel_id"] == "VESSEL-001")
    vessel_b = next(v for v in SYNTHETIC_FLEET_DATA if v["vessel_id"] == "VESSEL-002")

    eval_a = attribution_service.evaluate_vessel_dynamically(vessel_a)
    eval_b = attribution_service.evaluate_vessel_dynamically(vessel_b)

    # Vessel A had 22-min gap -> anomalous score (87.0)
    assert eval_a["ais_anomaly_score"] == 87.0
    # Vessel B had continuous broadcast -> nominal score (60.0)
    assert eval_b["ais_anomaly_score"] == 60.0
    print("✓ AIS Gap & Transmission Continuity Evaluation passed.")


if __name__ == "__main__":
    test_detection_service()
    test_drift_service_numerical_integration()
    test_ais_spatiotemporal_filtering()
    test_attribution_scoring_and_weights()
    test_dynamic_attribution_ranking_changes_with_inputs()
    test_counterfactual_service_metrics()
    test_report_generation()
    test_environmental_and_satellite_providers()
    test_live_providers_resilience()
    test_scientific_closed_loop_drift_validation()
    test_insufficient_evidence_threshold_and_reasons()
    test_ais_gap_and_continuity_detection()
    print("\nALL 12 CORE VERIFICATION & SCIENTIFIC VALIDATION TESTS COMPLETED SUCCESSFULLY!")


