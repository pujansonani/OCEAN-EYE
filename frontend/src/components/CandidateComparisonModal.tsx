import React from 'react';
import { X, CheckCircle, AlertTriangle, Ship } from 'lucide-react';
import { CandidateScore } from '../types';

interface CandidateComparisonModalProps {
  candidates: CandidateScore[];
  onClose: () => void;
  onSelectCandidate: (vesselId: string) => void;
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  candidates,
  onClose,
  onSelectCandidate
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#081326] border border-[#173260] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#173260] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Ship className="w-5 h-5 text-ocean-accent" />
            <h3 className="text-lg font-bold text-white font-mono">
              Candidate Vessel Comparison Matrix
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4 font-mono">
          Side-by-side evaluation of all candidate vessels meeting spatial and temporal filter criteria.
          Scores represent multi-factor evidence consistency and do not indicate legal guilt.
        </p>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-[#173260]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#060e1d] text-slate-300 uppercase text-[10px] tracking-wider border-b border-[#173260]">
              <tr>
                <th className="p-3">Evaluation Parameter</th>
                {candidates.map((c) => (
                  <th key={c.vessel_id} className="p-3 text-center min-w-[180px]">
                    <div className="font-bold text-white text-xs">{c.vessel_name}</div>
                    <span className="text-[10px] text-ocean-accent font-normal">{c.vessel_type}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132742] text-slate-200">
              <tr className="hover:bg-[#0b1830]">
                <td className="p-3 font-semibold text-slate-300">Evidence Strength Score</td>
                {candidates.map((c) => (
                  <td key={c.vessel_id} className="p-3 text-center">
                    <span className="text-base font-black text-ocean-accent">
                      {c.evidence_strength_score.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400"> / 100</span>
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-[#0b1830]">
                <td className="p-3 font-semibold text-slate-300">Investigation Priority</td>
                {candidates.map((c) => (
                  <td key={c.vessel_id} className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        c.investigation_priority === 'HIGH'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : c.investigation_priority === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {c.investigation_priority}
                    </span>
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-[#0b1830]">
                <td className="p-3 text-slate-400">Proximity to Origin (25%)</td>
                {candidates.map((c) => (
                  <td key={c.vessel_id} className="p-3 text-center font-bold">
                    {c.evidence_breakdown.proximity_score.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-[#0b1830]">
                <td className="p-3 text-slate-400">Temporal Overlap (20%)</td>
                {candidates.map((c) => (
                  <td key={c.vessel_id} className="p-3 text-center font-bold">
                    {c.evidence_breakdown.temporal_score.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-[#0b1830]">
                <td className="p-3 text-slate-400">Drift Vector Consistency (20%)</td>
                {candidates.map((c) => (
                  <td key={c.vessel_id} className="p-3 text-center font-bold">
                    {c.evidence_breakdown.drift_score.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-[#0b1830]">
                <td className="p-3 text-slate-400">Trajectory Compatibility (15%)</td>
                {candidates.map((c) => (
                  <td key={c.vessel_id} className="p-3 text-center font-bold">
                    {c.evidence_breakdown.trajectory_score.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-[#0b1830]">
                <td className="p-3 text-slate-400">Operational Profile (10%)</td>
                {candidates.map((c) => (
                  <td key={c.vessel_id} className="p-3 text-center font-bold">
                    {c.evidence_breakdown.behaviour_score.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-[#0b1830]">
                <td className="p-3 text-slate-400">AIS Anomaly Score (10%)</td>
                {candidates.map((c) => (
                  <td key={c.vessel_id} className="p-3 text-center font-bold">
                    {c.evidence_breakdown.ais_anomaly_score.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr className="bg-[#060e1d]">
                <td className="p-3 font-semibold text-slate-300">Action</td>
                {candidates.map((c) => (
                  <td key={c.vessel_id} className="p-3 text-center">
                    <button
                      onClick={() => {
                        onSelectCandidate(c.vessel_id);
                        onClose();
                      }}
                      className="px-3 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500 rounded text-cyan-300 font-bold transition-all text-xs"
                    >
                      Select Vessel &rarr;
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-4 p-3 rounded-lg bg-[#060e1d] border border-[#173260] text-[11px] font-mono text-slate-400 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Candidate ranking is designed for decision support and investigative prioritization.
            Independent sensor correlation and human validation remain mandatory before regulatory action.
          </span>
        </div>
      </div>
    </div>
  );
};
