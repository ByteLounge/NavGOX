'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AirportLocation } from '@/types';
import { MOPA_COORDINATES } from '@/lib/constants';

interface AirportMapInnerProps {
  locations: AirportLocation[];
  pickupId?: string;
  destinationId?: string;
  onSelectPickup?: (locationId: string) => void;
  onSelectDestination?: (locationId: string) => void;
  height?: string;
  interactive?: boolean;
}

export default function AirportMapInner({
  locations,
  pickupId,
  destinationId,
  onSelectPickup,
  onSelectDestination,
  height = '420px',
  interactive = true,
}: AirportMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  const [mapType, setMapType] = useState<'satellite' | 'streets'>('satellite');

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
      attribution:
        'Tiles &copy; Esri World Imagery (No API Key Required)',
      maxZoom: 19,
    }).addTo(map);

    currentTileLayerRef.current = satelliteLayer;

    // MOPA Airport Campus Boundary overlay (Accurately calibrated to official aerodrome perimeter)
    const campusBoundary = [
      [15.7485, 73.8415], // Northwest perimeter near RWY 28 approach
      [15.7495, 73.8620], // North perimeter near Satellite Fire Station & Solar Farm
      [15.7475, 73.8785], // Northeast perimeter near RWY 10 approach
      [15.7375, 73.8810], // East cargo approach boundary
      [15.7310, 73.8775], // East perimeter near Cargo Gate / Link Road
      [15.7245, 73.8720], // Southeast perimeter Gate 2
      [15.7225, 73.8570], // South perimeter Gate House 1 (Main Link Road entry)
      [15.7265, 73.8535], // Southwest perimeter CISF / Police sector
      [15.7370, 73.8480], // West perimeter near Main Fire Station
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
      opacity: 0.8,
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

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    const pickupLoc = locations.find((l) => l.id === pickupId);
    const destLoc = locations.find((l) => l.id === destinationId);

    // Add Markers for all active locations
    locations.forEach((loc) => {
      const isPickup = loc.id === pickupId;
      const isDestination = loc.id === destinationId;

      let pinColor = '#0f172a'; // standard dark slate
      let pinBorder = '#ffffff';
      let size = 28;

      if (isPickup) {
        pinColor = '#0284c7'; // airport blue
        pinBorder = '#ffffff';
        size = 36;
      } else if (isDestination) {
        pinColor = '#059669'; // emerald green
        pinBorder = '#ffffff';
        size = 36;
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
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
          color: white;
          font-weight: bold;
          font-size: 11px;
          cursor: pointer;
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
        <div style="font-family: sans-serif; font-size: 12px; min-width: 180px;">
          <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 2px;">${loc.name}</div>
          <div style="display: inline-block; padding: 2px 6px; background-color: #f1f5f9; border-radius: 4px; font-size: 10px; font-weight: 600; color: #475569; margin-bottom: 6px;">
            ${loc.category}
          </div>
          <div style="color: #64748b; margin-bottom: 8px;">${loc.description}</div>
          ${loc.is_restricted ? '<div style="color: #b45309; font-weight: 600; font-size: 11px; margin-bottom: 6px;">⚠️ Authorized Airport Pass Only</div>' : ''}
          <div style="display: flex; gap: 4px;">
            ${
              onSelectPickup
                ? `<button id="btn-pickup-${loc.id}" style="flex: 1; padding: 4px 8px; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">Set Pickup</button>`
                : ''
            }
            ${
              onSelectDestination
                ? `<button id="btn-dest-${loc.id}" style="flex: 1; padding: 4px 8px; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">Set Dest</button>`
                : ''
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

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
        weight: 5,
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
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [locations, pickupId, destinationId, onSelectPickup, onSelectDestination]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm"
      style={{ height }}
    >
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Top Right: Satellite vs Streets View Switcher */}
      <div className="absolute top-2 right-2 z-[400] flex rounded-lg bg-slate-950/90 p-1 shadow-lg backdrop-blur-md border border-slate-700">
        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition ${
            mapType === 'satellite'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white'
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
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <span>🗺️ Streets</span>
        </button>
      </div>

      {/* Bottom Left Legend */}
      <div className="absolute bottom-2 left-2 z-[400] flex flex-wrap items-center gap-2 rounded-lg bg-slate-950/90 px-3 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur-md border border-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#0284c7] ring-1 ring-white" />
          <span>Pickup</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#059669] ring-1 ring-white" />
          <span>Destination</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#d97706] ring-1 ring-white" />
          <span>Restricted / Staff Area</span>
        </div>
        <div className="text-[11px] text-slate-400">| GOX Campus Ground Roads</div>
      </div>
    </div>
  );
}
