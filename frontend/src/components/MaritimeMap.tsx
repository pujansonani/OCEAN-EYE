import React, { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Marker,
  Popup,
  CircleMarker,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  Maximize2,
  Minimize2,
  Navigation,
  Eye,
  EyeOff,
  Ship,
  Sparkles,
  Info
} from 'lucide-react';
import {
  SpillDetection,
  DriftHindcastResult,
  AISVessel,
  MapLayerControls,
  CounterfactualResult
} from '../types';

// Fix default leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom vessel marker generator
const createVesselIcon = (name: string, isSelected: boolean, color: string) => {
  return L.divIcon({
    className: 'custom-vessel-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${isSelected ? '28px' : '22px'};
        height: ${isSelected ? '28px' : '22px'};
        background-color: #060e1d;
        border: 2px solid ${color};
        border-radius: 50%;
        box-shadow: 0 0 ${isSelected ? '16px' : '8px'} ${color};
        transform: translate(-50%, -50%);
        transition: all 0.2s;
      ">
        <div style="width: 8px; height: 8px; background-color: ${color}; border-radius: 50%;"></div>
        ${isSelected ? `<div style="position: absolute; width: 36px; height: 36px; border: 1px dashed ${color}; border-radius: 50%; animation: spin 6s linear infinite;"></div>` : ''}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Auto-center helper component
const MapController: React.FC<{
  center: [number, number];
  zoom: number;
  selectedVesselTrack?: AISVessel | null;
}> = ({ center, zoom, selectedVesselTrack }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedVesselTrack && selectedVesselTrack.track.length > 0) {
      const bounds = L.latLngBounds(selectedVesselTrack.track.map(p => [p.lat, p.lng]));
      map.flyToBounds(bounds, { padding: [60, 60], duration: 1.2 });
    }
  }, [selectedVesselTrack, map]);

  return null;
};

interface MaritimeMapProps {
  detection: SpillDetection;
  drift: DriftHindcastResult;
  vessels: AISVessel[];
  selectedVesselId: string;
  onSelectVessel: (vesselId: string) => void;
  counterfactualResult?: CounterfactualResult | null;
  heightClass?: string;
  allowLayerControls?: boolean;
}

