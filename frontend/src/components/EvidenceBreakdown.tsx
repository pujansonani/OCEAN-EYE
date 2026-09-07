import React from 'react';
import {
  CandidateScore,
  EvidenceBreakdown as EvidenceBreakdownType
} from '../types';
import {
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Layers,
  Cpu,
  Compass
} from 'lucide-react';

interface EvidenceBreakdownProps {
  candidate: CandidateScore;
  onCompareCandidates?: () => void;
  onRunCounterfactual?: () => void;
}

export const EvidenceBreakdown: React.FC<EvidenceBreakdownProps> = ({
  candidate,
  onCompareCandidates,
  onRunCounterfactual
}) => {
  const bd = candidate.evidence_breakdown;

  const components: {
    label: string;
    weight: string;
    score: number;
    color: string;
    desc: string;
  }[] = [
    {
      label: 'Proximity to Origin',
      weight: '25%',
      score: bd.proximity_score,
      color: 'bg-cyan-500',
      desc: 'Spatial distance between vessel position and probable origin centroid.'
    },
    {
      label: 'Temporal Overlap',
      weight: '20%',
      score: bd.temporal_score,
      color: 'bg-sky-500',
      desc: 'Overlap with reconstructed 06:00–10:00 UTC release window.'
    },
    {
      label: 'Drift Consistency',
      weight: '20%',
      score: bd.drift_score,
      color: 'bg-teal-500',
      desc: 'Alignment with ocean current (0.35 m/s) and wind transport streamlines.'
    },
    {
      label: 'Trajectory Consistency',
      weight: '15%',
      score: bd.trajectory_score,
      color: 'bg-blue-500',
      desc: 'Vessel transit axis compatibility with reconstructed release vector.'
    },
    {
      label: 'Behavioural Anomaly',
      weight: '10%',
      score: bd.behaviour_score,
      color: 'bg-indigo-500',
      desc: 'Speed dip or abnormal maneuvers during origin corridor transit.'
    },
    {
      label: 'AIS Transmission Continuity',
      weight: '10%',
      score: bd.ais_anomaly_score,
      color: 'bg-amber-500',
      desc: 'AIS transmission gap or anomaly detection score.'
    },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="px-2.5 py-1 rounded bg-red-950/80 border border-red-500/50 text-red-400 font-mono font-bold text-xs">
            HIGH INVESTIGATION PRIORITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono font-bold text-xs">
            MEDIUM INVESTIGATION PRIORITY
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-600 text-slate-300 font-mono font-bold text-xs">
            LOW INVESTIGATION PRIORITY
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-red-500 text-red-400 font-mono font-bold text-xs">
            INSUFFICIENT ATTRIBUTION EVIDENCE
          </span>
        );
    }
  };

  return (
    <div className="bg-[#081326]/90 border border-[#173260] rounded-xl p-5 shadow-2xl space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#173260] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-ocean-accent font-bold">
              RANK #{candidate.rank} CANDIDATE VESSEL
            </span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-xs font-mono text-slate-400">MMSI: {candidate.mmsi}</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">{candidate.vessel_name}</h3>
          <p className="text-xs text-slate-400 font-mono">{candidate.vessel_type}</p>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-mono text-slate-400">Evidence Strength:</span>
            <span className="text-2xl font-black font-mono text-ocean-accent">
              {candidate.evidence_strength_score.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
          </div>
          <div className="mt-1">{getPriorityBadge(candidate.investigation_priority)}</div>
          <span className="text-[10px] font-mono text-slate-500 mt-1">
            Demo Evidence Scores — Not probability of guilt
          </span>
        </div>
      </div>

      {/* 6 Component Breakdown Bars */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-ocean-accent" />
            Explainable Evidence Component Breakdown
          </h4>
          <span className="text-[11px] font-mono text-cyan-300">
            Formula-Calculated Score
          </span>
        </div>

        <div className="space-y-2.5">
          {components.map((comp) => (
            <div key={comp.label} className="bg-[#060e1d] p-2.5 rounded-lg border border-[#132742]">
              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-200 font-semibold">{comp.label}</span>
                  <span className="text-[10px] text-slate-500 font-normal">({comp.weight} weight)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">{comp.desc}</span>
                  <span className="font-bold text-white w-10 text-right">{comp.score.toFixed(1)}</span>
                </div>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${comp.color} rounded-full transition-all duration-500`}
                  style={{ width: `${comp.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Formula & Prototype Disclaimer */}
        <div className="mt-3 p-2.5 rounded-lg bg-[#060e1d]/80 border border-[#173260] flex items-start gap-2 text-xs font-mono text-slate-400">
          <Info className="w-4 h-4 text-ocean-accent shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-300 font-bold">Prototype Design Formula: </span>
            <span className="text-ocean-accent">{bd.weights_formula_applied}</span>
            <p className="text-[10px] text-slate-500 mt-0.5">{bd.design_weights_note}</p>
          </div>
        </div>
      </div>

      {/* Explainability Section: Why This Candidate Ranked Higher / Lower */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-[#060e1d] border border-cyan-500/30">
          <h5 className="text-xs font-mono uppercase font-bold text-cyan-400 flex items-center gap-1.5 mb-2">
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
            Supporting Consistency Factors
          </h5>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {candidate.why_ranked_higher.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-cyan-400 font-bold mt-0.5">&bull;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 rounded-lg bg-[#060e1d] border border-amber-500/30">
          <h5 className="text-xs font-mono uppercase font-bold text-amber-400 flex items-center gap-1.5 mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Divergence / Limiting Factors
          </h5>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {candidate.why_ranked_lower.length > 0 ? (
              candidate.why_ranked_lower.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-amber-400 font-bold mt-0.5">&bull;</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 text-xs italic">
                No significant geographic or temporal divergence observed under current parameters.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Tripartite Evidence Audit Card */}
      <div className="p-3.5 rounded-lg bg-[#060e1d] border border-[#173260] space-y-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px] uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 text-ocean-accent" />
          Evidence Provenance &amp; Hypothesis Audit
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="p-2 rounded bg-[#09152a] border border-[#173260]">
            <span className="text-cyan-400 font-bold block mb-0.5">1. Observed Evidence</span>
            <p className="text-slate-300 leading-tight">{candidate.observed_evidence_summary}</p>
          </div>
          <div className="p-2 rounded bg-[#09152a] border border-[#173260]">
            <span className="text-amber-300 font-bold block mb-0.5">2. Model Inference</span>
            <p className="text-slate-300 leading-tight">{candidate.model_inference_summary}</p>
          </div>
          <div className="p-2 rounded bg-[#09152a] border border-[#173260]">
            <span className="text-purple-300 font-bold block mb-0.5">3. Investigation Hypothesis</span>
            <p className="text-slate-300 leading-tight">{candidate.investigation_hypothesis}</p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#173260]">
        {onCompareCandidates && (
          <button
            onClick={onCompareCandidates}
            className="px-3.5 py-1.5 rounded-lg bg-[#102244] hover:bg-[#173260] border border-[#173260] text-xs font-mono font-bold text-slate-200 transition-colors"
          >
            Compare Candidates Matrix
          </button>
        )}

        {onRunCounterfactual && (
          <button
            onClick={onRunCounterfactual}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500 text-xs font-mono font-bold text-cyan-300 transition-colors flex items-center gap-1.5"
          >
            Run Counterfactual Verification &rarr;
          </button>
        )}
      </div>
    </div>
  );
};
