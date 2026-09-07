import React, { useState } from 'react';
import {
  SpillDetection,
  DriftHindcastResult,
  AISVessel,
  CandidateScore,
  CounterfactualResult
} from '../types';
import { MaritimeMap } from '../components/MaritimeMap';
import {
  Sparkles,
  RefreshCw,
  Ship,
  CheckCircle,
  AlertTriangle,
  Scale,
  Layers,
  ArrowRight
} from 'lucide-react';

interface CounterfactualViewProps {
  detection: SpillDetection;
  drift: DriftHindcastResult;
  vessels: AISVessel[];
  candidates: CandidateScore[];
  selectedVesselId: string;
  onSelectVessel: (vesselId: string) => void;
  counterfactualResult: CounterfactualResult | null;
  onRunCounterfactual: (vesselId: string) => void;
  isLoading: boolean;
  onProceedToReport: () => void;
}

export const CounterfactualView: React.FC<CounterfactualViewProps> = ({
  detection,
  drift,
  vessels,
  candidates,
  selectedVesselId,
  onSelectVessel,
  counterfactualResult,
  onRunCounterfactual,
  isLoading,
  onProceedToReport
}) => {
  const selectedCandidate =
    candidates.find((c) => c.vessel_id === selectedVesselId) || candidates[0];

  const cf = counterfactualResult;

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#081326]/90 border border-[#173260] p-4 rounded-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-ocean-accent/40">
            <Sparkles className="w-5 h-5 text-ocean-accent" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              Stage 4: Counterfactual Verification &amp; Hypothesis Stress-Testing
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Forward Lagrangian plume simulation: Observed Spill vs Simulated Release Hypothesis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => onRunCounterfactual(selectedVesselId)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-extrabold text-xs rounded-lg transition-all shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Simulating Plume...' : 'Re-Run Counterfactual Simulation'}
          </button>
          <button
            onClick={onProceedToReport}
            className="px-4 py-2 bg-[#102244] hover:bg-[#173260] border border-ocean-accent/50 text-ocean-accent text-xs font-bold rounded-lg transition-all"
          >
            Compile Investigation Dossier &rarr;
          </button>
        </div>
      </div>

      {/* Candidate Vessel Hypothesis Switcher Bar */}
      <div className="bg-[#081326]/90 border border-[#173260] rounded-xl p-3 shadow-lg font-mono">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Ship className="w-3.5 h-3.5 text-ocean-accent" />
            Select Candidate Vessel Hypothesis to Stress-Test:
          </span>
          <span className="text-[10px] text-amber-400">
            Hypothesis Testing — Not Legal Proof
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {candidates.map((c) => {
            const isSelected = c.vessel_id === selectedVesselId;
            return (
              <button
                key={c.vessel_id}
                onClick={() => {
                  onSelectVessel(c.vessel_id);
                  onRunCounterfactual(c.vessel_id);
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-950/60 border-ocean-accent text-white shadow-lg shadow-cyan-950'
                    : 'bg-[#060e1d] border-[#173260] text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-ocean-accent">
                    Hypothesis #{c.rank}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-[#102244] text-cyan-300 border border-[#173260]">
                    Score: {c.evidence_strength_score.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs font-bold">{c.vessel_name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{c.vessel_type}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Map Overlay (Left) + Consistency Metrics Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Map with Counterfactual Simulated Slick (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <MaritimeMap
            detection={detection}
            drift={drift}
            vessels={vessels}
            selectedVesselId={selectedVesselId}
            onSelectVessel={onSelectVessel}
            counterfactualResult={counterfactualResult}
            heightClass="h-[520px]"
          />

          <div className="p-3 rounded-lg bg-[#081326] border border-[#173260] text-xs font-mono text-slate-400 flex items-start gap-2">
            <Scale className="w-4 h-4 text-ocean-accent shrink-0 mt-0.5" />
            <p className="text-slate-300">
              <span className="text-ocean-accent font-bold">Counterfactual Principle: </span>
              {cf?.disclaimer || "Counterfactual verification supports investigation prioritization. It does not establish legal responsibility."}
            </p>
          </div>
        </div>

        {/* Right: Consistency Metrics & Stress-Test Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {cf && (
            <div className="bg-[#081326]/90 border border-[#173260] rounded-xl p-5 shadow-xl space-y-4 font-mono">
              <div className="border-b border-[#173260] pb-3">
                <span className="text-[10px] text-ocean-accent font-bold uppercase tracking-wider">
                  Hypothesis Evaluation Matrix
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {cf.vessel_name}
                </h3>
              </div>

              {/* Hypothesis statement */}
              <div className="p-3 rounded-lg bg-[#060e1d] border border-[#173260] text-xs text-slate-300 leading-relaxed">
                <span className="text-cyan-400 font-bold block mb-1">Simulated Release Scenario:</span>
                <p>{cf.hypothesis_statement}</p>
              </div>

              {/* 4 Core Consistency Indicators */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#060e1d] border border-[#132742]">
                  <span className="text-slate-400">Spatial Consistency:</span>
                  <span
                    className={`font-bold ${
                      cf.spatial_consistency === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {cf.spatial_consistency}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#060e1d] border border-[#132742]">
                  <span className="text-slate-400">Temporal Consistency:</span>
                  <span
                    className={`font-bold ${
                      cf.temporal_consistency === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {cf.temporal_consistency}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#060e1d] border border-[#132742]">
                  <span className="text-slate-400">Drift Vector Consistency:</span>
                  <span
                    className={`font-bold ${
                      cf.drift_consistency === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {cf.drift_consistency}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-ocean-accent/40">
                  <span className="text-white font-bold">Overall Hypothesis Fit:</span>
                  <span className="font-extrabold text-cyan-300 text-sm">
                    {cf.overall_hypothesis_consistency}
                  </span>
                </div>
              </div>

              {/* Quantitative Metrics */}
              <div className="p-3.5 rounded-lg bg-[#060e1d] border border-[#173260] space-y-2 text-xs">
                <span className="text-slate-300 font-bold block mb-1">
                  Quantitative Geometric Overlap:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-[#09152a] border border-[#132742]">
                    <span className="text-slate-400 block">IoU Polygon Overlap:</span>
                    <span className="text-white font-bold text-sm">
                      {(cf.consistency_metrics.iou_overlap * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#09152a] border border-[#132742]">
                    <span className="text-slate-400 block">Centroid Displacement:</span>
                    <span className="text-white font-bold text-sm">
                      {cf.consistency_metrics.centroid_displacement_km} km
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#09152a] border border-[#132742]">
                    <span className="text-slate-400 block">Orientation Delta:</span>
                    <span className="text-white font-bold text-sm">
                      {cf.consistency_metrics.orientation_delta_deg}°
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#09152a] border border-[#132742]">
                    <span className="text-slate-400 block">Vector Alignment:</span>
                    <span className="text-white font-bold text-sm">
                      {((cf.consistency_metrics.transport_vector_alignment ?? 0.90) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
