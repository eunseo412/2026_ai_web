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
  destination, destinationName, radius, parkingLots, selectedLotId, onSelectLot
}: MapProps) {
  const centerCoord: [number, number] = [destination.lat, destination.lng];
  const selectedLot = parkingLots.find(l => l.id === selectedLotId) || null;

  // 목적지 마커 (파란 핀)
  const destIcon = typeof window !== 'undefined' ? L.divIcon({
    className: 'leaflet-custom-marker-dest',
    html: '<div class="pin-blue"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  }) : null;

  // 일반 주차장 마커 (빨간 핀)
  const parkIcon = typeof window !== 'undefined' ? L.divIcon({
    className: 'leaflet-custom-marker-park',
    html: '<div class="pin-red"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  }) : null;

  // 활성 주차장 마커 (초록 핀)
  const activeIcon = typeof window !== 'undefined' ? L.divIcon({
    className: 'leaflet-custom-marker-active',
    html: '<div class="pin-active"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  }) : null;



  return (
    <MapContainer center={centerCoord} zoom={15} scrollWheelZoom={true} className={styles.mapContainer}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 목적지 마커 */}
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

      {/* 반경 원 */}
      <Circle
        key={`${destination.lat}-${destination.lng}-${radius}`}
        center={centerCoord}
        radius={radius}
        pathOptions={{
          color: 'var(--primary, #3b82f6)',
          fillColor: 'var(--primary, #3b82f6)',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '5, 5'
        }}
      />

      {/* 주차장 마커 */}
      {parkingLots.map((lot) => {
        const isSelected = lot.id === selectedLotId;
        const iconToUse = isSelected ? activeIcon : parkIcon;

        return iconToUse ? (
          <Marker
            key={lot.id}
            position={[lot.lat, lot.lng]}
            icon={iconToUse}
            eventHandlers={{ click: () => onSelectLot(lot.id) }}
          >
            <Popup>
              <div
                className={styles.mapPopup}
                style={isSelected ? {
                  border: '2px solid var(--color-success)',
                  borderRadius: '10px',
                  padding: '8px',
                  boxShadow: '0 0 12px rgba(16,185,129,0.4)'
                } : {}}
              >
                {isSelected && (
                  <div style={{
                    fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-success)',
                    background: 'var(--bg-success-light)', padding: '2px 8px',
                    borderRadius: '50px', marginBottom: '6px', display: 'inline-block'
                  }}>
                    ✅ 선택됨
                  </div>
                )}
                <span className={styles.popupTitle} style={isSelected ? { color: 'var(--color-success)' } : {}}>
                  {lot.name}
                </span>
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
                    {lot.isOpen ? '이용 가능' : '이용 제한'}
                  </strong>
                </div>
                <button
                  onClick={() => onSelectLot(lot.id)}
                  style={{
                    backgroundColor: isSelected ? 'var(--color-success)' : 'var(--primary)',
                    color: 'white', border: 'none', borderRadius: '4px',
                    padding: '4px 8px', fontSize: '0.72rem', fontWeight: 600,
                    cursor: 'pointer', marginTop: '4px', transition: 'var(--transition-fast)'
                  }}
                >
                  {isSelected ? '선택됨 ✓' : '카드 보기'}
                </button>
              </div>
            </Popup>
          </Marker>
        ) : null;
      })}



      <MapController center={centerCoord} selectedLot={selectedLot} />
    </MapContainer>
  );
}
