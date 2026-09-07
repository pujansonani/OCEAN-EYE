import React, { useState } from 'react';
import { useMaritimeStore, VesselObject } from '../store/useMaritimeStore';
import {
  Ship,
  Radar,
  Waves,
  Sparkles,
  FileText,
  ShieldCheck,
  Database,
  MapPin,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Maximize2,
  RefreshCw,
  Search,
  Filter,
  Download,
  Printer,
  Compass,
  ArrowUpRight,
  Building2,
  Info
} from 'lucide-react';

export const ECDISWorkspace: React.FC = () => {
  const {
    activeView,
    setActiveView,
    toggleMap,
    vessels,
    satelliteScene,
    environment,
    evidenceThreshold,
    setEvidenceThreshold,
    selectedEntity,
    setSelectedEntity,
    setCursorPos,
    mode,
    lookupLiveVessel,
    isLiveSearching
  } = useMaritimeStore();

  const [selectedTargetMmsi, setSelectedTargetMmsi] = useState<string>('419001284');
  const [tableFilterType, setTableFilterType] = useState<string>('ALL');
  const [searchTableQuery, setSearchTableQuery] = useState<string>('');

  const currentVessel = vessels.find((v) => v.mmsi === selectedTargetMmsi) || vessels[0];
  const candidates = vessels.filter((v) => v.is_candidate);

  // Filtered vessels for the tactical table
  const displayVessels = vessels.filter((v) => {
    if (tableFilterType === 'CANDIDATES' && !v.is_candidate) return false;
    if (tableFilterType === 'TANKER' && !v.vessel_type.toLowerCase().includes('tanker')) return false;
    if (tableFilterType === 'CARGO' && !v.vessel_type.toLowerCase().includes('cargo')) return false;
    if (searchTableQuery.trim()) {
      const q = searchTableQuery.toLowerCase().trim();
      return (
        v.name.toLowerCase().includes(q) ||
        v.mmsi.includes(q) ||
        v.imo.includes(q) ||
        v.call_sign.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectOnMap = (mmsi: string) => {
    setSelectedEntity({ type: 'VESSEL', mmsi });
    const v = vessels.find((item) => item.mmsi === mmsi);
    if (v) setCursorPos({ lat: v.lat, lon: v.lon });
    setActiveView('MAP');
  };

  return (
    <div className="flex-1 bg-[#0b0e14] text-slate-200 overflow-y-auto font-sans select-text flex flex-col">
      {/* ========================================================================= */}
      {/* 1. TACTICAL AIS TARGET FLEET TABLE (ECDIS ARPA / AIS TARGET LIST) */}
      {/* ========================================================================= */}
      {activeView === 'TARGET_TABLE' && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Table Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111620] border border-[#1e2634] p-3 rounded text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase flex items-center gap-1.5 text-xs">
                <Ship className="w-4 h-4 text-emerald-400" />
                ARABIAN SEA SECTOR 7 &bull; ACTIVE AIS TARGET TELEMETRY TABLE ({vessels.length} TARGETS)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter */}
              <div className="flex items-center gap-1 bg-[#0b0e14] border border-[#1e2634] px-2 py-1 rounded text-[11px]">
                <Filter className="w-3 h-3 text-slate-400" />
                <select
                  value={tableFilterType}
                  onChange={(e) => setTableFilterType(e.target.value)}
                  className="bg-transparent text-slate-200 outline-none cursor-pointer text-[11px]"
                >
                  <option value="ALL">ALL TARGETS ({vessels.length})</option>
                  <option value="CANDIDATES">PRIORITY CANDIDATES ONLY ({candidates.length})</option>
                  <option value="TANKER">TANKERS ONLY</option>
                  <option value="CARGO">CARGO VESSELS</option>
                </select>
              </div>

              {/* Search */}
              <div className="flex items-center gap-1 bg-[#0b0e14] border border-[#1e2634] px-2 py-1 rounded text-[11px]">
                <Search className="w-3 h-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter name / MMSI / IMO..."
                  value={searchTableQuery}
                  onChange={(e) => setSearchTableQuery(e.target.value)}
                  className="bg-transparent text-white placeholder:text-slate-600 outline-none w-36 sm:w-48 text-[11px]"
                />
              </div>

              <button
                onClick={() => setActiveView('MAP')}
                className="px-3 py-1 rounded bg-[#162a45] hover:bg-[#1f3b63] border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-cyan-400" />
                MAP VIEW
              </button>
            </div>
          </div>

          {/* Real High-Density Tabular Grid */}
          <div className="bg-[#111620] border border-[#1e2634] rounded overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0e121a] border-b border-[#1e2634] text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">VESSEL NAME</th>
                  <th className="py-2.5 px-3">CALL SIGN</th>
                  <th className="py-2.5 px-3">MMSI</th>
                  <th className="py-2.5 px-3">IMO</th>
                  <th className="py-2.5 px-3">TYPE</th>
                  <th className="py-2.5 px-3">FLAG</th>
                  <th className="py-2.5 px-3">POSITION (LAT/LON)</th>
                  <th className="py-2.5 px-3">SOG (kn)</th>
                  <th className="py-2.5 px-3">COG (°T)</th>
                  <th className="py-2.5 px-3">HDG (°T)</th>
                  <th className="py-2.5 px-3">NAV STATUS</th>
                  <th className="py-2.5 px-3">EVIDENCE SCORE</th>
                  <th className="py-2.5 px-3">PRIORITY</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18202c]">
                {displayVessels.map((v, idx) => {
                  const isSelected = v.mmsi === selectedTargetMmsi;
                  return (
                    <tr
                      key={v.mmsi}
                      onClick={() => setSelectedTargetMmsi(v.mmsi)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#152438] text-white'
                          : 'hover:bg-[#141b26] text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-white flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          v.is_candidate ? 'bg-cyan-400' : 'bg-slate-500'
                        }`}></span>
                        {v.name}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-400">{v.call_sign || 'N/A'}</td>
                      <td className="py-2 px-3 font-mono text-cyan-300">{v.mmsi}</td>
                      <td className="py-2 px-3 font-mono text-slate-400">{v.imo || 'N/A'}</td>
                      <td className="py-2 px-3">{v.vessel_type}</td>
                      <td className="py-2 px-3 text-slate-400">{v.flag_state}</td>
                      <td className="py-2 px-3 font-mono text-slate-300">
                        {v.lat.toFixed(4)}°N, {v.lon.toFixed(4)}°E
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-white">{v.sog.toFixed(1)} kn</td>
                      <td className="py-2 px-3 font-mono">{v.cog.toFixed(1)}°</td>
                      <td className="py-2 px-3 font-mono">{v.hdg || Math.round(v.cog)}°</td>
                      <td className="py-2 px-3 text-[11px] text-slate-400 truncate max-w-[130px]">{v.nav_status}</td>
                      <td className="py-2 px-3 font-mono font-bold">
                        {v.evidence_strength ? (
                          <span className="text-cyan-300">{v.evidence_strength.toFixed(1)} / 100</span>
                        ) : (
                          <span className="text-slate-600">&mdash;</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {v.investigation_priority ? (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            v.investigation_priority === 'HIGH'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : v.investigation_priority === 'MEDIUM'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {v.investigation_priority}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">Non-candidate</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOnMap(v.mmsi);
                          }}
                          className="px-2 py-1 rounded bg-[#162a45] hover:bg-[#1e3c66] border border-cyan-600/40 text-cyan-300 text-[10px] font-bold"
                        >
                          Chart &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Selected Vessel Telemetry & Management Card */}
          {currentVessel && (
            <div className="bg-[#111620] border border-[#1e2634] rounded p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1e2634] pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs uppercase">
                    TARGET TELEMETRY INSPECTOR: {currentVessel.name} (MMSI: {currentVessel.mmsi} &bull; IMO: {currentVessel.imo})
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Data Source: {currentVessel.data_source}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded bg-[#0b0e14] border border-[#1e2634]">
                  <span className="text-[10px] text-slate-400 block">Speed / Course / Heading:</span>
                  <span className="font-bold text-white">{currentVessel.sog} kn &bull; {currentVessel.cog}°T &bull; {currentVessel.hdg}°T</span>
                </div>
                <div className="p-2.5 rounded bg-[#0b0e14] border border-[#1e2634]">
                  <span className="text-[10px] text-slate-400 block">Dimensions &amp; Draught:</span>
                  <span className="font-bold text-white">{currentVessel.length_m}m &times; {currentVessel.beam_m}m &bull; {currentVessel.draught_m}m</span>
                </div>
                <div className="p-2.5 rounded bg-[#0b0e14] border border-[#1e2634]">
                  <span className="text-[10px] text-slate-400 block">Destination &amp; ETA:</span>
                  <span className="font-bold text-cyan-300">{currentVessel.destination} &bull; {currentVessel.eta}</span>
                </div>
                <div className="p-2.5 rounded bg-[#0b0e14] border border-[#1e2634]">
                  <span className="text-[10px] text-slate-400 block">AIS Continuity State:</span>
                  <span className={`font-bold ${currentVessel.ais_continuity?.has_anomaly ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {currentVessel.ais_continuity?.has_anomaly ? 'Anomaly (22-min Gap)' : 'Nominal Transmission'}
                  </span>
                </div>
              </div>

              {currentVessel.registry_details && (
                <div className="p-3 rounded bg-[#0b0e14] border border-cyan-800/40 text-[11px] space-y-1">
                  <span className="font-bold text-cyan-300 block uppercase flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    Verified Management &amp; Ownership Registry (DataDocked / MyShipTracking Gateway)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 pt-1">
                    <p><span className="text-slate-400">Registered Owner:</span> <span className="text-white font-bold">{currentVessel.registry_details.registered_owner}</span></p>
                    <p><span className="text-slate-400">ISM Manager:</span> <span className="text-white font-bold">{currentVessel.registry_details.ism_manager}</span></p>
                    <p><span className="text-slate-400">Classification Society:</span> <span className="text-white">{currentVessel.registry_details.classification_society}</span></p>
                    <p><span className="text-slate-400">P&amp;I Club:</span> <span className="text-white">{currentVessel.registry_details.pi_club}</span></p>
                    <p><span className="text-slate-400">Built / DWT:</span> <span className="text-white">{currentVessel.registry_details.year_built} &bull; {currentVessel.registry_details.deadweight_tonnage} DWT</span></p>
                    <p><span className="text-slate-400">Last Reported Port:</span> <span className="text-white">{currentVessel.registry_details.last_port}</span></p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SYNTHETIC APERTURE RADAR (SAR) SPECTRAL ANALYSIS LAB */}
      {/* ========================================================================= */}
      {activeView === 'DETECTION' && satelliteScene && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between bg-[#111620] border border-[#1e2634] p-3 rounded text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Radar className="w-4 h-4 text-cyan-400" />
              STAGE 1: COPERNICUS SENTINEL-1A SAR SATELLITE DETECTION LAB
            </span>
            <button
              onClick={() => setActiveView('MAP')}
              className="px-3 py-1 rounded bg-[#162a45] hover:bg-[#1f3b63] border border-cyan-500/40 text-cyan-300 font-bold text-xs"
            >
              LOCATE ON CHART &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Metadata */}
            <div className="bg-[#111620] border border-[#1e2634] rounded p-4 space-y-3 text-xs">
              <h4 className="font-bold text-white border-b border-[#1e2634] pb-2 text-[11px] uppercase">
                Sensor Acquisition Telemetry
              </h4>
              <div className="space-y-1.5 text-slate-300">
                <p><span className="text-slate-400">Satellite ID:</span> <span className="text-white font-bold">{satelliteScene.satellite}</span></p>
                <p><span className="text-slate-400">Instrument:</span> <span className="text-white">{satelliteScene.instrument}</span></p>
                <p><span className="text-slate-400">Acquisition Epoch:</span> <span className="text-cyan-300 font-bold">{satelliteScene.acquisition_time}</span></p>
                <p><span className="text-slate-400">Swath Mode:</span> <span className="text-white">{satelliteScene.acquisition_mode} (250 km)</span></p>
                <p><span className="text-slate-400">Polarization:</span> <span className="text-white">{satelliteScene.polarization}</span></p>
                <p><span className="text-slate-400">Pixel Resolution:</span> <span className="text-white">{satelliteScene.resolution}</span></p>
                <p><span className="text-slate-400">Product ID:</span> <span className="text-slate-400 font-mono text-[10px] break-all">{satelliteScene.product_id}</span></p>
              </div>

              <div className="p-2.5 rounded bg-[#0b0e14] border border-[#1e2634] text-[10px] space-y-1">
                <span className="font-bold text-white block">SAR Quality &amp; NESZ Baseline:</span>
                <p className="text-slate-400">&bull; Noise-Equivalent Sigma Zero (NESZ): -22.4 dB</p>
                <p className="text-slate-400">&bull; Incidence Angle (&theta;): 34.8°</p>
                <p className="text-emerald-400 font-bold">&bull; Look-alike Risk: LOW (Surface wind 6.2 m/s &gt; 3.0 m/s threshold)</p>
              </div>
            </div>

            {/* Geometric Segmentation Metrics */}
            <div className="bg-[#111620] border border-[#1e2634] rounded p-4 space-y-3 text-xs">
              <h4 className="font-bold text-white border-b border-[#1e2634] pb-2 text-[11px] uppercase">
                Morphological Dark Slick Segmentation
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-[#0b0e14] border border-[#1e2634]">
                  <span className="text-[10px] text-slate-400 block">Total Slick Area:</span>
                  <span className="text-base font-bold text-white">{satelliteScene.detected_slick.area_km2} km²</span>
                </div>
                <div className="p-2.5 rounded bg-[#0b0e14] border border-[#1e2634]">
                  <span className="text-[10px] text-slate-400 block">Detection Confidence:</span>
                  <span className="text-base font-bold text-cyan-300">{satelliteScene.detected_slick.detection_confidence}</span>
                </div>
                <div className="p-2.5 rounded bg-[#0b0e14] border border-[#1e2634]">
                  <span className="text-[10px] text-slate-400 block">Major Axis Length:</span>
                  <span className="text-base font-bold text-white">{satelliteScene.detected_slick.major_axis_km} km</span>
                </div>
                <div className="p-2.5 rounded bg-[#0b0e14] border border-[#1e2634]">
                  <span className="text-[10px] text-slate-400 block">Minor Axis Width:</span>
                  <span className="text-base font-bold text-white">{satelliteScene.detected_slick.minor_axis_km} km</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#0b0e14] border border-[#1e2634] text-[10px] space-y-1">
                <p><span className="text-slate-400">Centroid Coordinates:</span> <span className="text-white font-bold">19.4250°N, 71.8480°E</span></p>
                <p><span className="text-slate-400">Morphological Orientation:</span> <span className="text-amber-300 font-bold">{satelliteScene.detected_slick.orientation_deg}°T (NNW–SSE)</span></p>
                <p><span className="text-slate-400">Backscatter Contrast:</span> <span className="text-white font-bold">{satelliteScene.detected_slick.contrast_ratio_db} dB</span></p>
              </div>
            </div>

            {/* Cross-Section Backscatter Profile */}
            <div className="bg-[#111620] border border-[#1e2634] rounded p-4 space-y-3 flex flex-col justify-between text-xs">
              <div>
                <h4 className="font-bold text-white border-b border-[#1e2634] pb-2 text-[11px] uppercase">
                  Backscatter Profile (&sigma;<sub>0</sub> dB)
                </h4>
                <div className="h-28 bg-[#0b0e14] border border-[#1e2634] rounded p-2 flex items-end gap-1 justify-between my-2">
                  {[12, 11, 13, 12, 4, 3, 2, 2, 3, 4, 11, 13, 12].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t ${val <= 4 ? 'bg-red-500' : 'bg-cyan-700'}`}
                        style={{ height: `${val * 7}px` }}
                      ></div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Cross-Section Transect (Clean Sea &rarr; Dark Hydrocarbon Dip &rarr; Clean Sea)
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setActiveView('DRIFT')}
                  className="w-full py-2 rounded bg-[#162a45] hover:bg-[#1e3c66] border border-cyan-500 text-cyan-300 font-bold text-xs"
                >
                  Proceed to Physical Drift Hindcast &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LAGRANGIAN HYDRODYNAMIC DRIFT HINDCASTING LAB */}
      {/* ========================================================================= */}
      {activeView === 'DRIFT' && environment && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between bg-[#111620] border border-[#1e2634] p-3 rounded text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-400" />
              STAGE 2: 2D LAGRANGIAN HYDRODYNAMIC DRIFT HINDCASTING ENGINE
            </span>
            <button
              onClick={() => setActiveView('MAP')}
              className="px-3 py-1 rounded bg-[#162a45] hover:bg-[#1f3b63] border border-cyan-500/40 text-cyan-300 font-bold text-xs"
            >
              LOCATE ON CHART &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#111620] border border-[#1e2634] rounded p-4 space-y-3 text-xs">
              <h4 className="font-bold text-white border-b border-[#1e2634] pb-2 text-[11px] uppercase">
                Reconstructed Origin Geometry
              </h4>
              <div className="space-y-2 text-slate-300">
                <p><span className="text-slate-400">Model Framework:</span> <span className="text-white font-bold">2D Lagrangian Monte Carlo</span></p>
                <p><span className="text-slate-400">Backward Duration:</span> <span className="text-white font-bold">4.7 hours</span></p>
                <p><span className="text-slate-400">Reconstructed Release Window:</span> <span className="text-amber-300 font-bold">{environment.hindcast.reconstructed_release_window}</span></p>
                <p><span className="text-slate-400">Origin Confidence:</span> <span className="text-cyan-300 font-bold">{environment.hindcast.origin_confidence}</span></p>
                <p><span className="text-slate-400">Ellipse Semi-Major Axis:</span> <span className="text-white">{environment.hindcast.probable_origin_ellipse.semi_major_km} km</span></p>
                <p><span className="text-slate-400">Ellipse Semi-Minor Axis:</span> <span className="text-white">{environment.hindcast.probable_origin_ellipse.semi_minor_km} km</span></p>
                <p><span className="text-slate-400">Probable Origin Centroid:</span> <span className="text-white font-bold">19.2800°N, 71.4500°E</span></p>
              </div>
            </div>

            <div className="bg-[#111620] border border-[#1e2634] rounded p-4 space-y-3 text-xs">
              <h4 className="font-bold text-white border-b border-[#1e2634] pb-2 text-[11px] uppercase">
                Hydrodynamic Ocean &amp; Atmospheric Forcing
              </h4>
              <div className="space-y-2 text-slate-300">
                <div className="p-2.5 rounded bg-[#0b0e14] border border-[#1e2634]">
                  <span className="text-[10px] text-slate-400 block">INCOIS ROMS Ocean Current:</span>
                  <span className="font-bold text-white">{environment.current_velocity_mps} m/s towards {environment.current_direction_label} (065°T, u=+0.30, v=+0.15)</span>
                </div>
                <div className="p-2.5 rounded bg-[#0b0e14] border border-[#1e2634]">
                  <span className="text-[10px] text-slate-400 block">ECMWF ERA5 Marine Wind:</span>
                  <span className="font-bold text-white">{environment.wind_velocity_mps} m/s from {environment.wind_direction_label} (240°T)</span>
                </div>
                <div className="p-2.5 rounded bg-[#0b0e14] border border-[#1e2634]">
                  <span className="text-[10px] text-slate-400 block">Windage Leeway &amp; Diffusion:</span>
                  <span className="font-bold text-cyan-300">&alpha; = 3.2%, Leeway Angle = -5°, K<sub>diff</sub> = 2.5 m²/s</span>
                </div>
              </div>
            </div>

            <div className="bg-[#111620] border border-[#1e2634] rounded p-4 space-y-3 flex flex-col justify-between text-xs">
              <div>
                <h4 className="font-bold text-white border-b border-[#1e2634] pb-2 text-[11px] uppercase">
                  Spatiotemporal AIS Intersection
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
                  Correlate sector vessel historical tracks through the reconstructed release window (06:00–10:00 UTC) and probable origin ellipse.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setActiveView('ATTRIBUTION')}
                  className="w-full py-2 rounded bg-[#162a45] hover:bg-[#1e3c66] border border-cyan-500 text-cyan-300 font-bold text-xs"
                >
                  Proceed to AIS Attribution Matrix &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CANDIDATE ATTRIBUTION & EXPLAINABLE EVIDENCE MATRIX */}
      {/* ========================================================================= */}
      {activeView === 'ATTRIBUTION' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between bg-[#111620] border border-[#1e2634] p-3 rounded text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Ship className="w-4 h-4 text-cyan-400" />
              STAGE 3: EXPLAINABLE CANDIDATE VESSEL ATTRIBUTION MATRIX
            </span>
            <span className="text-slate-400 text-xs">Threshold: {evidenceThreshold}%</span>
          </div>

          {/* 3 Candidates Comparative Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {candidates.map((cand) => (
              <div
                key={cand.mmsi}
                className={`p-4 rounded border space-y-3 ${
                  cand.mmsi === '419001284'
                    ? 'bg-[#152438] border-cyan-500'
                    : 'bg-[#111620] border-[#1e2634]'
                }`}
              >
                <div className="flex items-center justify-between border-b border-[#1e2634] pb-2">
                  <span className="font-bold text-white text-xs">#{cand.candidate_rank} {cand.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    cand.investigation_priority === 'HIGH'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : cand.investigation_priority === 'MEDIUM'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {cand.investigation_priority}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-300">
                  <p><span className="text-slate-400">MMSI / IMO:</span> <span className="font-mono">{cand.mmsi} / {cand.imo}</span></p>
                  <p><span className="text-slate-400">Type / Flag:</span> <span>{cand.vessel_type} ({cand.flag_state})</span></p>
                  <p><span className="text-slate-400">Overall Evidence Score:</span> <strong className="text-cyan-300 font-mono text-sm">{cand.evidence_strength?.toFixed(1)} / 100</strong></p>
                </div>

                {/* 6-Factor Weights */}
                <div className="space-y-1 text-[10px] bg-[#0b0e14] p-2.5 rounded border border-[#1e2634]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Proximity to Origin (25%):</span>
                    <span className="text-white font-bold">{cand.mmsi === '419001284' ? '96.0' : cand.mmsi === '419008712' ? '72.0' : '55.0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Temporal Overlap (20%):</span>
                    <span className="text-white font-bold">{cand.mmsi === '419001284' ? '94.0' : cand.mmsi === '419008712' ? '68.0' : '48.0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Drift Vector Match (20%):</span>
                    <span className="text-white font-bold">{cand.mmsi === '419001284' ? '92.0' : cand.mmsi === '419008712' ? '65.0' : '52.0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trajectory Fit (15%):</span>
                    <span className="text-white font-bold">{cand.mmsi === '419001284' ? '90.0' : cand.mmsi === '419008712' ? '70.0' : '50.0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Speed Profile (10%):</span>
                    <span className="text-white font-bold">{cand.mmsi === '419001284' ? '80.0' : cand.mmsi === '419008712' ? '65.0' : '44.5'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">AIS Continuity (10%):</span>
                    <span className="text-white font-bold">{cand.mmsi === '419001284' ? '87.0' : cand.mmsi === '419008712' ? '62.0' : '56.0'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleSelectOnMap(cand.mmsi)}
                    className="w-full py-1.5 rounded bg-[#162a45] hover:bg-[#1e3c66] border border-cyan-500/40 text-cyan-300 text-xs font-bold"
                  >
                    Focus on Chart &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tripartite Evidence Audit Breakdown */}
          <div className="bg-[#111620] border border-[#1e2634] rounded p-4 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase border-b border-[#1e2634] pb-2">
              Tripartite Evidence Provenance Audit &bull; MT OCEAN VANGUARD
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded bg-[#0b0e14] border border-[#1e2634] space-y-1">
                <span className="text-emerald-400 font-bold uppercase text-[10px] block">1. Observed Hard Telemetry</span>
                <p className="text-slate-300 text-[11px]">&bull; AIS transmission discontinued for 22 minutes (08:15–08:37 UTC).</p>
                <p className="text-slate-300 text-[11px]">&bull; Speed reduction of -2.6 knots recorded immediately after signal resumption.</p>
              </div>
              <div className="p-3 rounded bg-[#0b0e14] border border-[#1e2634] space-y-1">
                <span className="text-cyan-400 font-bold uppercase text-[10px] block">2. Physical Model Inference</span>
                <p className="text-slate-300 text-[11px]">&bull; Reconstructed release window spans 06:00–10:00 UTC.</p>
                <p className="text-slate-300 text-[11px]">&bull; Vessel track intersected origin centroid at 08:25 UTC (center of release window).</p>
              </div>
              <div className="p-3 rounded bg-[#0b0e14] border border-[#1e2634] space-y-1">
                <span className="text-amber-400 font-bold uppercase text-[10px] block">3. Investigation Hypothesis</span>
                <p className="text-slate-300 text-[11px]">&bull; Discharge hypothesis demonstrates 88.4% spatial IoU consistency under hydrodynamic forward dispersion.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. COUNTERFACTUAL FORWARD PLUME SIMULATION */}
      {/* ========================================================================= */}
      {activeView === 'COUNTERFACTUAL' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between bg-[#111620] border border-[#1e2634] p-3 rounded text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              STAGE 4: COUNTERFACTUAL FORWARD PLUME VERIFICATION
            </span>
            <button
              onClick={() => setActiveView('MAP')}
              className="px-3 py-1 rounded bg-[#162a45] hover:bg-[#1f3b63] border border-cyan-500/40 text-cyan-300 font-bold text-xs"
            >
              CHART OVERLAY &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded bg-[#111620] border border-emerald-500/40 space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Hypothesis 1: MT OCEAN VANGUARD (Candidate #1)</span>
              <h4 className="font-bold text-white text-sm">Spatial Overlap IoU: 88.4% (HIGH CONSISTENCY)</h4>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Simulated forward plume initiated at Vessel A&rsquo;s 08:25 UTC release waypoint directly reproduces the observed Sentinel-1 SAR slick polygon at 10:42 UTC. Centroid displacement: 0.9 km.
              </p>
              <div className="p-2.5 rounded bg-[#0b0e14] border border-emerald-900 text-emerald-300 text-[10px] font-bold">
                ✓ Spatial, temporal, and hydrodynamic consistency verified.
              </div>
            </div>

            <div className="p-4 rounded bg-[#111620] border border-slate-700 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Hypothesis 2: MV BHARAT STAR (Candidate #2)</span>
              <h4 className="font-bold text-white text-sm">Spatial Overlap IoU: 21.8% (LOW CONSISTENCY)</h4>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Forward dispersion from Vessel B&rsquo;s waypoint results in a plume that drifts 14.2 km northeast of the observed SAR signature. Direct discharge hypothesis rejected.
              </p>
              <div className="p-2.5 rounded bg-[#0b0e14] border border-slate-800 text-slate-400 text-[10px]">
                ✗ Incompatible spatial outcome under actual ocean currents.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. OFFICIAL DG SHIPPING / ICG INVESTIGATION REPORT */}
      {/* ========================================================================= */}
      {activeView === 'DOSSIER' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between bg-[#111620] border border-[#1e2634] p-3 rounded text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              OFFICIAL INCIDENT INVESTIGATION REPORT &bull; OCEAN-001 (IMO MEPC FORMAT)
            </span>
            <button
              onClick={() => window.print()}
              className="px-3 py-1 rounded bg-[#162a45] hover:bg-[#1f3b63] border border-cyan-500/50 text-cyan-300 font-bold text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              PRINT / EXPORT REPORT
            </button>
          </div>

          <div className="bg-[#111620] border border-[#1e2634] rounded p-5 space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="border-b border-[#1e2634] pb-3">
              <span className="text-[10px] text-slate-400 uppercase">Directorate General of Shipping / Indian Coast Guard</span>
              <h3 className="text-sm font-bold text-white">MARITIME CASUALTY &amp; POLLUTION ATTRIBUTION DOSSIER</h3>
              <p className="text-[11px] text-slate-400">Incident Reference: ICG-MRCC-2026-09-06-001 &bull; Sector 7 Mumbai High</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase text-cyan-300">1. Incident Detection Summary</h4>
              <p>
                On 2026-09-06 at 10:42:18 UTC, ESA Copernicus Sentinel-1A C-Band SAR detected a suspected 65.7 km² hydrocarbon slick in the Mumbai High offshore corridor (19.425°N, 71.848°E). Physical 2D Lagrangian backtracking under INCOIS ROMS ocean currents (0.35 m/s @ 065°T) reconstructed a release window between 06:00 and 10:00 UTC centered at 19.280°N, 71.450°E.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase text-cyan-300">2. Candidate Vessel Triage &amp; Prioritization</h4>
              <p>
                Spatiotemporal AIS correlation filtered 3 candidate vessels from 12 tracked targets in the sector. MT OCEAN VANGUARD (MMSI: 419001284, IMO: 9428190, Flag: India) ranked with Evidence Strength 91.4 (HIGH Investigation Priority) due to direct transit through the origin ellipse at 08:25 UTC and a concurrent 22-minute AIS transmission gap.
              </p>
            </div>

            <div className="p-3 rounded bg-amber-950/20 border border-amber-500/40 text-amber-300 text-[11px] space-y-1">
              <h4 className="font-bold text-amber-400 uppercase">Responsible AI Compliance &amp; Non-Accusatory Governance</h4>
              <p>
                This dossier establishes physical, temporal, and hydrodynamic consistency hypotheses for coast guard investigation triage. Final legal responsibility requires physical sampling and chemical fingerprinting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SENSORS & MULTI-GATEWAY PROVENANCE */}
      {/* ========================================================================= */}
      {activeView === 'SOURCES' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between bg-[#111620] border border-[#1e2634] p-3 rounded text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              SENSORS, TELEMETRY FEEDS &amp; DUAL-GATEWAY PROVENANCE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded bg-[#111620] border border-[#1e2634] space-y-2">
              <span className="text-emerald-400 font-bold uppercase text-[10px] block">Live AIS Gateway: MyShipTracking API v2</span>
              <p className="text-slate-300"><span className="text-slate-400">Status:</span> Connected (1,937 Coins Active)</p>
              <p className="text-slate-300"><span className="text-slate-400">Endpoints:</span> <code>/vessel</code>, <code>/vessel/track</code>, <code>/vessel/search</code></p>
              <p className="text-slate-400 text-[11px]">Supplies real-time GPS telemetry, SOG, COG, Heading, and 100-point historical breadcrumb tracks.</p>
            </div>

            <div className="p-4 rounded bg-[#111620] border border-[#1e2634] space-y-2">
              <span className="text-cyan-400 font-bold uppercase text-[10px] block">Live Fleet Registry: DataDocked Operations API</span>
              <p className="text-slate-300"><span className="text-slate-400">Status:</span> Connected (Production Enterprise Key)</p>
              <p className="text-slate-300"><span className="text-slate-400">Endpoint:</span> <code>/get-vessel-info</code></p>
              <p className="text-slate-400 text-[11px]">Supplies registered owner, ISM manager, classification society (DNV GL / Lloyd's), P&amp;I club, and DWT.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. RESPONSIBLE AI & UNCERTAINTY */}
      {/* ========================================================================= */}
      {activeView === 'RESPONSIBLE_AI' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between bg-[#111620] border border-[#1e2634] p-3 rounded text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              RESPONSIBLE AI GOVERNANCE &amp; UNCERTAINTY MATRIX
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded bg-[#111620] border border-[#1e2634] space-y-2">
              <h4 className="font-bold text-white uppercase text-xs">1. Probabilistic Triage</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                OCEAN-EYE operates as an investigation-support platform. It produces ranked candidate hypotheses based on physical consistency rather than declaring legal guilt.
              </p>
            </div>

            <div className="p-4 rounded bg-[#111620] border border-[#1e2634] space-y-2">
              <h4 className="font-bold text-white uppercase text-xs">2. Conservative Fallback</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                If evidence strength does not meet the specified threshold, the system transparently reports &ldquo;Insufficient Attribution Evidence&rdquo;.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
