'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Sparkles, MapPin, Clock, Compass, CreditCard, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import styles from './results.module.css';

// Dynamic import of Leaflet Map with SSR disabled (extremely critical to prevent Next.js build errors)
const ParkingMap = dynamic(() => import('./parking-map'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-muted)',
      fontWeight: 600
    }}>
      지도 로딩 중...
    </div>
  )
});

interface ParkingLot {
  id: string;
  name: string;
  type: 'public' | 'private';
  parkingType: string;
  address: string;
  totalSpaces: number;
  operatingDays: string;
  weekdayStart: string;
  weekdayEnd: string;
  satStart: string;
  satEnd: string;
  holidayStart: string;
  holidayEnd: string;
  feeType: '무료' | '유료' | '혼합';
  basicTime: number;
  basicFee: number;
  addUnitTime: number;
  addUnitFee: number;
  dayFee: number | null;
  paymentMethod: string;
  disabledSpaces: boolean;
  phone: string;
  lat: number;
  lng: number;
  distance: number;
  isOpen: boolean;
  operatingHoursToday: string;
  estimatedFee: number;
  feeDisplay: string;
  source: 'public_api' | 'local_real_database';
}

interface ResultsClientProps {
  destinationName: string;
  destinationCoord: { lat: number; lng: number };
  searchParams: {
    date: string;
    time: string;
    duration: number;
    radius: number;
  };
  apiInfo: {
    apiUsed: boolean;
    apiError: string | null;
    source: string;
  };
  initialLots: ParkingLot[];
}

