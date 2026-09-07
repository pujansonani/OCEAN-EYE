import React, { useState } from 'react';
import {
  SpillDetection,
  DriftHindcastResult,
  AISVessel,
  CandidateScore,
  CounterfactualResult,
  ActivePage
} from '../types';
import { MaritimeMap } from '../components/MaritimeMap';
import { PipelineProgress } from '../components/PipelineProgress';
import { EvidenceBreakdown } from '../components/EvidenceBreakdown';
import { CandidateComparisonModal } from '../components/CandidateComparisonModal';
import { LookAlikeWarningBanner } from '../components/LookAlikeWarningBanner';
import { InsufficientEvidenceBanner } from '../components/InsufficientEvidenceBanner';
import {
  Compass,
  Ship,
  Sparkles,
  AlertTriangle,
  FileText,
  Activity,
  ChevronRight,
  TrendingUp,
  Shield,
  Layers
} from 'lucide-react';

interface OverviewDashboardProps {
  detection: SpillDetection;
  drift: DriftHindcastResult;
  vessels: AISVessel[];
  candidates: CandidateScore[];
  selectedVesselId: string;
  onSelectVessel: (vesselId: string) => void;
  counterfactualResult: CounterfactualResult | null;
  currentStepIndex: number;
  setActivePage: (page: ActivePage) => void;
  evidenceThreshold: number;
  setEvidenceThreshold: (val: number) => void;
  onToggleLookAlikeSimulate: () => void;
  isLookAlikeSimulated: boolean;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  detection,
  drift,
  vessels,
  candidates,
  selectedVesselId,
  onSelectVessel,
  counterfactualResult,
  currentStepIndex,
  setActivePage,
  evidenceThreshold,
  setEvidenceThreshold,
  onToggleLookAlikeSimulate,
  isLookAlikeSimulated
}) => {
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const selectedCandidate =
    candidates.find((c) => c.vessel_id === selectedVesselId) || candidates[0];

  const hasInsufficientEvidence =
    candidates.every((c) => c.investigation_priority === 'INSUFFICIENT_EVIDENCE');

  return (
    <div className="space-y-5">
      {/* Look-Alike Warning Banner (if triggered) */}
      <LookAlikeWarningBanner
        check={detection.look_alike_check}
        onToggleSimulate={onToggleLookAlikeSimulate}
        isSimulated={isLookAlikeSimulated}
      />

      {/* Top Summary Cards (6 KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#081326]/90 border border-[#173260] p-3.5 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-colors"></div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Suspected Spill
          </span>
          <div className="text-xl font-black font-mono text-white flex items-baseline gap-1">
            {detection.area_km2}
            <span className="text-xs font-normal text-slate-400">km²</span>
          </div>
          <span className="text-[10px] text-red-400 font-mono mt-1 block">
            SAR C-Band Detection
          </span>
        </div>

        <div className="bg-[#081326]/90 border border-[#173260] p-3.5 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-colors"></div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Detection Confidence
          </span>
          <div className="text-xl font-black font-mono text-cyan-300">
            {detection.confidence}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            U-Net Dark Slick Adapter
          </span>
        </div>

        <div className="bg-[#081326]/90 border border-[#173260] p-3.5 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors"></div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Probable Origin
          </span>
          <div className="text-lg font-extrabold font-mono text-amber-300 truncate">
            Estimated Region
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            4.7h Lagrangian Drift
          </span>
        </div>

        <div className="bg-[#081326]/90 border border-[#173260] p-3.5 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors"></div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Release Window
          </span>
          <div className="text-lg font-bold font-mono text-white truncate">
            {drift.release_window_label}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Estimated Release Period
          </span>
        </div>

        <div className="bg-[#081326]/90 border border-[#173260] p-3.5 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors"></div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Candidate Vessels
          </span>
          <div className="text-xl font-black font-mono text-ocean-accent">
            {candidates.length}
            <span className="text-xs font-normal text-slate-400"> (of {vessels.length})</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Spatiotemporal Match
          </span>
        </div>

        <div className="bg-[#081326]/90 border border-[#173260] p-3.5 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Attribution Status
          </span>
          <div className="text-sm font-bold font-mono text-amber-400 truncate mt-1">
            Under Investigation
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Analyst Verification Req.
          </span>
        </div>
      </div>

      {/* Investigation Pipeline Step Bar */}
      <PipelineProgress
        currentStepIndex={currentStepIndex}
        onStepClick={(pageIdx) => {
          const pages: ActivePage[] = ['overview', 'detection', 'drift', 'ais', 'counterfactual', 'report'];
          setActivePage(pages[pageIdx] || 'overview');
        }}
      />

      {/* Central Grid: Map + Candidates & Evidence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Center Map (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold flex items-center gap-2">
              <Compass className="w-4 h-4 text-ocean-accent" />
              Tactical Geospatial Surveillance Map
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#102244] text-slate-300 border border-[#173260]">
                Incident: OCEAN-001
              </span>
            </div>
          </div>

          <MaritimeMap
            detection={detection}
            drift={drift}
            vessels={vessels}
            selectedVesselId={selectedVesselId}
            onSelectVessel={onSelectVessel}
            counterfactualResult={counterfactualResult}
            heightClass="h-[540px]"
          />

          {/* Candidate Vessel Selection Quick Pills */}
          <div className="bg-[#081326]/90 border border-[#173260] rounded-xl p-3 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5 text-ocean-accent" />
                Filtered Candidate Vessels (3):
              </span>
              <button
                onClick={() => setShowComparisonModal(true)}
                className="text-xs font-mono text-ocean-accent hover:underline flex items-center gap-1"
              >
                Compare All Matrix &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {candidates.map((c) => {
                const isSelected = c.vessel_id === selectedVesselId;
                return (
                  <button
                    key={c.vessel_id}
                    onClick={() => onSelectVessel(c.vessel_id)}
                    className={`p-3 rounded-lg border text-left transition-all duration-150 ${
                      isSelected
                        ? 'bg-cyan-950/60 border-ocean-accent shadow-md shadow-cyan-950 text-white'
                        : 'bg-[#060e1d] border-[#173260] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-ocean-accent">
                        RANK #{c.rank}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          c.investigation_priority === 'HIGH'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : c.investigation_priority === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {c.investigation_priority}
                      </span>
                    </div>

                    <p className="text-xs font-bold truncate">{c.vessel_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{c.vessel_type}</p>

                    <div className="mt-2 flex items-baseline justify-between pt-1 border-t border-[#173260]/60">
                      <span className="text-[10px] text-slate-400 font-mono">Evidence:</span>
                      <span className="text-sm font-black font-mono text-cyan-300">
                        {c.evidence_strength_score.toFixed(1)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right / Evidence & Explainability Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-ocean-accent" />
              Candidate Vessel Attribution Analysis
            </h2>
            <button
              onClick={() => setActivePage('ais')}
              className="text-xs font-mono text-ocean-accent hover:underline flex items-center gap-1"
            >
              Full AIS Studio &rarr;
            </button>
          </div>

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
                onRunCounterfactual={() => setActivePage('counterfactual')}
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
