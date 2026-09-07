import React from 'react';
import {
  Compass,
  Play,
  Layers,
  Activity,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Radar,
  Sparkles
} from 'lucide-react';
import { ActivePage } from '../types';

interface HeaderProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onRunFullInvestigation: () => void;
  isInvestigating: boolean;
  onOpenUncertaintyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  setActivePage,
  onRunFullInvestigation,
  isInvestigating,
  onOpenUncertaintyModal
}) => {
  const navItems: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Dashboard', icon: <Layers className="w-4 h-4" /> },
    { id: 'detection', label: '1. Detection', icon: <Radar className="w-4 h-4" /> },
    { id: 'drift', label: '2. Drift Hindcast', icon: <Compass className="w-4 h-4" /> },
    { id: 'ais', label: '3. AIS & Attribution', icon: <Activity className="w-4 h-4" /> },
    { id: 'counterfactual', label: '4. Counterfactual', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'report', label: 'Investigation Report', icon: <FileText className="w-4 h-4" /> },
    { id: 'responsible-ai', label: 'Responsible AI', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#050b16]/95 backdrop-blur-md border-b border-[#173260] px-4 py-2.5">
      <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Incident Info */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-ocean-accent/40 shadow-lg shadow-cyan-950/50">
            <Radar className="w-6 h-6 text-ocean-accent animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-wider text-white flex items-center gap-1.5 font-mono">
                OCEAN<span className="text-ocean-accent">-EYE</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-ocean-accent">
                SIH 2026 • SIH26143
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              AI-Powered Oil Spill Detection & Vessel Attribution System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#09152a] p-1 rounded-lg border border-[#173260]">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-white border border-ocean-accent/60 shadow-sm shadow-cyan-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#102244]/50'
                }`}
              >
                <span className={isActive ? 'text-ocean-accent' : 'text-slate-400'}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Side: Demo Incident & Primary CTA */}
        <div className="flex items-center gap-2.5">
          {/* Status & Watermark Badges */}
          <div className="hidden xl:flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[11px] font-mono text-emerald-300 font-semibold tracking-wide">
                SYSTEM ENGINE ONLINE
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-400/90 tracking-tight">
              SYNTHETIC DEMONSTRATION • INCIDENT: OCEAN-001
            </span>
          </div>

          {/* Uncertainty quick trigger */}
          <button
            onClick={onOpenUncertaintyModal}
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-950/30 rounded border border-[#173260] transition-colors"
            title="Evidence & Uncertainty Disclaimers"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onRunFullInvestigation}
            disabled={isInvestigating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all duration-200 shadow-lg ${
              isInvestigating
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/50 cursor-wait'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isInvestigating ? 'animate-spin' : ''}`} />
            {isInvestigating ? 'INVESTIGATING...' : 'RUN FULL INVESTIGATION'}
          </button>
        </div>
      </div>
    </header>
  );
};
