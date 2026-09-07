import { create } from 'zustand';
import {
  FALLBACK_VESSELS,
  FALLBACK_SATELLITE_SCENE,
  FALLBACK_OCEAN_ENVIRONMENT
} from '../data/fallbackDataset';

export interface AISContinuity {
  has_anomaly: boolean;
  anomaly_type?: string | null;
  gap_duration_minutes?: number;
  gap_start?: string;
  gap_end?: string;
  speed_delta_knots?: number;
  comment?: string;
}

export interface TrackPoint {
  time: string;
  lat: number;
  lon: number;
  sog: number;
  cog: number;
  hdg?: number;
}

export interface VesselObject {
  mmsi: string;
  imo: string;
  name: string;
  call_sign: string;
  vessel_type: string;
  flag_state: string;
  length_m: number;
  beam_m: number;
  draught_m: number;
  nav_status: string;
  destination: string;
  eta: string;
  lat: number;
  lon: number;
  sog: number;
  cog: number;
  hdg: number;
  last_update_utc: string;
  is_candidate: boolean;
  candidate_rank?: number;
  evidence_strength?: number;
  investigation_priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_EVIDENCE';
  ais_continuity?: AISContinuity;
  registry_details?: {
    registered_owner?: string;
    ism_manager?: string;
    classification_society?: string;
    pi_club?: string;
    year_built?: string;
    deadweight_tonnage?: string;
    last_port?: string;
  };
  data_source: string;
  data_status: string;
  track?: TrackPoint[];
}

export interface SatelliteScene {
  satellite: string;
  instrument: string;
  acquisition_time: string;
  product_id: string;
  acquisition_mode: string;
  polarization: string;
  resolution: string;
  orbit_pass: string;
  data_source: string;
  data_age_hours: number;
  footprint_coordinates: number[][];
  detected_slick: {
    status: string;
    detection_confidence: number;
    area_km2: number;
    centroid: { lat: number; lon: number };
    major_axis_km: number;
    minor_axis_km: number;
    orientation_deg: number;
    contrast_ratio_db: number;
    look_alike_risk: string;
    polygon: number[][];
  };
}

export interface OceanEnvironment {
  source: string;
  timestamp: string;
  current_velocity_mps: number;
  current_direction_deg: number;
  current_direction_label: string;
  wind_velocity_mps: number;
  wind_direction_deg: number;
  wind_direction_label: string;
  sea_surface_temp_c: number;
  wave_significant_height_m: number;
  current_vectors: Array<{ lat: number; lon: number; speed_mps: number; direction_deg: number }>;
  hindcast: {
    backward_duration_hours: number;
    reconstructed_release_window: string;
    origin_confidence: number;
    probable_origin_ellipse: {
      center: { lat: number; lon: number };
      semi_major_km: number;
      semi_minor_km: number;
      azimuth_deg: number;
      polygon: number[][];
    };
  };
}

export interface LayerVisibility {
  vessels: boolean;
  vesselTracks: boolean;
  satelliteFootprint: boolean;
  slickPolygon: boolean;
  backwardParticles: boolean;
  probableOrigin: boolean;
  oceanCurrents: boolean;
  windVectors: boolean;
  shippingLanes: boolean;
  eezBoundary: boolean;
  bathymetry: boolean;
  counterfactualPlume: boolean;
}

export type BasemapType = 'dark' | 'satellite' | 'ocean' | 'voyager';

export type SelectedEntity =
  | { type: 'NONE' }
  | { type: 'VESSEL'; mmsi: string }
  | { type: 'SPILL' }
  | { type: 'ORIGIN' }
  | { type: 'SATELLITE' }
  | { type: 'COUNTERFACTUAL'; vessel_id: string };

interface MaritimeState {
  // Live / Demo Mode
  mode: 'LIVE' | 'DEMO';
  setMode: (mode: 'LIVE' | 'DEMO') => void;

  // Connection Telemetry
  systemStatus: {
    ais: 'CONNECTED' | 'DISCONNECTED';
    sar: 'AVAILABLE' | 'UNAVAILABLE';
    env: 'AVAILABLE' | 'UNAVAILABLE';
    ws: 'CONNECTED' | 'DISCONNECTED';
    datadocked: 'CONNECTED' | 'DISCONNECTED';
  };
  setSystemStatus: (status: Partial<MaritimeState['systemStatus']>) => void;

