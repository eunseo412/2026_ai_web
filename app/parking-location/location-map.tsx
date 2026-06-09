'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SavedParkingLocation } from '../lib/types';

// 지도 패닝 컨트롤러
function MapPanner({ loc }: { loc: SavedParkingLocation | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (loc) {
      map.setView([loc.lat, loc.lng], 17, { animate: true });
    }
  }, [loc, map]);
  return null;
}

interface Props {
  selectedLoc: SavedParkingLocation | null;
  locations: SavedParkingLocation[];
}

export default function LocationMap({ selectedLoc, locations }: Props) {
  const center: [number, number] = selectedLoc
    ? [selectedLoc.lat, selectedLoc.lng]
    : locations.length > 0
      ? [locations[0].lat, locations[0].lng]
      : [37.5665, 126.9780];

  const activeIcon = typeof window !== 'undefined' ? L.divIcon({
    className: '',
    html: '<div class="pin-active"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }) : null;

  const inactiveIcon = typeof window !== 'undefined' ? L.divIcon({
    className: '',
    html: '<div class="pin-red"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  }) : null;

  return (
    <MapContainer center={center} zoom={15} style={{ width: '100%', height: '100%' }} scrollWheelZoom>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map(loc => {
        const isActive = selectedLoc?.id === loc.id;
        const icon = isActive ? activeIcon : inactiveIcon;
        return icon ? (
          <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={icon}>
            <Popup>
              <div style={{ minWidth: '160px' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>
                  📍 {new Date(loc.savedAt).toLocaleString()}
                </strong>
                {loc.memo && <p style={{ fontSize: '0.82rem', color: '#555', margin: '4px 0' }}>{loc.memo}</p>}
                {loc.imageDataUrl && (
                  <img src={loc.imageDataUrl} alt="주차 사진" style={{ width: '100%', borderRadius: '4px', marginTop: '6px' }} />
                )}
              </div>
            </Popup>
          </Marker>
        ) : null;
      })}
      <MapPanner loc={selectedLoc} />
    </MapContainer>
  );
}
