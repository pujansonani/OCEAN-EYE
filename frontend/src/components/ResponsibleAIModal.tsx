import React from 'react';
import { useMaritimeStore } from '../store/useMaritimeStore';
import { X, ShieldCheck, AlertTriangle, Scale, CheckCircle2, XCircle } from 'lucide-react';

export const ResponsibleAIModal: React.FC = () => {
  const { activeModal, setActiveModal, evidenceThreshold, setEvidenceThreshold } = useMaritimeStore();

  if (activeModal !== 'RESPONSIBLE_AI') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-mono">
      <div className="bg-[#060e1d] border border-[#172e54] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-xs text-slate-300 space-y-4">
        <div className="flex items-center justify-between border-b border-[#172e54] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              Responsible AI, Scientific Uncertainty &amp; Terminology Governance
            </h3>
          </div>
          <button
            onClick={() => setActiveModal('NONE')}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#102344]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded bg-amber-950/30 border border-amber-500/40 text-slate-200 leading-relaxed text-[11px]">
          <span className="font-bold text-amber-300 block mb-1">Investigation-Support Mandate:</span>
          OCEAN-EYE is engineered strictly as an <strong>investigation-support triage tool</strong> for maritime authorities (Coast Guard, DG Shipping, Pollution Response Units). It connects multi-sensor observations to rank candidate vessels based on available evidence.
          <strong> It NEVER claims that AI proves legal guilt or responsibility.</strong>
        </div>

        {/* 4 Pillars of Uncertainty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
          <div className="p-3 rounded bg-[#081326] border border-[#172e54] space-y-1">
            <span className="text-amber-400 font-bold block">1. SAR Satellite Look-Alike Ambiguity</span>
            <p className="text-slate-400">
              SAR detects surface capillary wave damping. Natural biogenic slicks, low wind zones (&lt; 3.0 m/s), grease ice, and internal waves produce dark signatures. Ground truth or multi-spectral validation is required.
            </p>
          </div>

          <div className="p-3 rounded-bg-[#081326] p-3 rounded bg-[#081326] border border-[#172e54] space-y-1">
            <span className="text-amber-400 font-bold block">2. Hydrodynamic Drift Uncertainty</span>
            <p className="text-slate-400">
              Backward Lagrangian simulations rely on mesoscale reanalysis grids. Coastal eddies and tidal phases introduce dispersion, represented by probabilistic origin regions rather than single coordinates.
            </p>
          </div>

          <div className="p-3 rounded bg-[#081326] border border-[#172e54] space-y-1">
            <span className="text-amber-400 font-bold block">3. AIS Telemetry Gaps</span>
            <p className="text-slate-400">
              AIS anomalies and transmission gaps provide supporting investigative clues only and do not establish malicious intent or illegal discharge.
            </p>
          </div>

          <div className="p-3 rounded bg-[#081326] border border-[#172e54] space-y-1">
            <span className="text-amber-400 font-bold block">4. Mandatory Human Sign-Off</span>
            <p className="text-slate-400">
              Evidence strength scores serve to prioritize patrol assets and port state control inspections. Judicial enforcement requires physical chemical fingerprinting (GC-MS crude biomarkers).
            </p>
          </div>
        </div>

        {/* Terminology Governance Matrix */}
        <div className="p-3 rounded bg-[#081326] border border-[#172e54] space-y-2">
          <span className="font-bold text-white text-xs block">Approved vs Prohibited Terminology:</span>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="space-y-1 text-emerald-300">
              <p className="font-bold text-emerald-400">&check; Approved Probabilistic Terms:</p>
              <p>&bull; Suspected Oil Slick</p>
              <p>&bull; Candidate Vessel / Potentially Relevant Vessel</p>
              <p>&bull; Evidence Strength Score (0–100)</p>
              <p>&bull; Probable Origin Region &amp; Release Window</p>
              <p>&bull; Insufficient Attribution Evidence</p>
              <p>&bull; Counterfactual Hypothesis Test</p>
            </div>
            <div className="space-y-1 text-red-400 line-through opacity-80">
              <p className="font-bold text-red-400 no-underline">&cross; Prohibited Accusatory Terms:</p>
              <p>&bull; Guilty Vessel</p>
              <p>&bull; Confirmed Culprit</p>
              <p>&bull; Responsible Vessel</p>
              <p>&bull; 100% Proved by AI</p>
              <p>&bull; Probability of Guilt</p>
              <p>&bull; Guaranteed Attribution</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#172e54] flex justify-end">
          <button
            onClick={() => setActiveModal('NONE')}
            className="px-4 py-1.5 rounded bg-[#0f244a] hover:bg-[#173a78] border border-cyan-500/40 text-cyan-300 font-bold text-xs"
          >
            I Acknowledge &amp; Understand Disclaimers
          </button>
        </div>
      </div>
    </div>
  );
};