export const MaritimeMap: React.FC<MaritimeMapProps> = ({
  detection,
  drift,
  vessels,
  selectedVesselId,
  onSelectVessel,
  counterfactualResult,
  heightClass = 'h-[520px]',
  allowLayerControls = true
}) => {
  const [layers, setLayers] = useState<MapLayerControls>({
    showSARBounds: true,
    showSpillPolygon: true,
    showSpillCentroid: true,
    showOriginRegion: true,
    showBackwardDrift: true,
    showVesselTracks: true,
    showCandidateMarkers: true,
    showCounterfactual: true,
  });

  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [particleAnimationPhase, setParticleAnimationPhase] = useState(0);

  // Animated particle pulse timer
  useEffect(() => {
    const interval = setInterval(() => {
      setParticleAnimationPhase(prev => (prev + 1) % 10);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const toggleLayer = (key: keyof MapLayerControls) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const candidateVessels = vessels.filter(v => v.is_candidate);
  const selectedVessel = vessels.find(v => v.vessel_id === selectedVesselId);

  // SAR Image Bounding Box (Lat/Lng)
  const sarBounds: [number, number][] = [
    [19.650, 71.300],
    [19.650, 72.100],
    [19.150, 72.100],
    [19.150, 71.300],
    [19.650, 71.300]
  ];

  // Helper colors for vessels
  const getVesselColor = (vesselId: string) => {
    if (vesselId === 'VESSEL-001') return '#00e5ff'; // Cyan for Vessel A (Top Candidate)
    if (vesselId === 'VESSEL-002') return '#a78bfa'; // Purple for Vessel B
    if (vesselId === 'VESSEL-003') return '#34d399'; // Green for Vessel C
    return '#64748b'; // Gray for non-candidates
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-[#173260] shadow-2xl bg-[#060e1d]`}>
      <MapContainer
        center={[19.360, 71.650]}
        zoom={10}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <MapController
          center={[19.360, 71.650]}
          zoom={10}
          selectedVesselTrack={null}
        />

        {/* Tactical Dark Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &bull; Sentinel-1 SAR &amp; AIS Telemetry'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* 1. SAR Frame Bounding Box */}
        {layers.showSARBounds && (
          <Polyline
            positions={sarBounds}
            pathOptions={{
              color: '#38bdf8',
              weight: 1.5,
              dashArray: '8, 8',
              opacity: 0.5
            }}
          />
        )}

        {/* 2. Suspected Spill Polygon */}
        {layers.showSpillPolygon && detection.polygon.length > 0 && (
          <Polygon
            positions={detection.polygon as [number, number][]}
            pathOptions={{
              color: '#ff4d4f',
              fillColor: '#ff4d4f',
              fillOpacity: 0.45,
              weight: 2.5
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <div className="font-bold text-red-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                  SUSPECTED OIL SLICK
                </div>
                <div className="mt-1 text-slate-200 space-y-0.5 font-mono text-[11px]">
                  <p>Area: <span className="text-white font-bold">{detection.area_km2} km²</span></p>
                  <p>Length: <span className="text-white font-bold">{detection.length_km} km</span></p>
                  <p>Orientation: <span className="text-white font-bold">{detection.orientation_deg}°</span></p>
                  <p>Detection Conf: <span className="text-cyan-300 font-bold">{detection.confidence}</span></p>
                  <p className="text-[10px] text-slate-400 mt-1">Sensor: {detection.sensor_name}</p>
                </div>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* 3. Spill Centroid Marker */}
        {layers.showSpillCentroid && (
          <CircleMarker
            center={[detection.centroid.lat, detection.centroid.lng]}
            radius={5}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#ff4d4f',
              fillOpacity: 1,
              weight: 2
            }}
          >
            <Popup>
              <div className="text-xs font-mono">
                <span className="text-red-400 font-bold">Observed Spill Centroid</span>
                <p className="text-slate-300 mt-1">Lat: {detection.centroid.lat}, Lng: {detection.centroid.lng}</p>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {/* 4. Probable Origin Region Ellipse */}
        {layers.showOriginRegion && drift.probable_origin.boundary_polygon.length > 0 && (
          <Polygon
            positions={drift.probable_origin.boundary_polygon as [number, number][]}
            pathOptions={{
              color: '#ffb703',
              fillColor: '#ffb703',
              fillOpacity: 0.25,
              weight: 2,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <div className="font-bold text-amber-400 font-mono">
                  PROBABLE ORIGIN REGION
                </div>
                <div className="mt-1 text-slate-200 space-y-0.5 font-mono text-[11px]">
                  <p>Estimated Release: <span className="text-amber-300 font-bold">{drift.release_window_label}</span></p>
                  <p>Origin Confidence: <span className="text-amber-300 font-bold">{drift.origin_confidence}</span></p>
                  <p>Semi-Major Axis: <span className="text-white">{drift.probable_origin.semi_major_km} km</span></p>
                  <p className="text-[10px] text-slate-400 mt-1">Reconstructed via 4.7h backward Lagrangian drift</p>
                </div>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* 5. Backward Particle Trajectories (Lagrangian Streamlines) */}
        {layers.showBackwardDrift && drift.particle_trajectories.map((traj, idx) => {
          const latlngs = traj.points.map(p => [p.lat, p.lng] as [number, number]);
          return (
            <React.Fragment key={`traj-${traj.particle_id}`}>
              <Polyline
                positions={latlngs}
                pathOptions={{
                  color: '#00e5ff',
                  weight: 1.8,
                  opacity: 0.45,
                  dashArray: '6, 6'
                }}
              />
              {/* Particle animation bead */}
              {traj.points.length > 0 && (
                <CircleMarker
                  center={[
                    traj.points[particleAnimationPhase % traj.points.length].lat,
                    traj.points[particleAnimationPhase % traj.points.length].lng
                  ]}
                  radius={2.5}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: '#00e5ff',
                    fillOpacity: 0.9,
                    weight: 1
                  }}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* 6. Historical AIS Tracks */}
        {layers.showVesselTracks && vessels.map((v) => {
          const isSelected = v.vessel_id === selectedVesselId;
          const isCandidate = v.is_candidate;
          const color = getVesselColor(v.vessel_id);
          const pts = v.track.map(p => [p.lat, p.lng] as [number, number]);

          if (pts.length < 2) return null;

          return (
            <Polyline
              key={`track-${v.vessel_id}`}
              positions={pts}
              pathOptions={{
                color: color,
                weight: isSelected ? 4 : isCandidate ? 2.5 : 1.2,
                opacity: isSelected ? 1.0 : isCandidate ? 0.75 : 0.25,
                dashArray: isCandidate ? undefined : '4, 6'
              }}
              eventHandlers={{
                click: () => onSelectVessel(v.vessel_id)
              }}
            />
          );
        })}

        {/* 7. Candidate Vessel Markers */}
        {layers.showCandidateMarkers && candidateVessels.map((v) => {
          const isSelected = v.vessel_id === selectedVesselId;
          const lastPoint = v.track[v.track.length - 1];
          const color = getVesselColor(v.vessel_id);

          return (
            <Marker
              key={`marker-${v.vessel_id}`}
              position={[lastPoint.lat, lastPoint.lng]}
              icon={createVesselIcon(v.name, isSelected, color)}
              eventHandlers={{
                click: () => onSelectVessel(v.vessel_id)
              }}
            >
              <Popup>
                <div className="text-xs p-1 font-mono">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1 mb-1">
                    <span className="font-bold text-white">{v.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {v.vessel_type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-0.5">
                    <p>MMSI: <span className="text-white font-semibold">{v.mmsi}</span></p>
                    <p>IMO: <span className="text-white">{v.imo}</span></p>
                    <p>Flag: <span className="text-white">{v.flag_state}</span></p>
                    {v.ais_anomaly_flag && (
                      <p className="text-amber-400 font-bold mt-1 flex items-center gap-1">
                        ⚠️ AIS Anomaly Detected
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onSelectVessel(v.vessel_id)}
                    className="mt-2 w-full py-1 text-center bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500 rounded text-cyan-300 font-bold"
                  >
                    View Evidence Breakdown
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 8. Counterfactual Simulated Slick Overlay */}
        {layers.showCounterfactual && counterfactualResult && counterfactualResult.simulated_slick_polygon.length > 0 && (
          <Polygon
            positions={counterfactualResult.simulated_slick_polygon as [number, number][]}
            pathOptions={{
              color: '#38bdf8',
              fillColor: '#38bdf8',
              fillOpacity: 0.35,
              weight: 2,
              dashArray: '4, 4'
            }}
          >
            <Popup>
              <div className="text-xs p-1 font-mono">
                <div className="font-bold text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  COUNTERFACTUAL HYPOTHESIS PLUME
                </div>
                <p className="text-slate-300 mt-1 text-[11px]">
                  Simulated release for <span className="text-white font-bold">{counterfactualResult.vessel_name}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Overlap IoU: {(counterfactualResult.consistency_metrics.iou_overlap * 100).toFixed(0)}%
                </p>
              </div>
            </Popup>
          </Polygon>
        )}
      </MapContainer>

      {/* Top Left: Active Incident Overlay */}
      <div className="absolute top-3 left-3 z-20 bg-[#060e1d]/90 backdrop-blur-md border border-[#173260] rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-ocean-accent" />
          <span className="font-bold text-white">ARABIAN SEA SURVEILLANCE SECTOR</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
          <span>Lat: 19.1°N–19.7°N</span>
          <span>&bull;</span>
          <span>Lng: 71.0°E–72.2°E</span>
        </div>
      </div>

      {/* Top Right: Layer Control Toggle Button */}
      {allowLayerControls && (
        <div className="absolute top-3 right-3 z-20">
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#060e1d]/95 backdrop-blur-md border border-[#173260] hover:border-ocean-accent/60 rounded-lg text-xs font-mono font-bold text-slate-200 shadow-xl transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-ocean-accent" />
              Layers ({Object.values(layers).filter(Boolean).length}/8)
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#081326]/95 backdrop-blur-xl border border-[#173260] rounded-xl p-3 shadow-2xl text-xs font-mono space-y-2 z-30">
                <div className="flex items-center justify-between border-b border-[#173260] pb-2 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <span>Geospatial Layers</span>
                  <span className="text-ocean-accent">Toggle</span>
                </div>

                <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Suspected Spill Polygon
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.showSpillPolygon}
                    onChange={() => toggleLayer('showSpillPolygon')}
                    className="accent-ocean-accent"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Probable Origin Region
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.showOriginRegion}
                    onChange={() => toggleLayer('showOriginRegion')}
                    className="accent-ocean-accent"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Backward Drift Particles
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.showBackwardDrift}
                    onChange={() => toggleLayer('showBackwardDrift')}
                    className="accent-ocean-accent"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Historical AIS Tracks
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.showVesselTracks}
                    onChange={() => toggleLayer('showVesselTracks')}
                    className="accent-ocean-accent"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 ring-1 ring-white"></span> Candidate Vessels
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.showCandidateMarkers}
                    onChange={() => toggleLayer('showCandidateMarkers')}
                    className="accent-ocean-accent"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-dashed border-white"></span> Counterfactual Plume
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.showCounterfactual}
                    onChange={() => toggleLayer('showCounterfactual')}
                    className="accent-ocean-accent"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Left: Tactical Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-[#060e1d]/90 backdrop-blur-md border border-[#173260] rounded-lg px-3 py-2 text-[10px] font-mono shadow-xl hidden md:block">
        <div className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mb-1">
          Tactical Map Legend
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500/80 border border-red-400"></span>
            <span>SUSPECTED SPILL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400/40 border border-dashed border-amber-400"></span>
            <span>PROBABLE ORIGIN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400"></span>
            <span>BACKWARD DRIFT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-400"></span>
            <span>VESSEL TRACK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-300 border border-white"></span>
            <span>CANDIDATE VESSEL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-400/40 border border-dashed border-sky-300"></span>
            <span>COUNTERFACTUAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
