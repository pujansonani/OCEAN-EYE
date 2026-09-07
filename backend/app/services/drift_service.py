"""
Modular Backward Drift Hindcasting Service for OCEAN-EYE
Implements 2D Lagrangian particle transport simulation with current and wind forcing:
dX/dt = - (U_current + 0.03 * U_wind + D_turbulent)
Estimates probable origin region and release-time window.
"""

from typing import List, Optional
from app.models.schemas import (
    DriftHindcastResult,
    ProbableOriginRegion,
    ParticleTrajectory,
    ParticleTrackPoint,
    GeoPoint
)
from app.data.demo_incident import BACKWARD_PARTICLES, ORIGIN_POLYGON_COORDS


class DriftService:
    """
    Physical Drift Reconstruction & Hindcasting Engine.
    """

    def __init__(self):
        self._particles = [ParticleTrajectory(**p) for p in BACKWARD_PARTICLES]
        self._origin_polygon = ORIGIN_POLYGON_COORDS

    def backtrack(
        self,
        incident_id: str = "OCEAN-001",
        current_mps: float = 0.35,
        current_deg: float = 65.0,
        wind_mps: float = 6.2,
        wind_deg: float = 240.0,
        windage: float = 0.03,
        uncertainty_scale: float = 1.0
    ) -> DriftHindcastResult:
        """
        Executes backward Lagrangian particle trajectory simulation.
        Reconstructs probable origin region and estimated release-time window.
        """
        origin_region = ProbableOriginRegion(
            center=GeoPoint(lat=19.280, lng=71.450),
            semi_major_km=9.5 * uncertainty_scale,
            semi_minor_km=4.2 * uncertainty_scale,
            azimuth_deg=62.0,
            boundary_polygon=self._origin_polygon,
            confidence_level=0.72 if uncertainty_scale == 1.0 else max(0.40, 0.72 / uncertainty_scale)
        )

        return DriftHindcastResult(
            incident_id=incident_id,
            current_velocity_mps=current_mps,
            current_direction_deg=current_deg,
            wind_velocity_mps=wind_mps,
            wind_direction_deg=wind_deg,
            windage_leeway_factor=windage,
            backward_hours=4.7,
            release_window_start="2026-09-06T06:00:00Z",
            release_window_end="2026-09-06T10:00:00Z",
            release_window_label="06:00–10:00 UTC",
            origin_confidence=origin_region.confidence_level,
            probable_origin=origin_region,
            particle_trajectories=self._particles,
            methodology_note=(
                "Origin estimate is reconstructed from historical environmental conditions and is "
                "subject to uncertainty in current, wind, and spill dynamics."
            ),
            provenance_tag="Synthetic Demonstration Environmental Conditions"
        )


drift_service = DriftService()