  // Data Stores (Defaults to rich fallback)
  vessels: VesselObject[];
  setVessels: (vessels: VesselObject[]) => void;
  satelliteScene: SatelliteScene | null;
  setSatelliteScene: (scene: SatelliteScene | null) => void;
  environment: OceanEnvironment | null;
  setEnvironment: (env: OceanEnvironment | null) => void;

  // Selected Entity
  selectedEntity: SelectedEntity;
  setSelectedEntity: (entity: SelectedEntity) => void;

  // Map & GIS state
  cursorPos: { lat: number; lon: number };
  setCursorPos: (pos: { lat: number; lon: number }) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  layers: LayerVisibility;
  toggleLayer: (layerKey: keyof LayerVisibility) => void;
  vesselTypeFilter: string;
  setVesselTypeFilter: (filter: string) => void;
  basemap: BasemapType;
  setBasemap: (basemap: BasemapType) => void;

  // Side Docks Open/Close
  isLayerDockOpen: boolean;
  setIsLayerDockOpen: (open: boolean) => void;
  toggleLayerDock: () => void;
  isInspectorDockOpen: boolean;
  setIsInspectorDockOpen: (open: boolean) => void;
  toggleInspectorDock: () => void;

  // Timeline & Playback
  timelineUtc: string;
  setTimelineUtc: (time: string) => void;
  isPlayingTrack: boolean;
  setIsPlayingTrack: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;

  // Evidence threshold & workflow
  evidenceThreshold: number;
  setEvidenceThreshold: (threshold: number) => void;
  workflowStep: number;
  setWorkflowStep: (step: number) => void;

  // Multi-Provider Preference
  providerPreference: 'auto' | 'datadocked' | 'myshiptracking';
  setProviderPreference: (pref: 'auto' | 'datadocked' | 'myshiptracking') => void;

  // View Routing & Map Display Toggle
  activeView: 'PLATFORM_PORTAL' | 'MAP' | 'TARGET_TABLE' | 'DETECTION' | 'DRIFT' | 'ATTRIBUTION' | 'COUNTERFACTUAL' | 'DOSSIER' | 'SOURCES' | 'RESPONSIBLE_AI';
  setActiveView: (view: 'PLATFORM_PORTAL' | 'MAP' | 'TARGET_TABLE' | 'DETECTION' | 'DRIFT' | 'ATTRIBUTION' | 'COUNTERFACTUAL' | 'DOSSIER' | 'SOURCES' | 'RESPONSIBLE_AI') => void;
  isMapOpen: boolean;
  toggleMap: () => void;
  layoutMode: 'MAP' | 'SPLIT' | 'ANALYTICS';
  setLayoutMode: (mode: 'MAP' | 'SPLIT' | 'ANALYTICS') => void;
  ecdisPalette: 'NIGHT' | 'DUSK' | 'DAY';
  setEcdisPalette: (palette: 'NIGHT' | 'DUSK' | 'DAY') => void;

  // Live Lookup Search Loading state
  isLiveSearching: boolean;
  liveSearchError: string | null;
  lookupLiveVessel: (query: string, provider?: 'auto' | 'datadocked' | 'myshiptracking') => Promise<boolean>;

  // Real-time live event telemetry logs
  liveEventLogs: Array<{
    id: string;
    time: string;
    source: 'AIS' | 'SAR' | 'METOCEAN' | 'ATTRIBUTION' | 'SYSTEM';
    message: string;
    level: 'info' | 'warn' | 'alert' | 'success';
  }>;
  advanceSimulationStep: () => void;

  // Modals & Panels
  activeModal: 'NONE' | 'REPORT' | 'SOURCES' | 'RESPONSIBLE_AI' | 'WORKFLOW_WIZARD';
  setActiveModal: (modal: 'NONE' | 'REPORT' | 'SOURCES' | 'RESPONSIBLE_AI' | 'WORKFLOW_WIZARD') => void;
}

