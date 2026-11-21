'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AirportLocation } from '@/types';
import { MOPA_COORDINATES } from '@/lib/constants';
import {
  Compass,
  Layers,
  MapPin,
  Navigation,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface AirportMapInnerProps {
  locations: AirportLocation[];
  pickupId?: string;
  destinationId?: string;
  onSelectPickup?: (locationId: string) => void;
  onSelectDestination?: (locationId: string) => void;
  height?: string;
  interactive?: boolean;
}

type CategoryFilter = 'all' | 'passenger' | 'admin' | 'cargo' | 'emergency';

export default function AirportMapInner({
  locations,
  pickupId,
  destinationId,
  onSelectPickup,
  onSelectDestination,
  height = '520px',
  interactive = true,
}: AirportMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersByIdRef = useRef<Map<string, L.Marker>>(new Map());

  const [mapType, setMapType] = useState<'satellite' | 'streets'>('satellite');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [selectedPinLoc, setSelectedPinLoc] = useState<AirportLocation | null>(null);

  // Category filter helper
  const filterMatches = (loc: AirportLocation, cat: CategoryFilter): boolean => {
    if (cat === 'all') return true;
    if (cat === 'passenger') {
      return (
        loc.category === 'Passenger Area' ||
        loc.category === 'Terminal' ||
        loc.category === 'Parking / Transport'
      );
    }
    if (cat === 'admin') {
      return loc.category === 'Airport Administration' || loc.category === 'Security';
    }
    if (cat === 'cargo') {
      return loc.category === 'Cargo';
    }
    if (cat === 'emergency') {
      return (
        loc.category === 'Emergency Services' ||
        loc.category === 'Technical / Maintenance' ||
        loc.category === 'Staff Facilities'
      );
    }
    return true;
  };

  const filteredLocations = locations.filter((l) => filterMatches(l, activeCategory));

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [MOPA_COORDINATES.lat, MOPA_COORDINATES.lng],
      zoom: MOPA_COORDINATES.defaultZoom,
      minZoom: 13,
      maxZoom: 19,
      zoomControl: true,
      attributionControl: true,
    });

    // Default to Esri World Imagery (High-Resolution Satellite, No API Key Required)
    const satelliteTileUrl =
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    const satelliteLayer = L.tileLayer(satelliteTileUrl, {
      attribution: 'Tiles &copy; Esri World Imagery (No API Key Required)',
      maxZoom: 19,
    }).addTo(map);

    currentTileLayerRef.current = satelliteLayer;

    // MOPA Airport Campus Boundary overlay (Accurately calibrated to official aerodrome perimeter)
    const campusBoundary = [
      [15.7485, 73.8415], // Northwest perimeter near RWY 28 approach
      [15.7495, 73.862], // North perimeter near Satellite Fire Station & Solar Farm
      [15.7475, 73.8785], // Northeast perimeter near RWY 10 approach
      [15.7375, 73.881], // East cargo approach boundary
      [15.731, 73.8775], // East perimeter near Cargo Gate / Link Road
      [15.7245, 73.872], // Southeast perimeter Gate 2
      [15.7225, 73.857], // South perimeter Gate House 1 (Main Link Road entry)
      [15.7265, 73.8535], // Southwest perimeter CISF / Police sector
      [15.737, 73.848], // West perimeter near Main Fire Station
    ];

    L.polygon(campusBoundary as L.LatLngExpression[], {
      color: '#38bdf8',
      weight: 2,
      dashArray: '6, 6',
      fillColor: '#0284c7',
      fillOpacity: 0.08,
    })
      .bindTooltip('MOPA Airport Outer Campus Perimeter', { sticky: true })
      .addTo(map);

    // Runway 10/28 schematic reference (Airside Non-Vehicular Movement Area)
    const runwayLine = [
      [15.7457, 73.8445], // Runway 28 Threshold (West)
      [15.7431, 73.8771], // Runway 10 Threshold (East)
    ];

    L.polyline(runwayLine as L.LatLngExpression[], {
      color: '#ef4444',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8',
    })
      .bindTooltip('Runway 10/28 (Airside - Strictly Restricted to Ground Taxis)', { sticky: true })
      .addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle switching between Satellite and Street View
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      currentTileLayerRef.current.remove();
    }

    if (mapType === 'satellite') {
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri World Imagery (No API Key Required)',
          maxZoom: 19,
        }
      ).addTo(map);
      satLayer.bringToBack();
      currentTileLayerRef.current = satLayer;
    } else {
      const osmLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors (No API Key Required)',
          maxZoom: 19,
        }
      ).addTo(map);
      osmLayer.bringToBack();
      currentTileLayerRef.current = osmLayer;
    }
  }, [mapType]);

  // Update Markers and Route when locations, pickupId, or destinationId change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    markersByIdRef.current.clear();

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    const pickupLoc = locations.find((l) => l.id === pickupId);
    const destLoc = locations.find((l) => l.id === destinationId);

    // Add Markers for all active locations
    locations.forEach((loc) => {
      const matchesFilter = filterMatches(loc, activeCategory);
      const isPickup = loc.id === pickupId;
      const isDestination = loc.id === destinationId;

      let pinColor = '#0f172a'; // standard dark slate
      let pinBorder = '#ffffff';
      let size = 30;
      let opacity = matchesFilter ? 1 : 0.35;

      if (isPickup) {
        pinColor = '#0284c7'; // airport blue
        pinBorder = '#ffffff';
        size = 38;
        opacity = 1;
      } else if (isDestination) {
        pinColor = '#059669'; // emerald green
        pinBorder = '#ffffff';
        size = 38;
        opacity = 1;
      } else if (loc.is_restricted) {
        pinColor = '#d97706'; // amber for restricted
      }

      const customHtml = `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${pinColor};
          border: 2px solid ${pinBorder};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.45);
          color: white;
          font-weight: 800;
          font-size: 11px;
          cursor: pointer;
          opacity: ${opacity};
          transition: transform 0.2s ease;
        ">
          ${isPickup ? 'PICK' : isDestination ? 'DROP' : '•'}
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'mopa-custom-pin',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; min-width: 200px;">
          <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 2px;">${loc.name}</div>
          <div style="display: inline-block; padding: 2px 6px; background-color: #f1f5f9; border-radius: 4px; font-size: 10px; font-weight: 600; color: #475569; margin-bottom: 6px;">
            ${loc.category}
          </div>
          <div style="color: #64748b; margin-bottom: 8px; line-height: 1.35;">${loc.description}</div>
          ${loc.is_restricted ? '<div style="color: #b45309; font-weight: 700; font-size: 11px; margin-bottom: 8px;">⚠️ Authorized Airport Pass Only</div>' : ''}
          <div style="display: flex; gap: 4px;">
            ${
              onSelectPickup
                ? `<button id="btn-pickup-${loc.id}" style="flex: 1; padding: 5px 8px; background: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold;">Set Pickup</button>`
                : ''
            }
            ${
              onSelectDestination
                ? `<button id="btn-dest-${loc.id}" style="flex: 1; padding: 5px 8px; background: #059669; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold;">Set Dest</button>`
                : ''
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        setSelectedPinLoc(loc);
      });

      marker.on('popupopen', () => {
        const btnP = document.getElementById(`btn-pickup-${loc.id}`);
        if (btnP && onSelectPickup) {
          btnP.onclick = () => {
            onSelectPickup(loc.id);
            map.closePopup();
          };
        }
        const btnD = document.getElementById(`btn-dest-${loc.id}`);
        if (btnD && onSelectDestination) {
          btnD.onclick = () => {
            onSelectDestination(loc.id);
            map.closePopup();
          };
        }
      });

      markersLayer.addLayer(marker);
      markersByIdRef.current.set(loc.id, marker);
    });

    // Draw authorized schematic ground transit route if pickup and dest exist
    if (pickupLoc && destLoc && pickupLoc.id !== destLoc.id) {
      // Connect through central campus boulevard transit corridor avoiding runway
      const campusLoopWaypoint: [number, number] = [15.7312, 73.8655];
      const routePoints: [number, number][] = [
        [pickupLoc.lat, pickupLoc.lng],
        campusLoopWaypoint,
        [destLoc.lat, destLoc.lng],
      ];

      const polyline = L.polyline(routePoints, {
        color: '#38bdf8',
        weight: 6,
        opacity: 0.95,
        dashArray: '8, 8',
      }).addTo(map);

      polyline.bindTooltip(
        'Authorized Ground Transit Schematic Corridor (Airside Bypass)',
        { sticky: true }
      );

      routeLayerRef.current = polyline;

      // Fit map view to route bounds
      const bounds = L.latLngBounds([
        [pickupLoc.lat, pickupLoc.lng],
        [destLoc.lat, destLoc.lng],
      ]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [locations, pickupId, destinationId, onSelectPickup, onSelectDestination, activeCategory]);

  const handleFlyTo = (loc: AirportLocation) => {
    setSelectedPinLoc(loc);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([loc.lat, loc.lng], 17, { duration: 1.2 });
      const marker = markersByIdRef.current.get(loc.id);
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([MOPA_COORDINATES.lat, MOPA_COORDINATES.lng], MOPA_COORDINATES.defaultZoom, {
        duration: 1.2,
      });
      setSelectedPinLoc(null);
    }
  };

  const pickupLoc = locations.find((l) => l.id === pickupId);
  const destLoc = locations.find((l) => l.id === destinationId);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md">
      {/* Top Controls Toolbar: Category Filters & Satellite Switcher */}
      <div className="border-b border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Facility Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-400 mr-1 hidden sm:inline">Facility Layer:</span>
            {[
              { id: 'all', label: `All Facilities (${locations.length})` },
              { id: 'passenger', label: 'Passenger Terminals' },
              { id: 'admin', label: 'Administration & ATC' },
              { id: 'cargo', label: 'Cargo & Logistics' },
              { id: 'emergency', label: 'ARFF & Emergency' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as CategoryFilter)}
                className={`rounded-lg px-2.5 py-1 transition ${
                  activeCategory === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Tools: Satellite Switcher & Reset Button */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              type="button"
              onClick={handleResetView}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
              title="Reset view to whole campus"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset View</span>
            </button>

            <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                  mapType === 'satellite'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🛰️ Satellite</span>
              </button>
              <button
                type="button"
                onClick={() => setMapType('streets')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                  mapType === 'streets'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🗺️ Streets</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Route HUD Overlay (if pickup and destination selected) */}
      {pickupLoc && destLoc && pickupLoc.id !== destLoc.id && (
        <div className="bg-sky-950/85 border-b border-sky-800/60 px-4 py-2 backdrop-blur-md text-white text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-sky-200">Active Ground Route:</span>
            <span className="font-bold text-white">{pickupLoc.name}</span>
            <span className="text-sky-400">➔</span>
            <span className="font-bold text-white">{destLoc.name}</span>
          </div>
          <div className="text-[11px] text-sky-300 flex items-center gap-3">
            <span>• Airside Runway Bypass Active</span>
            <span className="hidden sm:inline">• Internal Campus Roadway</span>
            <span className="font-bold text-amber-300">~3-5 Min Shuttle Transit</span>
          </div>
        </div>
      )}

      {/* Leaflet Map Canvas (Large Horizontal Container) */}
      <div className="relative w-full" style={{ height }}>
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Legend Overlay at Bottom Left */}
        <div className="absolute bottom-3 left-3 z-[400] hidden sm:flex flex-wrap items-center gap-3 rounded-xl bg-slate-950/90 px-3.5 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md border border-slate-700/80">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#0284c7] ring-1 ring-white" />
            <span>Pickup Bay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#059669] ring-1 ring-white" />
            <span>Dropoff</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#d97706] ring-1 ring-white" />
            <span>Security / Staff Pass</span>
          </div>
          <div className="text-[11px] text-slate-400">| Runway 10/28 Restricted</div>
        </div>
      </div>

      {/* Horizontal Campus Location Explorer Strip */}
      <div className="border-t border-slate-800 bg-slate-950 p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5 text-amber-400" />
            <span>Interactive Campus Location Explorer (Click to focus map)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Showing {filteredLocations.length} locations
          </span>
        </div>

        {/* Horizontal Scrollable Row of Location Cards */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {filteredLocations.map((loc) => {
            const isPickup = loc.id === pickupId;
            const isDest = loc.id === destinationId;

            return (
              <div
                key={loc.id}
                className={`flex-shrink-0 w-60 rounded-xl border p-2.5 transition cursor-pointer ${
                  isPickup
                    ? 'border-sky-500 bg-sky-950/50'
                    : isDest
                    ? 'border-emerald-500 bg-emerald-950/50'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
                onClick={() => handleFlyTo(loc)}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="font-bold text-xs text-white truncate">{loc.name}</div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      loc.is_restricted
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {loc.category}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{loc.description}</p>

                <div className="mt-2 flex items-center gap-1.5">
                  {onSelectPickup && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPickup(loc.id);
                      }}
                      className={`flex-1 rounded py-1 text-[10px] font-bold transition ${
                        isPickup
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-sky-900/60 hover:text-white'
                      }`}
                    >
                      {isPickup ? '✓ Pickup' : '+ Pickup'}
                    </button>
                  )}
                  {onSelectDestination && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDestination(loc.id);
                      }}
                      className={`flex-1 rounded py-1 text-[10px] font-bold transition ${
                        isDest
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-emerald-900/60 hover:text-white'
                      }`}
                    >
                      {isDest ? '✓ Dest' : '+ Dest'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
