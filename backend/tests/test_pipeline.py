"""
Backend Automated Verification Tests for OCEAN-EYE
Tests data structures, scoring formulas, drift hindcasting, filtering, and edge cases.
"""

import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.detection_service import detection_service
from app.services.drift_service import drift_service
from app.services.ais_service import ais_service
from app.services.attribution_service import attribution_service
from app.services.counterfactual_service import counterfactual_service
from app.services.report_service import report_service


def test_detection_service():
    det = detection_service.detect_spill(incident_id="OCEAN-001", simulate_look_alike=False)
    assert det.status == "Suspected Oil Slick"
    assert det.area_km2 == 65.7
    assert det.confidence == 0.86
    assert len(det.polygon) > 3
    assert not det.look_alike_check.is_warning

    # Test Look-alike simulated branch
    look_alike_det = detection_service.detect_spill(simulate_look_alike=True)
    assert look_alike_det.look_alike_check.is_warning
    assert look_alike_det.confidence < 0.50
    print("✓ Detection Service & Look-alike check passed.")


def test_drift_service():
    drift = drift_service.backtrack(incident_id="OCEAN-001")
    assert drift.release_window_label == "06:00–10:00 UTC"
    assert drift.origin_confidence == 0.72
    assert len(drift.particle_trajectories) == 12
    assert len(drift.probable_origin.boundary_polygon) > 3
    print("✓ Drift Hindcast Service passed.")


def test_ais_filtering():
    pipeline = ais_service.get_filtering_pipeline_summary()
    assert pipeline.initial_detected_count == 12
    assert pipeline.after_spatial_filter_count == 5
    assert pipeline.after_temporal_filter_count == 3
    assert pipeline.final_candidate_count == 3
    
    candidates = ais_service.get_candidate_vessels()
    assert len(candidates) == 3
    candidate_names = [c.name for c in candidates]
    assert any("Vessel A" in n for n in candidate_names)
    assert any("Vessel B" in n for n in candidate_names)
    assert any("Vessel C" in n for n in candidate_names)
    print("✓ AIS Spatiotemporal Filtering Pipeline passed.")


def test_attribution_scoring():
    # Test formula: 0.25*Prox + 0.20*Temp + 0.20*Drift + 0.15*Traj + 0.10*Behav + 0.10*AIS
    ranked = attribution_service.rank_candidates(evidence_threshold=50.0)
    assert len(ranked) == 3
    assert ranked[0].vessel_name == "Vessel A (MT Ocean Vanguard)"
    assert ranked[0].evidence_strength_score == 91.4
    assert ranked[0].investigation_priority == "HIGH"
    
    assert ranked[1].vessel_name == "Vessel B (MV Bharat Star)"
    assert ranked[1].evidence_strength_score == 67.8
    assert ranked[1].investigation_priority == "MEDIUM"

    assert ranked[2].vessel_name == "Vessel C (MV Sagar Ratna)"
    assert ranked[2].evidence_strength_score == 51.3
    assert ranked[2].investigation_priority == "LOW"

    # Test Insufficient Evidence Threshold
    high_threshold_ranked = attribution_service.rank_candidates(evidence_threshold=95.0)
    for c in high_threshold_ranked:
        assert c.investigation_priority == "INSUFFICIENT_EVIDENCE"
    print("✓ Attribution Scoring & Threshold Edge Cases passed.")


def test_counterfactual_service():
    cf_a = counterfactual_service.run_hypothesis(vessel_id="VESSEL-001")
    assert cf_a.spatial_consistency == "HIGH"
    assert cf_a.consistency_metrics["iou_overlap"] >= 0.80

    cf_b = counterfactual_service.run_hypothesis(vessel_id="VESSEL-002")
    assert cf_b.spatial_consistency == "LOW"
    assert cf_b.consistency_metrics["centroid_displacement_km"] > 10.0
    print("✓ Counterfactual Hypothesis Verification passed.")


def test_report_generation():
    rep = report_service.generate_report(incident_id="OCEAN-001")
    assert rep.incident_summary.id == "OCEAN-001"
    assert len(rep.evidence_provenance_trail) == 5
    assert len(rep.uncertainty_and_limitations) == 4
    assert "PROBABILITY OF GUILT" not in rep.model_dump_json().upper() or "NOT PROBABILITY OF GUILT" in rep.model_dump_json().upper()
    print("✓ Investigation Report Compilation passed.")


def test_live_providers():
    from app.providers import LiveDataDockedAISProvider, MyShipTrackingAISProvider, AISProvider
    
    # Test DataDocked Live Provider
    dd = LiveDataDockedAISProvider()
    v_dd = dd.fetch_live_vessel("9870666")
    assert v_dd is not None
    assert v_dd["name"] == "NORMA"
    assert v_dd["imo"] == "9870666"
    assert v_dd["registry_details"]["registered_owner"] != "N/A"

    # Test MyShipTracking Live Provider
    mst = MyShipTrackingAISProvider()
    acc = mst.get_account_info()
    assert acc is not None
    assert acc.get("available_coins") is not None

    v_mst = mst.fetch_live_vessel("9870666")
    assert v_mst is not None
    assert v_mst["name"] == "NORMA"

    # Test Unified AIS Provider
    ais = AISProvider()
    unified = ais.fetch_unified_live_vessel("9870666")
    assert unified is not None
    assert unified["name"] == "NORMA"
    assert unified["registry_details"]["classification_society"] == "DNV GL"
    print("✓ Live Multi-Provider (DataDocked + MyShipTracking) Integration passed.")


if __name__ == "__main__":
    test_detection_service()
    test_drift_service()
    test_ais_filtering()
    test_attribution_scoring()
    test_counterfactual_service()
    test_report_generation()
    test_live_providers()
    print("\nALL BACKEND AUTOMATED TESTS COMPLETED SUCCESSFULLY!")