export default function ResultsClient({
  destinationName,
  destinationCoord,
  searchParams,
  apiInfo,
  initialLots
}: ResultsClientProps) {
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);

  // Sorting State
  const [sortBy, setSortBy] = useState<'distance' | 'price'>('distance');

  // AI Recommendation State
  const [aiRecommendation, setAiRecommendation] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  // 1. Sort logic
  const processedLots = initialLots
    .slice()
    .sort((a, b) => {
      if (sortBy === 'distance') {
        return a.distance - b.distance;
      } else {
        // Handle "요금 정보 없음" sorting values
        const feeA = a.estimatedFee === 0 && a.feeType !== '무료' ? 999999 : a.estimatedFee;
        const feeB = b.estimatedFee === 0 && b.feeType !== '무료' ? 999999 : b.estimatedFee;
        return feeA - feeB;
      }
    });

  // Set first lot selected by default if search results update
  useEffect(() => {
    if (processedLots.length > 0 && !selectedLotId) {
      setSelectedLotId(processedLots[0].id);
    }
  }, [processedLots, selectedLotId]);

  // 2. Fetch AI Recommendation on mount/data change
  useEffect(() => {
    async function fetchAiRecommendation() {
      if (initialLots.length === 0) return;
      setAiLoading(true);
      try {
        const response = await fetch('/api/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            destinationName,
            parkingLots: processedLots,
            searchParams
          })
        });

        if (response.ok) {
          const data = await response.json();
          setAiRecommendation(data.recommendation);
        } else {
          setAiRecommendation('AI 추천 정보를 불러오지 못했습니다.');
        }
      } catch (err) {
        console.error('Failed to get AI recommendation:', err);
        setAiRecommendation('네트워크 요인으로 AI 분석을 완료하지 못했습니다.');
      } finally {
        setAiLoading(false);
      }
    }

    fetchAiRecommendation();
  }, [destinationName, initialLots]);

  // Helper to render markdown-like structures simply
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('###')) {
        return <h3 key={idx} className="font-bold text-lg mt-3 mb-2">{line.replace('###', '').trim()}</h3>;
      }
      if (line.startsWith('####')) {
        return <h4 key={idx} className="font-bold text-md mt-2 mb-1">{line.replace('####', '').trim()}</h4>;
      }
      if (line.startsWith('-') || line.startsWith('*')) {
        // Basic bold replacements
        const content = line.replace(/^[-*]\s*/, '');
        return <li key={idx} style={{ marginBottom: '4px' }}>{parseBold(content)}</li>;
      }
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '8px' }} />;
      }
      return <p key={idx} style={{ marginBottom: '6px' }}>{parseBold(line)}</p>;
    });
  };

  const parseBold = (str: string) => {
    const parts = str.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-primary">{part}</strong> : part);
  };

  return (
    <div className={styles.container}>

      {/* Left Sidebar Pane */}
      <aside className={styles.sidebar}>

        {/* Header Block */}
        <div className={styles.searchHeader}>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>다시 검색하기</span>
          </Link>

          <h2 className={styles.destinationName}>
            {destinationName}
          </h2>

          <div className={styles.searchParamsSummary}>
            <span className={styles.paramBadge}>반경 {searchParams.radius}m</span>
            <span className={styles.paramBadge}>
              체류 {searchParams.duration >= 60 ? `${Math.floor(searchParams.duration / 60)}시간` : `${searchParams.duration}분`}
            </span>
            <span className={styles.paramBadge}>{searchParams.date} {searchParams.time} 도착</span>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={12} />
            <span>데이터 출처: {apiInfo.source}</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className={styles.filterSection}>
          <div className={styles.sortingRow}>
            <div className={styles.sortButtons}>
              <button
                className={`${styles.sortBtn} ${sortBy === 'distance' ? styles.sortBtnActive : ''}`}
                onClick={() => setSortBy('distance')}
              >
                가까운 순
              </button>
              <button
                className={`${styles.sortBtn} ${sortBy === 'price' ? styles.sortBtnActive : ''}`}
                onClick={() => setSortBy('price')}
              >
                저렴한 순
              </button>
            </div>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        {aiRecommendation && (
          <div className={styles.aiRecommendationCard}>
            <div className={styles.aiHeader}>
              <Sparkles size={16} className="text-primary" />
              <span>AI 분석 추천 가이드</span>
            </div>
            
            {aiLoading ? (
              <div className={styles.aiLoading}>
                <div className={styles.shimmer} style={{ width: '90%' }}></div>
                <div className={styles.shimmer} style={{ width: '75%' }}></div>
                <div className={styles.shimmer} style={{ width: '80%' }}></div>
              </div>
            ) : (
              <div className={styles.aiContent}>
                {renderMarkdown(aiRecommendation)}
              </div>
            )}
          </div>
        )}

        {/* Parking Lot Card Listings */}
        <div className={styles.listContainer}>
          <span className={styles.sectionLabel} style={{ marginBottom: '-8px' }}>
            검색 결과 ({processedLots.length}개)
          </span>

          {processedLots.length === 0 ? (
            <div className={styles.emptyState}>
              <AlertCircle size={40} className="text-light" style={{ marginBottom: '12px' }} />
              <p className={styles.emptyStateTitle}>조건에 맞는 주차장이 없습니다</p>
              <p style={{ fontSize: '0.8rem' }}>필터 조건을 해제하거나 검색 반경을 더 넓게 변경해 보세요.</p>
            </div>
          ) : (
            processedLots.map(lot => {
              const isSelected = lot.id === selectedLotId;
              return (
                <div
                  key={lot.id}
                  className={`${styles.parkingCard} ${isSelected ? styles.parkingCardActive : ''}`}
                  onClick={() => setSelectedLotId(lot.id)}
                >
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.cardTitle}>{lot.name}</h3>
                      <div className={styles.cardBadges}>
                        <span className={lot.type === 'public' ? styles.badgePublic : styles.badgePrivate}>
                          {lot.type === 'public' ? '공영' : '민영'}
                        </span>
                        <span className={styles.badgePublic} style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)' }}>
                          {lot.parkingType}
                        </span>
                        <span className={lot.isOpen ? styles.badgeOpen : styles.badgeClosed}>
                          {lot.isOpen ? '영업 중' : '체류 중 종료'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardPriceSection}>
                      <span className={styles.cardPrice}>{lot.feeDisplay}</span>
                      <p className={styles.cardPriceLabel}>예상 요금</p>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardInfoRow}>
                      <Compass size={14} className={styles.cardInfoIcon} />
                      <span>목적지에서 <strong>{lot.distance}m</strong></span>
                    </div>
                    <div className={styles.cardInfoRow}>
                      <MapPin size={14} className={styles.cardInfoIcon} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {lot.address}
                      </span>
                    </div>
                    <div className={styles.cardInfoRow}>
                      <Clock size={14} className={styles.cardInfoIcon} />
                      <span>오늘 운영: {lot.operatingHoursToday}</span>
                    </div>
                    <div className={styles.cardInfoRow}>
                      <CreditCard size={14} className={styles.cardInfoIcon} />
                      <span>결제 방법: 신용카드 및 현금</span>
                    </div>

                    {isSelected && (
                      <div className="animate-fade-in" style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                        <div className={styles.cardInfoRow} style={{ marginBottom: '4px' }}>
                          <CheckCircle2 size={14} className={styles.cardInfoIcon} style={{ color: lot.disabledSpaces ? 'var(--color-success)' : 'var(--text-light)' }} />
                          <span>장애인 주차구역: {lot.disabledSpaces ? '보유 (할인 가능)' : '미보유/정보 없음'}</span>
                        </div>
                        <div className={styles.cardInfoRow}>
                          <Info size={14} className={styles.cardInfoIcon} />
                          <span>요금 체계: 기본 {lot.basicTime}분 {lot.basicFee.toLocaleString()}원 / 추가 {lot.addUnitTime}분당 {lot.addUnitFee.toLocaleString()}원</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <span>총 {lot.totalSpaces || '정보 없음'}면 구획</span>
                    <span>주차장 {lot.source === 'public_api' ? '실시간 연동' : '로컬 원본데이터'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </aside>

      {/* Right Map View pane */}
      <section className={styles.mapContainer}>
        <ParkingMap
          destination={destinationCoord}
          destinationName={destinationName}
          radius={searchParams.radius}
          parkingLots={processedLots}
          selectedLotId={selectedLotId}
          onSelectLot={(id) => setSelectedLotId(id)}
        />
      </section>

    </div>
  );
}
