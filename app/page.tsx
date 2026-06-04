'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Clock, RotateCcw, ShieldCheck, Sparkles, Map, Landmark } from 'lucide-react';
import styles from './home.module.css';

export default function Home() {
  const router = useRouter();

  // State for form controls
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('180');
  const [radius, setRadius] = useState('500');

  // Set default values on mount
  useEffect(() => {
    const now = new Date();
    // Format YYYY-MM-DD
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);

    // Format HH:00 for the next hour
    const nextHour = (now.getHours() + 1) % 24;
    setTime(`${String(nextHour).padStart(2, '0')}:00`);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      alert('목적지를 입력해 주세요!');
      return;
    }

    // Build search query params and navigate to results page
    const params = new URLSearchParams({
      q: destination.trim(),
      date,
      time,
      duration,
      radius
    });

    router.push(`/results?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Hero Header */}
      <section className={styles.heroSection}>
        <div className={styles.titleContainer}>
          <div className={`${styles.badge} animate-fade-in`}>
            <Sparkles size={14} />
            <span>AI 기반 목적지 맞춤 주차 탐색기</span>
          </div>
          <h1 className={`${styles.title} animate-fade-in`}>
            목적지만 알려주세요,<br />
            <span className={styles.gradientText}>최적의 주차 공간</span>을 찾을게요
          </h1>
          <p className={`${styles.subtitle} animate-fade-in`} style={{ animationDelay: '0.1s' }}>
            도착 시각과 머무실 시간을 고려하여 가장 저렴하고 최적화된 공영 및 민영 주차장을 비교 분석하고, 인공지능이 맞춤 팁을 설계해 드립니다.
          </p>
        </div>

        {/* Dynamic Search Box Card */}
        <div className={`${styles.searchFormContainer} glass animate-scale-in`} style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>

              {/* Destination Search Box */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>
                  <Map size={16} className="text-primary" />
                  목적지 또는 주소
                </label>
                <div className={styles.inputWrapper}>
                  <Search className={styles.inputIcon} size={20} />
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="예: 서울역, 강남역, 홍대입구역, 부산역, 경복궁 등"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Arrival Date */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <Calendar size={16} />
                  도착 예정일
                </label>
                <div className={styles.inputWrapper}>
                  <Calendar className={styles.inputIcon} size={20} />
                  <input
                    type="date"
                    className={styles.input}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Arrival Time */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <Clock size={16} />
                  도착 예정 시각
                </label>
                <div className={styles.inputWrapper}>
                  <Clock className={styles.inputIcon} size={20} />
                  <input
                    type="time"
                    className={styles.input}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Expected Stay Duration */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <RotateCcw size={16} />
                  예상 주차 시간 (체류 시간)
                </label>
                <div className={styles.inputWrapper}>
                  <Clock className={styles.inputIcon} size={20} />
                  <select
                    className={styles.select}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="30">30분</option>
                    <option value="60">1시간</option>
                    <option value="120">2시간</option>
                    <option value="180">3시간 (기본)</option>
                    <option value="240">4시간</option>
                    <option value="360">6시간</option>
                    <option value="480">8시간</option>
                    <option value="720">12시간</option>
                    <option value="1440">24시간 (1일권)</option>
                  </select>
                </div>
              </div>

              {/* Search Radius */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <ShieldCheck size={16} />
                  검색 반경
                </label>
                <div className={styles.inputWrapper}>
                  <Search className={styles.inputIcon} size={20} />
                  <select
                    className={styles.select}
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                  >
                    <option value="200">200m 이내 (초근접)</option>
                    <option value="500">500m 이내 (권장)</option>
                    <option value="1000">1km 이내</option>
                    <option value="2000">2km 이내</option>
                  </select>
                </div>
              </div>

            </div>

            <button type="submit" className={styles.submitBtn}>
              <Search size={20} />
              <span>주차장 비교 검색하기</span>
            </button>
          </form>
        </div>

        {/* Feature Highlights section */}
        <div className={styles.featuresGrid}>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <Map size={24} />
            </div>
            <h3 className={styles.featureTitle}>정밀 위치 분석</h3>
            <p className={styles.featureDesc}>
              지도 상에 사용자의 목적지를 파란색 핀으로 표시하고 주변 모든 공영/민영 주차장을 빨간색 핀으로 배치하여 직관적으로 위치를 파악합니다.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <Landmark size={24} />
            </div>
            <h3 className={styles.featureTitle}>실시간 주차 요금 계산</h3>
            <p className={styles.featureDesc}>
              전국 표준 요금 정보를 기반으로 입력하신 체류 시간에 해당하는 총 예상 주차비(기본 및 누적 가산 요금 포함)를 투명하게 자동 산출합니다.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <Sparkles size={24} />
            </div>
            <h3 className={styles.featureTitle}>AI 맞춤형 비서 추천</h3>
            <p className={styles.featureDesc}>
              목적지와의 거리, 오늘 운영 상태, 주차 비용을 AI 엔진이 종합적으로 분석하여 최적의 주차 스팟 및 주차 꿀팁을 생성하여 제안합니다.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
