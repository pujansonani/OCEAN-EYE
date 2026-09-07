import React, { useState } from 'react';
import {
  AISVessel,
  CandidateScore,
  FilteringPipelineSummary
} from '../types';
import { EvidenceBreakdown } from '../components/EvidenceBreakdown';
import { CandidateComparisonModal } from '../components/CandidateComparisonModal';
import { InsufficientEvidenceBanner } from '../components/InsufficientEvidenceBanner';
import {
  Activity,
  Filter,
  Ship,
  Sliders,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Layers
} from 'lucide-react';

interface AISAttributionViewProps {
  vessels: AISVessel[];
  candidates: CandidateScore[];
  pipeline: FilteringPipelineSummary;
  selectedVesselId: string;
  onSelectVessel: (vesselId: string) => void;
  evidenceThreshold: number;
  setEvidenceThreshold: (val: number) => void;
  onProceedToCounterfactual: () => void;
}

export const AISAttributionView: React.FC<AISAttributionViewProps> = ({
  vessels,
  candidates,
  pipeline,
  selectedVesselId,
  onSelectVessel,
  evidenceThreshold,
  setEvidenceThreshold,
  onProceedToCounterfactual
}) => {
  const [filterMode, setFilterMode] = useState<'candidates' | 'all'>('candidates');
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const displayedVessels =
    filterMode === 'candidates' ? vessels.filter((v) => v.is_candidate) : vessels;

  const selectedCandidate =
    candidates.find((c) => c.vessel_id === selectedVesselId) || candidates[0];

  const hasInsufficientEvidence =
    candidates.every((c) => c.investigation_priority === 'INSUFFICIENT_EVIDENCE');

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#081326]/90 border border-[#173260] p-4 rounded-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-ocean-accent/40">
            <Activity className="w-5 h-5 text-ocean-accent" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              Stage 3: Spatiotemporal AIS Filtering &amp; Explainable Attribution
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Historical vessel trajectories correlated against probable origin region &amp; release window
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => setShowComparisonModal(true)}
            className="px-3.5 py-2 bg-[#102244] hover:bg-[#173260] border border-[#173260] text-slate-200 text-xs font-bold rounded-lg transition-all"
          >
            Compare Candidates Matrix
          </button>
          <button
            onClick={onProceedToCounterfactual}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 text-xs font-extrabold rounded-lg transition-all shadow-md flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Proceed to Counterfactual Verification &rarr;
          </button>
        </div>
      </div>

      {/* 3-Stage Spatiotemporal Filtering Funnel Pipeline */}
      <div className="bg-[#081326]/90 border border-[#173260] rounded-xl p-4 shadow-xl font-mono">
        <div className="flex items-center justify-between mb-3 border-b border-[#173260] pb-2">
          <span className="text-xs font-bold text-ocean-accent uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Spatiotemporal Filtration Funnel Pipeline
          </span>
          <span className="text-[10px] text-amber-400">
            SYNTHETIC AIS DEMONSTRATION DATA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-[#060e1d] border border-slate-700/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400 font-semibold">Stage 0: Sector Detection</span>
              <span className="text-base font-black text-white">{pipeline.initial_detected_count}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              All AIS-equipped vessels recorded in Arabian Sea surveillance quadrant.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#060e1d] border border-blue-900/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-blue-300 font-semibold">Stage 1: Spatial Corridor</span>
              <span className="text-base font-black text-blue-400">{pipeline.after_spatial_filter_count}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Filtered within 25 km of backward drift origin ellipse. 7 vessels eliminated.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#060e1d] border border-cyan-500/40">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-ocean-accent font-semibold">Stage 2: Release Window</span>
              <span className="text-base font-black text-ocean-accent">{pipeline.after_temporal_filter_count}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Filtered during 06:00–10:00 UTC window. 2 eliminated for early/late transit.
            </p>
          </div>
        </div>
      </div>

      {/* Threshold Slider & Attribution Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Candidate List & Telemetry Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Configurable Threshold Sandbox */}
          <div className="bg-[#081326]/90 border border-[#173260] rounded-xl p-4 shadow-xl font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-ocean-accent" />
                Configurable Evidence Strength Threshold Slider:
              </span>
              <span className="text-sm font-black text-cyan-300">
                {evidenceThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="95"
              step="1"
              value={evidenceThreshold}
              onChange={(e) => setEvidenceThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded accent-ocean-accent cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Low Threshold (30% - Relaxed)</span>
              <span>Default (50%)</span>
              <span>High Threshold (95% - Triggers Insufficient Evidence)</span>
            </div>
          </div>

          {/* AIS Fleet Table */}
          <div className="bg-[#081326]/90 border border-[#173260] rounded-xl p-4 shadow-xl font-mono">
            <div className="flex items-center justify-between mb-3 border-b border-[#173260] pb-2">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-ocean-accent" />
                <span className="text-xs font-bold text-white">Historical AIS Telemetry Logs</span>
              </div>
              <div className="flex items-center gap-1 bg-[#060e1d] p-0.5 rounded border border-[#173260] text-[10px]">
                <button
                  onClick={() => setFilterMode('candidates')}
                  className={`px-2 py-0.5 rounded ${
                    filterMode === 'candidates'
                      ? 'bg-cyan-950 text-ocean-accent font-bold border border-cyan-800'
                      : 'text-slate-400'
                  }`}
                >
                  Candidates Only (3)
                </button>
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2 py-0.5 rounded ${
                    filterMode === 'all'
                      ? 'bg-cyan-950 text-ocean-accent font-bold border border-cyan-800'
                      : 'text-slate-400'
                  }`}
                >
                  All Fleet (12)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] text-slate-300">
                <thead className="bg-[#060e1d] text-[10px] uppercase text-slate-400 border-b border-[#173260]">
                  <tr>
                    <th className="p-2">Vessel Name</th>
                    <th className="p-2">MMSI / IMO</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Status / AIS Anomaly</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#132742]">
                  {displayedVessels.map((v) => {
                    const isSelected = v.vessel_id === selectedVesselId;
                    return (
                      <tr
                        key={v.vessel_id}
                        className={`hover:bg-[#0b1830] transition-colors ${
                          isSelected ? 'bg-cyan-950/40 text-white font-semibold' : ''
                        }`}
                      >
                        <td className="p-2 font-bold flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              v.vessel_id === 'VESSEL-001'
                                ? 'bg-cyan-400'
                                : v.vessel_id === 'VESSEL-002'
                                ? 'bg-purple-400'
                                : v.vessel_id === 'VESSEL-003'
                                ? 'bg-emerald-400'
                                : 'bg-slate-600'
                            }`}
                          />
                          {v.name}
                        </td>
                        <td className="p-2 font-mono text-slate-400">
                          {v.mmsi} / {v.imo}
                        </td>
                        <td className="p-2 text-slate-300">{v.vessel_type}</td>
                        <td className="p-2">
                          {v.ais_anomaly_flag ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                              ⚠️ 22-min Gap (08:15–08:37 UTC)
                            </span>
                          ) : v.filter_stage_eliminated ? (
                            <span className="text-[10px] text-slate-500 italic">
                              Eliminated: {v.filter_stage_eliminated}
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400">Continuous AIS</span>
                          )}
                        </td>
                        <td className="p-2 text-right">
                          {v.is_candidate ? (
                            <button
                              onClick={() => onSelectVessel(v.vessel_id)}
                              className="px-2 py-0.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500 text-cyan-300 text-[10px] font-bold"
                            >
                              Inspect
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-600">Filtered Out</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Selected Candidate Evidence Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {hasInsufficientEvidence ? (
            <InsufficientEvidenceBanner
              threshold={evidenceThreshold}
              onResetThreshold={() => setEvidenceThreshold(50.0)}
            />
          ) : (
            selectedCandidate && (
              <EvidenceBreakdown
                candidate={selectedCandidate}
                onCompareCandidates={() => setShowComparisonModal(true)}
                onRunCounterfactual={onProceedToCounterfactual}
              />
            )
          )}
        </div>
      </div>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <CandidateComparisonModal
          candidates={candidates}
          onClose={() => setShowComparisonModal(false)}
          onSelectCandidate={(id) => onSelectVessel(id)}
        />
      )}
    </div>
  );
};
