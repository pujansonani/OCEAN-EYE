import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SARLookAlikeCheck } from '../types';

interface LookAlikeWarningBannerProps {
  check: SARLookAlikeCheck;
  onToggleSimulate?: () => void;
  isSimulated?: boolean;
}

export const LookAlikeWarningBanner: React.FC<LookAlikeWarningBannerProps> = ({
  check,
  onToggleSimulate,
  isSimulated
}) => {
  if (check.is_warning) {
    return (
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/60 shadow-xl text-xs font-mono space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
            <span>SAR LOOK-ALIKE RISK DETECTED: {check.warning_type}</span>
          </div>
          {onToggleSimulate && (
            <button
              onClick={onToggleSimulate}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 font-mono transition-colors"
            >
              Reset Look-Alike Simulation
            </button>
          )}
        </div>

        <p className="text-slate-300 leading-relaxed">
          {check.description}
        </p>

        <div className="p-2 rounded bg-black/40 border border-amber-900/60 text-[11px] text-amber-300/90">
          <span className="font-bold">Caution: </span>
          Satellite dark spots are not necessarily mineral oil slicks. Detection confidence has been reduced.
          Attribution engine requires additional airborne or optical ground-truth verification.
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-[#081326] border border-[#173260] text-xs font-mono flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-300">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>SAR Look-Alike Filter: Nominal backscatter profile (Low risk of natural biogenic film).</span>
      </div>
      {onToggleSimulate && (
        <button
          onClick={onToggleSimulate}
          className="text-[10px] px-2 py-0.5 rounded bg-[#102244] hover:bg-amber-950/40 hover:text-amber-300 hover:border-amber-500/50 border border-[#173260] text-slate-400 font-mono transition-colors"
        >
          Test Look-Alike Edge Case
        </button>
      )}
    </div>
  );
};
