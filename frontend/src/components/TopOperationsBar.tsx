import React, { useState, useEffect } from 'react';
import { useMaritimeStore } from '../store/useMaritimeStore';
import {
  Satellite,
  Map,
  Ship,
  Radar,
  Waves,
  Sparkles,
  FileText,
  Database,
  Search,
  RefreshCw,
  Compass,
  Radio,
  ShieldCheck
} from 'lucide-react';

export const TopOperationsBar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    lookupLiveVessel,
    isLiveSearching,
    liveSearchError,
    liveEventLogs
  } = useMaritimeStore();

  const latestLog = liveEventLogs && liveEventLogs.length > 0 ? liveEventLogs[0] : null;

  const [istTime, setIstTime] = useState<string>('');
  const [gmtTime, setGmtTime] = useState<string>('');
  const [realDateStr, setRealDateStr] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('9870666');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Real IST (Asia/Kolkata)
      const istT = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const istD = now.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
      
      // Real GMT / UTC
      const gmtT = now.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const gmtD = now.toLocaleDateString('en-GB', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' });

      setIstTime(`${istT} IST`);
      setGmtTime(`${gmtT} GMT`);
      setRealDateStr(istD);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      lookupLiveVessel(searchQuery.trim());
    }
  };

  const navItems = [
    { id: 'PLATFORM_PORTAL', label: 'AI Platform', icon: <Satellite className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'MAP', label: 'ECDIS Chart', icon: <Map className="w-3.5 h-3.5" /> },
    { id: 'TARGET_TABLE', label: 'Fleet Targets', icon: <Ship className="w-3.5 h-3.5" /> },
    { id: 'DETECTION', label: 'SAR Radar Lab', icon: <Radar className="w-3.5 h-3.5" /> },
    { id: 'DRIFT', label: 'Drift Hindcast', icon: <Waves className="w-3.5 h-3.5" /> },
    { id: 'ATTRIBUTION', label: 'Attribution', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'COUNTERFACTUAL', label: 'Counterfactual', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'DOSSIER', label: 'Incident Dossier', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'SOURCES', label: 'Sensors', icon: <Database className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <header className="h-12 bg-[#0a101d] border-b border-slate-800/80 px-3 flex items-center justify-between text-xs font-sans select-none z-50 text-slate-200 shrink-0">
      {/* Station Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-600 flex items-center justify-center text-black font-black text-xs shadow-lg shadow-cyan-500/25">
            <span className="font-tech font-extrabold text-slate-950 text-xs tracking-tighter">OE</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-display tracking-tight text-white text-sm font-bold">
              <span>OCEAN<span className="text-cyan-400 font-tech font-bold">&bull;</span>EYE</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-700/60 text-[9px] font-mono font-bold tracking-wider">
                v2.3 PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono hidden xl:block">
              ICG MRCC MUMBAI &bull; SECTOR 7
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-[#060b14] border border-slate-800/90 p-1 rounded-lg overflow-x-auto max-w-full">
        {navItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
              activeView === tab.id
                ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-200 border border-cyan-500/50 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Live AIS Search & Live Clock */}
      <div className="flex items-center gap-2.5 shrink-0">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-1 bg-[#060b14] border border-slate-800 rounded-md px-2 py-1 text-xs">
          <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="IMO / MMSI / Name..."
            className="bg-transparent text-white placeholder:text-slate-600 outline-none w-24 sm:w-36 text-xs"
          />
          <button
            type="submit"
            disabled={isLiveSearching}
            className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 font-bold text-[10px] transition-colors"
          >
            {isLiveSearching ? <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" /> : 'FETCH'}
          </button>
        </form>

        {/* Live AIS Telemetry Stream Ticker */}
        {latestLog && (
          <div className="hidden 2xl:flex items-center gap-2 bg-[#060b14] border border-slate-800/90 px-3 py-1 rounded-md text-[10px] font-mono max-w-sm truncate text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="text-cyan-300 font-bold shrink-0">[{latestLog.source}]</span>
            <span className="truncate text-slate-300">{latestLog.message}</span>
          </div>
        )}

        {/* Real-Time Dual Clock (IST & GMT) with Real Date */}
        <div className="hidden lg:flex items-center gap-2 bg-[#060b14] border border-slate-800 px-3 py-1 rounded-md text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#d8b452] font-semibold">{realDateStr}</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-cyan-300 font-bold">{istTime}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{gmtTime}</span>
        </div>
      </div>
    </header>
  );
};