export const useMaritimeStore = create<MaritimeState>((set, get) => ({
  mode: 'DEMO',
  setMode: (mode) => set({ mode }),

  activeView: 'MAP',
  setActiveView: (activeView) => set({ activeView, isMapOpen: activeView === 'MAP' }),
  isMapOpen: true,
  toggleMap: () =>
    set((state) => {
      const nextMapState = !state.isMapOpen;
      return {
        isMapOpen: nextMapState,
        activeView: nextMapState ? 'MAP' : 'TARGET_TABLE',
      };
    }),

  layoutMode: 'MAP',
  setLayoutMode: (layoutMode) => set({ layoutMode }),
  ecdisPalette: 'NIGHT',
  setEcdisPalette: (ecdisPalette) => set({ ecdisPalette }),

  systemStatus: {
    ais: 'CONNECTED',
    sar: 'AVAILABLE',
    env: 'AVAILABLE',
    ws: 'CONNECTED',
    datadocked: 'CONNECTED',
  },
  setSystemStatus: (status) =>
    set((state) => ({ systemStatus: { ...state.systemStatus, ...status } })),

  // Initialized with verified fallback data so map is never empty or broken
  vessels: FALLBACK_VESSELS,
  setVessels: (vessels) => set({ vessels: vessels && vessels.length > 0 ? vessels : FALLBACK_VESSELS }),

  satelliteScene: FALLBACK_SATELLITE_SCENE,
  setSatelliteScene: (satelliteScene) => set({ satelliteScene: satelliteScene || FALLBACK_SATELLITE_SCENE }),

  environment: FALLBACK_OCEAN_ENVIRONMENT,
  setEnvironment: (environment) => set({ environment: environment || FALLBACK_OCEAN_ENVIRONMENT }),

  selectedEntity: { type: 'NONE' },
  setSelectedEntity: (selectedEntity) => {
    // If selecting an entity, make sure the inspector dock is open to see details
    set({
      selectedEntity,
      isInspectorDockOpen: selectedEntity.type !== 'NONE' ? true : get().isInspectorDockOpen
    });
  },

  cursorPos: { lat: 19.425, lon: 71.848 },
  setCursorPos: (cursorPos) => set({ cursorPos }),
  zoomLevel: 10,
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),

  basemap: 'dark',
  setBasemap: (basemap) => set({ basemap }),

  isLayerDockOpen: true,
  setIsLayerDockOpen: (isLayerDockOpen) => set({ isLayerDockOpen }),
  toggleLayerDock: () => set((state) => ({ isLayerDockOpen: !state.isLayerDockOpen })),

  isInspectorDockOpen: true,
  setIsInspectorDockOpen: (isInspectorDockOpen) => set({ isInspectorDockOpen }),
  toggleInspectorDock: () => set((state) => ({ isInspectorDockOpen: !state.isInspectorDockOpen })),

  layers: {
    vessels: true,
    vesselTracks: true,
    satelliteFootprint: true,
    slickPolygon: true,
    backwardParticles: true,
    probableOrigin: true,
    oceanCurrents: true,
    windVectors: true,
    shippingLanes: true,
    eezBoundary: true,
    bathymetry: true,
    counterfactualPlume: true,
  },
  toggleLayer: (layerKey) =>
    set((state) => ({
      layers: { ...state.layers, [layerKey]: !state.layers[layerKey] },
    })),

  vesselTypeFilter: 'ALL',
  setVesselTypeFilter: (vesselTypeFilter) => set({ vesselTypeFilter }),

  timelineUtc: '2026-09-06 10:42:00 UTC',
  setTimelineUtc: (timelineUtc) => set({ timelineUtc }),

  isPlayingTrack: false,
  setIsPlayingTrack: (isPlayingTrack) => set({ isPlayingTrack }),
  playbackSpeed: 1,
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),

  evidenceThreshold: 50.0,
  setEvidenceThreshold: (evidenceThreshold) => set({ evidenceThreshold }),
  workflowStep: 7,
  setWorkflowStep: (workflowStep) => set({ workflowStep }),

  providerPreference: 'auto',
  setProviderPreference: (providerPreference) => set({ providerPreference }),

  isLiveSearching: false,
  liveSearchError: null,

  lookupLiveVessel: async (query: string, provider?: 'auto' | 'datadocked' | 'myshiptracking') => {
    if (!query || !query.trim()) return false;
    const activeProvider = provider || get().providerPreference;
    set({ isLiveSearching: true, liveSearchError: null });
    const apiHost = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    const apiBase = apiHost ? `${apiHost}/api` : '/api';
    try {
      const resp = await fetch(
        `${apiBase}/vessels/live-lookup?query=${encodeURIComponent(query.trim())}&provider=${activeProvider}`
      );
      if (!resp.ok) {
        set({
          isLiveSearching: false,
          liveSearchError: `Vessel '${query}' not found on live AIS networks (DataDocked / MyShipTracking).`,
        });
        return false;
      }
      const liveVessel: VesselObject = await resp.json();

      // Upsert into vessels list
      const existing = get().vessels;
      const updated = [liveVessel, ...existing.filter((v) => v.mmsi !== liveVessel.mmsi)];

      set({
        vessels: updated,
        selectedEntity: { type: 'VESSEL', mmsi: liveVessel.mmsi },
        cursorPos: { lat: liveVessel.lat, lon: liveVessel.lon },
        isInspectorDockOpen: true,
        isLiveSearching: false,
        liveSearchError: null,
      });
      return true;
    } catch (e: any) {
      set({ isLiveSearching: false, liveSearchError: 'Failed to query live AIS API gateways.' });
      return false;
    }
  },

  liveEventLogs: [
    {
      id: 'log-1',
      time: '12:50:00 UTC',
      source: 'SAR',
      message: 'Copernicus Sentinel-1A SAR: Swath acquisition S1A_IW_GRDH ingested (250 km coverage).',
      level: 'info'
    },
    {
      id: 'log-2',
      time: '12:50:02 UTC',
      source: 'AIS',
      message: 'AIS Gateway: 1,420 msgs/sec decoded across Sector 7 (Mumbai MRCC).',
      level: 'info'
    },
    {
      id: 'log-3',
      time: '12:50:05 UTC',
      source: 'ATTRIBUTION',
      message: 'Candidate #1 MT OCEAN VANGUARD: High-confidence spatial-temporal intercept confirmed (91.4%).',
      level: 'alert'
    }
  ],

  advanceSimulationStep: () => {
    const state = get();
    const currentVessels = state.vessels;
    if (!currentVessels || currentVessels.length === 0) return;

    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`;

    // Advance each vessel along course and speed
    const dtHours = (1.5 * 10) / 3600; // Simulated time step (~15 seconds scaled)
    const updatedVessels = currentVessels.map((v) => {
      const rad = ((v.cog || 0) * Math.PI) / 180;
      const speed = Math.max(v.sog || 10, 2);
      const dLat = (speed * Math.cos(rad) * dtHours) / 60;
      const dLon = (speed * Math.sin(rad) * dtHours) / (60 * Math.cos((v.lat * Math.PI) / 180));

      const newLat = parseFloat((v.lat + dLat).toFixed(5));
      const newLon = parseFloat((v.lon + dLon).toFixed(5));

      // Append new position to track points
      const updatedTrack = [...(v.track || [])];
      if (updatedTrack.length > 30) updatedTrack.shift(); // Keep last 30 waypoints
      updatedTrack.push({
        time: timeStr,
        lat: newLat,
        lon: newLon,
        sog: v.sog,
        cog: v.cog,
        hdg: v.hdg
      });

      return {
        ...v,
        lat: newLat,
        lon: newLon,
        last_update_utc: timeStr,
        track: updatedTrack
      };
    });

    // Pick a random vessel to emit a live telemetry log
    const primeVessel = updatedVessels.find((v) => v.is_candidate) || updatedVessels[0];
    const newLogId = `log-${Date.now()}`;
    const newLog = {
      id: newLogId,
      time: timeStr,
      source: 'AIS' as const,
      message: `AIS NMEA: ${primeVessel.name} (${primeVessel.mmsi}) POS ${primeVessel.lat.toFixed(4)}°N, ${primeVessel.lon.toFixed(4)}°E SOG ${primeVessel.sog} kts COG ${primeVessel.cog}°`,
      level: (primeVessel.is_candidate ? 'warn' : 'info') as 'warn' | 'info'
    };

    const newLogs = [newLog, ...state.liveEventLogs.slice(0, 25)];

    // Micro-fluctuate wind and current
    const env = state.environment;
    const updatedEnv = env ? {
      ...env,
      wind_velocity_mps: parseFloat((env.wind_velocity_mps + (Math.random() * 0.2 - 0.1)).toFixed(2)),
      current_velocity_mps: parseFloat((env.current_velocity_mps + (Math.random() * 0.02 - 0.01)).toFixed(2))
    } : env;

    set({
      vessels: updatedVessels,
      environment: updatedEnv,
      liveEventLogs: newLogs
    });
  },

  activeModal: 'NONE',
  setActiveModal: (activeModal) => set({ activeModal }),
}));

