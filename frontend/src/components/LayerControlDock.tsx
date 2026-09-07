import React from 'react';
import { useMaritimeStore, LayerVisibility, BasemapType } from '../store/useMaritimeStore';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  EyeOff,
  Ship,
  Satellite,
  Waves,
  Compass,
  Radio,
  Sliders,
  Check
} from 'lucide-react';

export const LayerControlDock: React.FC = () => {
  const {
    layers,
    toggleLayer,
    vesselTypeFilter,
    setVesselTypeFilter,
    vessels,
    basemap,
    setBasemap,
    isLayerDockOpen,
    toggleLayerDock
  } = useMaritimeStore();

  const layerItems: {
    key: keyof LayerVisibility;
    label: string;
    source: string;
    color: string;
  }[] = [
    { key: 'vessels', label: 'AIS Target Fleet', source: 'Live Feeds', color: '#38bdf8' },
    { key: 'vesselTracks', label: 'Historical AIS Tracks', source: 'Ground Station', color: '#94a3b8' },
    { key: 'slickPolygon', label: 'Oil Spill Segmentation', source: 'Sentinel-1A SAR', color: '#ef4444' },
    { key: 'probableOrigin', label: 'Probable Origin Region', source: 'Lagrangian Ellipse', color: '#f59e0b' },
    { key: 'backwardParticles', label: 'Backward Drift Streamlines', source: '4.7h Trajectory', color: '#06b6d4' },
    { key: 'satelliteFootprint', label: 'SAR Scene Swath', source: 'Copernicus IW', color: '#38bdf8' },
    { key: 'oceanCurrents', label: 'INCOIS Ocean Currents', source: '0.35 m/s Field', color: '#00e5ff' },
    { key: 'windVectors', label: 'ECMWF Surface Winds', source: '6.2 m/s ERA5', color: '#a855f7' },
    { key: 'shippingLanes', label: 'TSS Shipping Corridors', source: 'DG Shipping India', color: '#ec4899' },
    { key: 'eezBoundary', label: 'Sovereign EEZ Baseline', source: 'UNCLOS 200nm', color: '#06b6d4' },
    { key: 'bathymetry', label: 'Bathymetry Depth Contours', source: 'GEBCO Contours', color: '#2563eb' },
  ];

  const candidateCount = vessels.filter((v) => v.is_candidate).length;
  const activeCount = Object.values(layers).filter(Boolean).length;

  if (!isLayerDockOpen) {
    return (
      <div className="absolute top-3 left-3 z-[400]">
        <button
          onClick={toggleLayerDock}
          className="flex items-center gap-2 px-3 py-2 bg-[#0a1220]/95 backdrop-blur-md border border-slate-700/80 rounded-lg text-slate-200 hover:text-white hover:border-cyan-500/60 shadow-2xl transition-all group font-sans text-xs"
          title="Open GIS Layer Manager"
        >
          <div className="relative">
            <Layers className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <span className="font-semibold tracking-wide">GIS LAYERS ({activeCount})</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-3 left-3 z-[400] w-72 bg-[#0a1220]/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl font-sans text-slate-200 select-none overflow-hidden flex flex-col max-h-[calc(100vh-130px)] transition-all">
      {/* Header */}
      <div className="p-3 bg-[#0d1627] border-b border-slate-700/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white text-xs tracking-wider uppercase">
              GIS Layer Manager
            </div>
            <div className="text-[10px] text-slate-400">
              {activeCount} of {layerItems.length} active layers
            </div>
          </div>
        </div>
        <button
          onClick={toggleLayerDock}
          className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800/80 transition-colors"
          title="Collapse Layer Manager"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Toggles List */}
      <div className="p-2 space-y-1 overflow-y-auto flex-1 text-xs">
        {layerItems.map((item) => {
          const isVisible = layers[item.key];
          return (
            <label
              key={item.key}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                isVisible
                  ? 'bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50'
                  : 'hover:bg-slate-800/30 opacity-60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => toggleLayer(item.key)}
                  className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-500 accent-cyan-400 cursor-pointer"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className={`truncate text-xs ${isVisible ? 'text-slate-100 font-medium' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-mono ml-1">
                {item.source}
              </span>
            </label>
          );
        })}
      </div>

      {/* Vessel Filters */}
      <div className="p-3 bg-[#0d1627] border-t border-slate-700/80 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Target Filter
          </span>
          <span className="text-cyan-400 font-mono text-[11px] font-bold">{vessels.length} Total</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { id: 'ALL', label: `All Fleet (${vessels.length})` },
            { id: 'CANDIDATES', label: `Candidates (${candidateCount})`, isAlert: true },
            { id: 'TANKER', label: 'Tankers' },
            { id: 'CARGO', label: 'Cargo / Bulk' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setVesselTypeFilter(f.id)}
              className={`px-2 py-1.5 rounded-md border text-left text-xs font-medium truncate transition-all ${
                vesselTypeFilter === f.id
                  ? f.isAlert
                    ? 'bg-red-950 text-red-200 border-red-600 shadow-sm font-bold'
                    : 'bg-cyan-950/80 text-cyan-200 border-cyan-500 shadow-sm font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
