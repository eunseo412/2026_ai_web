'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trash2, MapPin, Compass, DollarSign, ExternalLink } from 'lucide-react';
import { getFavorites, removeFavorite } from '../lib/storage';
import { FavoriteParking } from '../lib/types';
import styles from './favorites.module.css';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteParking[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  function handleRemove(id: string) {
    removeFavorite(id);
    setFavorites(getFavorites());
  }

  function handleGoToMap(lat: number, lng: number) {
    // 구글 맵으로 이동
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <Star size={28} fill="var(--color-warning)" color="var(--color-warning)" />
          단골 주차장
        </h1>
        <p className={styles.pageSubtitle}>
          즐겨찾기에 저장된 주차장 목록입니다. 검색 결과에서 ★ 버튼을 눌러 추가할 수 있습니다.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className={styles.emptyState}>
          <Star size={56} style={{ color: 'var(--text-light)', marginBottom: '16px' }} />
          <h2>단골 주차장이 없습니다</h2>
          <p>주차장 검색 결과 화면에서 ★ 버튼을 클릭해 즐겨찾기에 추가해 보세요.</p>
          <a href="/" className={styles.primaryBtn} style={{ marginTop: '20px' }}>
            주차장 찾기로 이동
          </a>
        </div>
      ) : (
        <div className={styles.grid}>
          {favorites.map(fav => (
            <div key={fav.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>{fav.name}</h3>
                  <div className={styles.sourceBadge}>
                    {fav.source === 'community' ? '커뮤니티' : fav.source === 'public_api' ? '공영' : '민영'}
                  </div>
                </div>
                <button className={styles.removeBtn} onClick={() => handleRemove(fav.id)} title="즐겨찾기 해제">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <MapPin size={14} className={styles.icon} />
                  <span>{fav.address}</span>
                </div>
                {fav.distance !== undefined && (
                  <div className={styles.infoRow}>
                    <Compass size={14} className={styles.icon} />
                    <span>목적지에서 <strong>{fav.distance}m</strong></span>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <DollarSign size={14} className={styles.icon} />
                  <span className={styles.price}>{fav.feeDisplay}</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.savedAt}>
                  저장일: {new Date(fav.savedAt).toLocaleDateString()}
                </span>
                <button
                  className={styles.mapBtn}
                  onClick={() => handleGoToMap(fav.lat, fav.lng)}
                >
                  <ExternalLink size={13} /> 지도에서 보기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
