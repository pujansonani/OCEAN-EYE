import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface PipelineProgressProps {
  currentStepIndex: number; // 0 to 7
  onStepClick?: (stepIndex: number) => void;
}

export const PipelineProgress: React.FC<PipelineProgressProps> = ({
  currentStepIndex,
  onStepClick
}) => {
  const steps = [
    { label: "Spill Detection", time: "10:45 UTC", pageIndex: 1 },
    { label: "Spill Characterization", time: "10:46 UTC", pageIndex: 1 },
    { label: "Backward Drift", time: "10:47 UTC", pageIndex: 2 },
    { label: "Origin Estimation", time: "10:48 UTC", pageIndex: 2 },
    { label: "AIS Filtering", time: "10:50 UTC", pageIndex: 3 },
    { label: "Evidence Ranking", time: "10:52 UTC", pageIndex: 3 },
    { label: "Counterfactual Test", time: "10:55 UTC", pageIndex: 4 },
    { label: "Human Verification", time: "Pending Analyst", isHuman: true },
  ];

  return (
    <div className="bg-[#081326]/90 border border-[#173260] rounded-xl p-3.5 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-bold tracking-wider text-ocean-accent uppercase flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Investigation Pipeline Sequence
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          Step {Math.min(currentStepIndex + 1, 7)} of 7 Completed
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div
              key={step.label}
              onClick={() => onStepClick && onStepClick(step.pageIndex ?? 0)}
              className={`p-2 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                isDone
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-slate-200 hover:border-cyan-400'
                  : isCurrent
                  ? 'bg-blue-900/40 border-ocean-accent text-white shadow-lg shadow-cyan-950/80 animate-pulse-slow'
                  : step.isHuman
                  ? 'bg-[#060e1d] border-amber-500/30 text-amber-300/80'
                  : 'bg-[#060e1d] border-[#132742] text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold">
                  0{idx + 1}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-ocean-accent animate-ping" />
                ) : step.isHuman ? (
                  <Circle className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>
              <p className="text-[11px] font-semibold leading-tight line-clamp-1">
                {step.label}
              </p>
              <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                {step.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
