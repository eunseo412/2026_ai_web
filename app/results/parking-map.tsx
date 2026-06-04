'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import styles from './results.module.css';

interface MapProps {
  destination: { lat: number; lng: number };
  destinationName: string;
  radius: number;
  parkingLots: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    distance: number;
    feeDisplay: string;
    operatingHoursToday: string;
    isOpen: boolean;
  }>;
  selectedLotId: string | null;
  onSelectLot: (id: string) => void;
}

// Controller component to automatically pan/zoom Leaflet viewport
function MapController({ center, selectedLot }: { center: [number, number]; selectedLot: { lat: number; lng: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedLot) {
      map.setView([selectedLot.lat, selectedLot.lng], 16, { animate: true, duration: 0.75 });
    } else {
      map.setView(center, 15, { animate: true, duration: 0.5 });
    }
  }, [center, selectedLot, map]);

  return null;
}

export default function ParkingMap({
  destination,
  destinationName,
  radius,
  parkingLots,
  selectedLotId,
  onSelectLot
}: MapProps) {
  // Center is destination coordinates
  const centerCoord: [number, number] = [destination.lat, destination.lng];
  const selectedLot = parkingLots.find(l => l.id === selectedLotId) || null;

  // 100% Client-side custom div icons to prevent broken image assets in Next.js builds
  const destIcon = typeof window !== 'undefined' ? L.divIcon({
    className: 'leaflet-custom-marker-dest',
    html: '<div class="pin-blue"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  }) : null;

  const parkIcon = typeof window !== 'undefined' ? L.divIcon({
    className: 'leaflet-custom-marker-park',
    html: '<div class="pin-red"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  }) : null;

  const activeIcon = typeof window !== 'undefined' ? L.divIcon({
    className: 'leaflet-custom-marker-active',
    html: '<div class="pin-active"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  }) : null;

  return (
    <MapContainer
      center={centerCoord}
      zoom={15}
      scrollWheelZoom={true}
      className={styles.mapContainer}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Destination Marker (Blue Pin) */}
      {destIcon && (
        <Marker position={centerCoord} icon={destIcon}>
          <Popup>
            <div className={styles.mapPopup}>
              <span className={styles.popupTitle}>📍 목적지</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{destinationName}</span>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Radius Circle */}
      <Circle
        key={`${destination.lat}-${destination.lng}-${radius}`}
        center={centerCoord}
        radius={radius}
        pathOptions={{
          color: 'var(--primary, #3b82f6)',
          fillColor: 'var(--primary, #3b82f6)',
          fillOpacity: 0.15,
          weight: 2,
          dashArray: '5, 5'
        }}
      />

      {/* Parking Lot Markers (Red or Green Active pins) */}
      {parkingLots.map((lot) => {
        const isSelected = lot.id === selectedLotId;
        const iconToUse = isSelected ? activeIcon : parkIcon;

        return iconToUse ? (
          <Marker
            key={lot.id}
            position={[lot.lat, lot.lng]}
            icon={iconToUse}
            eventHandlers={{
              click: () => onSelectLot(lot.id)
            }}
          >
            <Popup>
              <div className={styles.mapPopup}>
                <span className={styles.popupTitle}>{lot.name}</span>
                <div className={styles.popupRow}>
                  <span>거리:</span>
                  <strong>{lot.distance}m</strong>
                </div>
                <div className={styles.popupRow}>
                  <span>예상 요금:</span>
                  <strong className={styles.popupPrice}>{lot.feeDisplay}</strong>
                </div>
                <div className={styles.popupRow}>
                  <span>상태:</span>
                  <strong style={{ color: lot.isOpen ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {lot.isOpen ? '이용 가능 (영업 중)' : '이용 제한 (영업 종료)'}
                  </strong>
                </div>
                <button
                  onClick={() => onSelectLot(lot.id)}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '4px',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  상세 카드 보기
                </button>
              </div>
            </Popup>
          </Marker>
        ) : null;
      })}

      {/* Map controller to pan view dynamically */}
      <MapController center={centerCoord} selectedLot={selectedLot} />
    </MapContainer>
  );
}
