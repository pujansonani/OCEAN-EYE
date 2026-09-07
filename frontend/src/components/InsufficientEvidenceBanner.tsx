import React from 'react';
import { ShieldAlert, RefreshCw, AlertCircle } from 'lucide-react';

interface InsufficientEvidenceBannerProps {
  threshold: number;
  onResetThreshold: () => void;
}

export const InsufficientEvidenceBanner: React.FC<InsufficientEvidenceBannerProps> = ({
  threshold,
  onResetThreshold
}) => {
  return (
    <div className="p-5 rounded-xl bg-slate-900/90 border border-red-500/60 shadow-2xl space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-red-400 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <span>INSUFFICIENT ATTRIBUTION EVIDENCE STATE</span>
        </div>
        <button
          onClick={onResetThreshold}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Threshold (50%)
        </button>
      </div>

      <p className="text-slate-300 leading-relaxed">
        No candidate vessel meets the current required evidence strength threshold (
        <span className="text-red-400 font-bold">{threshold}%</span>).
        In accordance with responsible AI standards, the system suppresses high-priority attribution
        recommendations rather than forcing a low-confidence candidate.
      </p>

      <div className="p-3 rounded-lg bg-black/50 border border-[#173260] text-[11px] text-slate-400 space-y-1">
        <p className="text-slate-300 font-semibold">Recommended Investigative Protocol:</p>
        <p>&bull; Task additional Sentinel-1 SAR or NISAR passes over downstream coastal zones.</p>
        <p>&bull; Request coastal radar station logs to fill potential AIS gaps.</p>
        <p>&bull; Re-evaluate environmental current fields with high-resolution regional coastal hydrodynamic models.</p>
      </div>
    </div>
  );
};
