'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Navigation, Camera, FileText, MapPin, Trash2, Clock } from 'lucide-react';
import { getSavedLocations, saveLocation, deleteLocation, generateId } from '../lib/storage';
import { SavedParkingLocation } from '../lib/types';
import styles from './parking-location.module.css';

// Leaflet 지도 동적 로드
const MapView = dynamic(() => import('./location-map'), { ssr: false, loading: () => <div className={styles.mapPlaceholder}>지도 로딩 중...</div> });

export default function ParkingLocationPage() {
  const [locations, setLocations] = useState<SavedParkingLocation[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<SavedParkingLocation | null>(null);
  const [gettingGPS, setGettingGPS] = useState(false);
  const [memo, setMemo] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [gpsResult, setGpsResult] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocations(getSavedLocations());
  }, []);

  // 현재 위치 가져오기
  function handleGetLocation() {
    if (!navigator.geolocation) {
      setGpsError('이 브라우저는 위치 정보를 지원하지 않습니다.');
      return;
    }
    setGettingGPS(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsResult({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGettingGPS(false);
      },
      err => {
        setGpsError(`위치 정보를 가져올 수 없습니다: ${err.message}`);
        setGettingGPS(false);
      },
      { timeout: 10000 }
    );
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImageDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!gpsResult) {
      alert('먼저 현재 위치를 가져와 주세요.');
      return;
    }
    const loc: SavedParkingLocation = {
      id: generateId(),
      memo,
      imageDataUrl,
      savedAt: new Date().toISOString(),
      lat: gpsResult.lat,
      lng: gpsResult.lng,
    };
    saveLocation(loc);
    setLocations(getSavedLocations());
    setMemo('');
    setImageDataUrl(undefined);
    setGpsResult(null);
    alert('주차 위치가 저장되었습니다!');
  }

  function handleDelete(id: string) {
    if (!confirm('이 주차 위치를 삭제하시겠습니까?')) return;
    deleteLocation(id);
    setLocations(getSavedLocations());
    if (selectedLoc?.id === id) setSelectedLoc(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}><Navigation size={28} /> 주차 위치 찾기</h1>
        <p className={styles.pageSubtitle}>주차한 위치를 저장하고, 나중에 지도에서 쉽게 찾아가세요.</p>
      </div>

      <div className={styles.layout}>
        {/* 저장 폼 */}
        <aside className={styles.savePanel}>
          <h2 className={styles.panelTitle}>📍 현재 위치 저장</h2>

          <button
            className={`${styles.gpsBtn} ${gettingGPS ? styles.gpsBtnLoading : ''}`}
            onClick={handleGetLocation}
            disabled={gettingGPS}
          >
            <MapPin size={16} />
            {gettingGPS ? 'GPS 신호 수신 중...' : '현재 위치 가져오기'}
          </button>

          {gpsError && <p className={styles.errorMsg}>{gpsError}</p>}

          {gpsResult && (
            <div className={styles.gpsResult}>
              <MapPin size={14} color="var(--color-success)" />
              <span>위치 확인됨: {gpsResult.lat.toFixed(5)}, {gpsResult.lng.toFixed(5)}</span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}><Camera size={14} /> 사진</label>
            <div className={styles.uploadArea} onClick={() => fileRef.current?.click()}>
              {imageDataUrl
                ? <img src={imageDataUrl} alt="주차 사진" className={styles.uploadPreview} />
                : <span>클릭하여 사진 추가</span>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}><FileText size={14} /> 메모</label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="예: B2 구역 32번 칸, 엘리베이터 근처"
              value={memo}
              onChange={e => setMemo(e.target.value)}
            />
          </div>

          <button className={styles.primaryBtn} onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
            저장하기
          </button>
        </aside>

        {/* 지도 + 목록 */}
        <div className={styles.mainArea}>
          {/* 지도 */}
          <div className={styles.mapWrapper}>
            <MapView selectedLoc={selectedLoc} locations={locations} />
          </div>

          {/* 저장 목록 */}
          <div className={styles.locationList}>
            <h3 className={styles.listTitle}>저장된 위치 ({locations.length}개)</h3>
            {locations.length === 0 ? (
              <p className={styles.emptyMsg}>저장된 주차 위치가 없습니다.</p>
            ) : (
              locations.map(loc => (
                <div
                  key={loc.id}
                  className={`${styles.locCard} ${selectedLoc?.id === loc.id ? styles.locCardActive : ''}`}
                  onClick={() => setSelectedLoc(loc)}
                >
                  {loc.imageDataUrl && (
                    <img src={loc.imageDataUrl} alt="주차 사진" className={styles.locThumb} />
                  )}
                  <div className={styles.locBody}>
                    <div className={styles.locMeta}>
                      <Clock size={13} />
                      {new Date(loc.savedAt).toLocaleString()}
                    </div>
                    <p className={styles.locCoords}>
                      <MapPin size={12} /> {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                    </p>
                    {loc.memo && <p className={styles.locMemo}>{loc.memo}</p>}
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={e => { e.stopPropagation(); handleDelete(loc.id); }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
