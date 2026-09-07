import React, { useState } from 'react';
import { useMaritimeStore } from '../store/useMaritimeStore';
import {
  Ship,
  Layers,
  AlertTriangle,
  Compass,
  Satellite,
  Waves,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Info,
  Scale,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Building2,
  Anchor,
  X,
  Radio,
  ExternalLink,
  Sliders,
  TrendingUp
} from 'lucide-react';

export const ContextualInspectorDock: React.FC = () => {
  const {
    selectedEntity,
    setSelectedEntity,
    vessels,
    satelliteScene,
    environment,
    evidenceThreshold,
    setEvidenceThreshold,
    setActiveModal,
    setActiveView,
    isInspectorDockOpen,
    toggleInspectorDock
  } = useMaritimeStore();

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'EVIDENCE' | 'REGISTRY'>('DETAILS');

  const selectedVessel =
    selectedEntity.type === 'VESSEL'
      ? vessels.find((v) => v.mmsi === selectedEntity.mmsi)
      : null;

  const candidateVessels = vessels.filter((v) => v.is_candidate);

  if (!isInspectorDockOpen) {
    return (
      <div className="absolute top-3 right-14 z-[400]">
        <button
          onClick={toggleInspectorDock}
          className="flex items-center gap-2 px-3 py-2 bg-[#0a1220]/95 backdrop-blur-md border border-slate-700/80 rounded-lg text-slate-200 hover:text-white hover:border-cyan-500/60 shadow-2xl transition-all group font-sans text-xs"
          title="Open Intelligence Inspector"
        >
          <div className="relative">
            <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <span className="font-semibold tracking-wide">
            {selectedEntity.type !== 'NONE' ? 'TARGET DOSSIER' : 'INCIDENT INTEL'}
          </span>
          <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <aside className="absolute top-3 right-14 z-[400] w-96 bg-[#0a1220]/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl font-sans text-slate-200 select-none max-h-[calc(100vh-130px)] flex flex-col overflow-hidden transition-all">
      {/* Dock Header */}
      <div className="p-3 bg-[#0d1627] border-b border-slate-700/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-md border ${
            selectedEntity.type === 'VESSEL'
              ? 'bg-cyan-950/80 border-cyan-700/60 text-cyan-400'
              : selectedEntity.type === 'SPILL'
              ? 'bg-red-950/80 border-red-700/60 text-red-400'
              : selectedEntity.type === 'ORIGIN'
              ? 'bg-amber-950/80 border-amber-700/60 text-amber-400'
              : 'bg-slate-800/80 border-slate-700/60 text-slate-300'
          }`}>
            {selectedEntity.type === 'VESSEL' && <Ship className="w-4 h-4" />}
            {selectedEntity.type === 'SPILL' && <AlertTriangle className="w-4 h-4" />}
            {selectedEntity.type === 'ORIGIN' && <Compass className="w-4 h-4" />}
            {selectedEntity.type === 'SATELLITE' && <Satellite className="w-4 h-4" />}
            {selectedEntity.type === 'NONE' && <ShieldCheck className="w-4 h-4 text-cyan-400" />}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-white text-xs tracking-wider uppercase truncate">
              {selectedEntity.type === 'VESSEL' && selectedVessel
                ? selectedVessel.name
                : selectedEntity.type === 'SPILL'
                ? 'SAR Oil Spill Analysis'
                : selectedEntity.type === 'ORIGIN'
                ? 'Lagrangian Probable Origin'
                : selectedEntity.type === 'SATELLITE'
                ? 'Sentinel-1A SAR Swath'
                : 'Incident Sector 7 Intel'}
            </h3>
            <div className="text-[10px] text-slate-400 truncate">
              {selectedEntity.type === 'VESSEL' && selectedVessel
                ? `${selectedVessel.vessel_type} &bull; MMSI: ${selectedVessel.mmsi}`
                : 'Arabian Sea Offshore Investigation'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedEntity.type !== 'NONE' && (
            <button
              onClick={() => setSelectedEntity({ type: 'NONE' })}
              className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800/80 transition-colors"
              title="Reset to Incident Overview"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={toggleInspectorDock}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800/80 transition-colors"
            title="Collapse Inspector Dock"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dock Content Body */}
      <div className="p-3.5 space-y-3.5 overflow-y-auto flex-1 text-xs">
        {/* ========================================================= */}
        {/* VIEW 1: DEFAULT INCIDENT OVERVIEW (When nothing selected) */}
        {/* ========================================================= */}
        {selectedEntity.type === 'NONE' && (
          <div className="space-y-3">
            {/* Incident Summary Card */}
            <div className="p-3 rounded-lg bg-gradient-to-br from-[#0e1a30] to-[#0a1220] border border-cyan-900/40 space-y-1.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                  PRIMARY INCIDENT
                </span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                  UNDER INVESTIGATION
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">
                OCEAN-001 (Mumbai High Basin)
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Hydrocarbon slick detected via Sentinel-1A C-band SAR. Lagrangian backward drift hindcast correlates with AIS trajectory anomalies.
              </p>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setSelectedEntity({ type: 'SPILL' })}
                className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/60 hover:border-red-500/70 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-red-400 text-[10px] font-semibold uppercase">
                  <span>SAR SLICK</span>
                  <AlertTriangle className="w-3 h-3 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {satelliteScene?.detected_slick.area_km2 || 65.7} <span className="text-xs text-slate-400 font-sans">km²</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Length: 22.0 km &bull; 88% Conf.
                </div>
              </div>

              <div
                onClick={() => setSelectedEntity({ type: 'ORIGIN' })}
                className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/60 hover:border-amber-500/70 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-amber-400 text-[10px] font-semibold uppercase">
                  <span>RELEASE ORIGIN</span>
                  <Compass className="w-3 h-3 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  4.7 <span className="text-xs text-slate-400 font-sans">hours ago</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Window: 06:00–10:00 UTC
                </div>
              </div>
            </div>

            {/* Candidate Attribution Ranking List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Candidate Attributions ({candidateVessels.length})
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Ranked by Evidence</span>
              </div>

              <div className="space-y-1.5">
                {candidateVessels.map((v) => (
                  <div
                    key={v.mmsi}
                    onClick={() => setSelectedEntity({ type: 'VESSEL', mmsi: v.mmsi })}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 hover:border-cyan-500/60 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-white text-xs truncate group-hover:text-cyan-300 transition-colors">
                          {v.name}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          v.investigation_priority === 'HIGH'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : v.investigation_priority === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {v.investigation_priority}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-cyan-400">
                        {v.evidence_strength?.toFixed(1)}%
                      </span>
                    </div>

                    <div className="mt-1.5 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (v.evidence_strength || 0) > 75
                            ? 'bg-red-500'
                            : (v.evidence_strength || 0) > 40
                            ? 'bg-amber-500'
                            : 'bg-cyan-500'
                        }`}
                        style={{ width: `${v.evidence_strength || 0}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                      <span>{v.vessel_type}</span>
                      <span>MMSI: <span className="font-mono text-slate-300">{v.mmsi}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => setActiveView('ATTRIBUTION')}
                className="flex-1 py-2 px-3 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-200 text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Attribution Matrix
              </button>
              <button
                onClick={() => setActiveView('DOSSIER')}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600/50 text-white text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Full Dossier
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: SELECTED VESSEL DOSSIER */}
        {/* ========================================================= */}
        {selectedEntity.type === 'VESSEL' && selectedVessel && (
          <div className="space-y-3">
            {/* Tabs */}
            <div className="flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
              {[
                { id: 'DETAILS', label: 'Telemetry & Track' },
                { id: 'EVIDENCE', label: 'Attribution Evidence' },
                { id: 'REGISTRY', label: 'Ownership & Class' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition-all ${
                    activeTab === t.id
                      ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Telemetry */}
            {activeTab === 'DETAILS' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block uppercase">Speed / Course</span>
                    <span className="font-bold text-white font-mono">{selectedVessel.sog} kn</span>
                    <span className="text-slate-400 ml-1">@ {selectedVessel.cog}°T</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block uppercase">Nav Status</span>
                    <span className="font-semibold text-cyan-300 truncate block">{selectedVessel.nav_status}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block uppercase">Dimensions</span>
                    <span className="font-bold text-white font-mono">{selectedVessel.length_m}m &times; {selectedVessel.beam_m}m</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block uppercase">Draught</span>
                    <span className="font-bold text-white font-mono">{selectedVessel.draught_m}m</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/60 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">Destination &amp; ETA</div>
                  <div className="font-semibold text-white">{selectedVessel.destination}</div>
                  <div className="text-[11px] text-slate-400">ETA: <span className="font-mono text-slate-300">{selectedVessel.eta}</span></div>
                </div>

                {/* AIS Continuity Gap Alert */}
                {selectedVessel.ais_continuity?.has_anomaly ? (
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      AIS Gap Anomaly Detected
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      {selectedVessel.ais_continuity.comment}
                    </p>
                    <div className="text-[10px] text-amber-300 font-mono pt-1">
                      Gap Duration: {selectedVessel.ais_continuity.gap_duration_minutes} mins &bull; Speed Delta: {selectedVessel.ais_continuity.speed_delta_knots} kn
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/60 flex items-center gap-2 text-emerald-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Continuous broadcast verified with no persistent transmitter gaps.</span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Attribution Evidence */}
            {activeTab === 'EVIDENCE' && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Composite Attribution Score</span>
                    <span className="font-mono font-bold text-base text-cyan-400">
                      {selectedVessel.evidence_strength ? `${selectedVessel.evidence_strength.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-300">
                      <span>Spatial Drift Proximity:</span>
                      <strong className="text-white">0.4 km from Ellipse Core (Score: 94)</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Temporal Release Window:</span>
                      <strong className="text-white">08:25 UTC (Inside Window, Score: 96)</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>AIS Transmission Continuity:</span>
                      <strong className="text-amber-300">42 min Gap (Score: 88)</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Speed Delta at Release:</span>
                      <strong className="text-amber-300">-4.2 knots deceleration</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('ATTRIBUTION')}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-200 text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Open Full Attribution Matrix &amp; Multi-Factor Breakdown
                </button>
              </div>
            )}

            {/* Tab 3: Registry & Ownership */}
            {activeTab === 'REGISTRY' && (
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/60 space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Registered Owner</span>
                    <strong className="text-white">{selectedVessel.registry_details?.registered_owner || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">ISM Safety Manager</span>
                    <strong className="text-white">{selectedVessel.registry_details?.ism_manager || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Classification Society</span>
                    <strong className="text-cyan-300">{selectedVessel.registry_details?.classification_society || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">P&amp;I Marine Insurance Club</span>
                    <strong className="text-white">{selectedVessel.registry_details?.pi_club || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">DWT / Year Built</span>
                    <strong className="text-white">{selectedVessel.registry_details?.deadweight_tonnage || 'N/A'} &bull; {selectedVessel.registry_details?.year_built || 'N/A'}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: SAR OIL SPILL ANALYSIS */}
        {/* ========================================================= */}
        {selectedEntity.type === 'SPILL' && satelliteScene && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/60 space-y-2">
              <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs uppercase">
                <AlertTriangle className="w-4 h-4" />
                Copernicus SAR Slick Detection
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Hydrocarbon dark formation identified via Sentinel-1A SAR backscatter thresholding with -4.8 dB contrast gradient.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase block">Slick Surface Area</span>
                <span className="font-bold text-white font-mono text-sm">{satelliteScene.detected_slick.area_km2} km²</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase block">Radar Confidence</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{(satelliteScene.detected_slick.detection_confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase block">Length &times; Width</span>
                <span className="font-bold text-white font-mono">{satelliteScene.detected_slick.major_axis_km} km &times; {satelliteScene.detected_slick.minor_axis_km} km</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase block">Orientation</span>
                <span className="font-bold text-white font-mono">{satelliteScene.detected_slick.orientation_deg}°</span>
              </div>
            </div>

            <button
              onClick={() => setActiveView('DETECTION')}
              className="w-full py-2 px-3 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-200 text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5"
            >
              <Satellite className="w-3.5 h-3.5" />
              Open SAR Satellite Radar Lab
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: PROBABLE ORIGIN REGION */}
        {/* ========================================================= */}
        {selectedEntity.type === 'ORIGIN' && environment && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/60 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase">
                <Compass className="w-4 h-4" />
                Lagrangian Drift Origin Reversal
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                4.7-hour backward hydrodynamic particle dispersion model driven by INCOIS 0.35 m/s current field and ECMWF ERA5 windage.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase block">Backward Duration</span>
                <span className="font-bold text-white font-mono text-sm">{environment.hindcast.backward_duration_hours} Hours</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase block">Origin Confidence</span>
                <span className="font-bold text-amber-300 font-mono text-sm">{(environment.hindcast.origin_confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            <button
              onClick={() => setActiveView('DRIFT')}
              className="w-full py-2 px-3 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-200 text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5"
            >
              <Waves className="w-3.5 h-3.5" />
              Open Hydrodynamic Drift Hindcast Lab
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
