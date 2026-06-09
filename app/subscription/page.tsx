'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, CheckCircle2, Calendar, Clock, DollarSign } from 'lucide-react';
import { getCommunityParkings, getSubscriptions, saveSubscription, generateId } from '../lib/storage';
import { CommunityParking, ParkingSubscription } from '../lib/types';
import styles from './subscription.module.css';

export default function SubscriptionPage() {
  const [parkings, setParkings] = useState<CommunityParking[]>([]);
  const [filtered, setFiltered] = useState<CommunityParking[]>([]);
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [selected, setSelected] = useState<CommunityParking | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('전일');
  const [payStep, setPayStep] = useState<'idle' | 'confirm' | 'success'>('idle');
  const [subscriptions, setSubscriptions] = useState<ParkingSubscription[]>([]);

  useEffect(() => {
    const list = getCommunityParkings().filter(p => p.monthlyRate > 0);
    setParkings(list);
    setFiltered(list);
    setSubscriptions(getSubscriptions());
    // 기본 날짜
    const today = new Date();
    setStartDate(today.toISOString().split('T')[0]);
    const next = new Date(today);
    next.setMonth(next.getMonth() + 1);
    setEndDate(next.toISOString().split('T')[0]);
  }, []);

  // 필터링
  useEffect(() => {
    let list = [...parkings];
    if (search) list = list.filter(p => p.title.includes(search) || p.address.includes(search));
    if (maxPrice) list = list.filter(p => p.monthlyRate <= Number(maxPrice));
    if (timeFilter) list = list.filter(p => p.availableTime.includes(timeFilter));
    setFiltered(list);
  }, [search, maxPrice, timeFilter, parkings]);

  // 예상 결제금액 계산
  function calcTotal(parking: CommunityParking) {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const months = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    return parking.monthlyRate * months;
  }

  function handlePay() {
    if (!selected) return;
    setPayStep('confirm');
  }

  function handleConfirmPay() {
    if (!selected) return;
    const sub: ParkingSubscription = {
      id: generateId(),
      parkingId: selected.id,
      parkingTitle: selected.title,
      parkingAddress: selected.address,
      monthlyRate: selected.monthlyRate,
      startDate,
      endDate,
      timeSlot,
      totalAmount: calcTotal(selected),
      status: 'paid',
      paidAt: new Date().toISOString(),
    };
    saveSubscription(sub);
    setSubscriptions(getSubscriptions());
    setPayStep('success');
  }

  const totalMonths = (() => {
    if (!selected || !startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    return Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  })();

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <CreditCard size={28} />
          주차장 정기결제
        </h1>
        <p className={styles.pageSubtitle}>
          내 주차장 등록에 올라온 공간을 정기 계약하세요. 할인된 월 요금으로 안심하고 이용하실 수 있습니다.
        </p>
      </div>

      <div className={styles.layout}>
        {/* 검색/필터 패널 */}
        <aside className={styles.filterPanel}>
          <h2 className={styles.sectionTitle}><Filter size={16} /> 검색 · 필터</h2>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>지역/장소명</label>
            <div className={styles.searchRow}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className={styles.input}
                placeholder="지역 또는 장소명 검색..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>최대 월 요금 (원)</label>
            <input
              className={styles.input}
              type="number"
              placeholder="예: 150000"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>이용 가능 시간</label>
            <input
              className={styles.input}
              placeholder="예: 전일, 야간, 주말"
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value)}
            />
          </div>

          {/* 내 구독 현황 */}
          {subscriptions.length > 0 && (
            <div className={styles.mySubSection}>
              <h3 className={styles.mySubTitle}>📋 내 구독 현황</h3>
              {subscriptions.map(s => (
                <div key={s.id} className={styles.mySubCard}>
                  <strong>{s.parkingTitle}</strong>
                  <p>{s.startDate} ~ {s.endDate}</p>
                  <p className={styles.paidBadge}>✅ 결제 완료 ({s.totalAmount.toLocaleString()}원)</p>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* 주차장 목록 */}
        <div className={styles.mainArea}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <CreditCard size={48} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
              <p>정기 계약 가능한 주차 공간이 없습니다.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>내 주차장 등록 페이지에서 월 요금이 있는 공간을 먼저 등록해 주세요.</p>
            </div>
          ) : (
            <div className={styles.parkingList}>
              {filtered.map(p => (
                <div
                  key={p.id}
                  className={`${styles.parkingCard} ${selected?.id === p.id ? styles.parkingCardSelected : ''}`}
                  onClick={() => { setSelected(p); setPayStep('idle'); }}
                >
                  <div className={styles.parkingCardHeader}>
                    <div>
                      <h3 className={styles.parkingCardTitle}>{p.title}</h3>
                      <p className={styles.parkingCardAddress}>📍 {p.address}</p>
                    </div>
                    <div className={styles.monthlyRateBadge}>
                      <span className={styles.monthlyRateNum}>
                        {p.monthlyRate.toLocaleString()}원
                      </span>
                      <span className={styles.monthlyRateLabel}>/월</span>
                    </div>
                  </div>
                  {p.availableTime && (
                    <p className={styles.parkingCardMeta}><Clock size={12} /> {p.availableTime}</p>
                  )}
                  {p.hourlyRate > 0 && (
                    <p className={styles.parkingCardMeta}><DollarSign size={12} /> 시간당 {p.hourlyRate.toLocaleString()}원도 가능</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 결제 패널 */}
        {selected && (
          <aside className={styles.payPanel}>
            <h2 className={styles.sectionTitle}><CreditCard size={16} /> 정기결제 신청</h2>
            <div className={styles.selectedInfo}>
              <strong>{selected.title}</strong>
              <p>{selected.address}</p>
            </div>

            {payStep === 'success' ? (
              <div className={styles.successBox}>
                <CheckCircle2 size={48} color="var(--color-success)" />
                <h3>결제가 완료되었습니다!</h3>
                <p>선택하신 주차 공간을 이용하실 수 있습니다.</p>
                <p className={styles.successAmount}>{calcTotal(selected).toLocaleString()}원 결제 완료</p>
                <button className={styles.primaryBtn} onClick={() => { setSelected(null); setPayStep('idle'); }}>
                  확인
                </button>
              </div>
            ) : payStep === 'confirm' ? (
              <div className={styles.confirmBox}>
                <h3>결제 확인</h3>
                <div className={styles.confirmRow}>
                  <span>이용 기간</span>
                  <strong>{startDate} ~ {endDate} ({totalMonths}개월)</strong>
                </div>
                <div className={styles.confirmRow}>
                  <span>이용 시간대</span>
                  <strong>{timeSlot}</strong>
                </div>
                <div className={styles.confirmRow}>
                  <span>월 요금</span>
                  <strong>{selected.monthlyRate.toLocaleString()}원</strong>
                </div>
                <div className={`${styles.confirmRow} ${styles.totalRow}`}>
                  <span>총 결제 금액</span>
                  <strong className={styles.totalAmount}>{calcTotal(selected).toLocaleString()}원</strong>
                </div>
                <p className={styles.mockNotice}>※ 테스트 환경 - 실제 결제가 이루어지지 않습니다.</p>
                <div className={styles.confirmActions}>
                  <button className={styles.primaryBtn} onClick={handleConfirmPay}>결제하기</button>
                  <button className={styles.ghostBtn} onClick={() => setPayStep('idle')}>취소</button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.payFormGroup}>
                  <label className={styles.filterLabel}><Calendar size={14} /> 이용 시작일</label>
                  <input type="date" className={styles.input} value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className={styles.payFormGroup}>
                  <label className={styles.filterLabel}><Calendar size={14} /> 이용 종료일</label>
                  <input type="date" className={styles.input} value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div className={styles.payFormGroup}>
                  <label className={styles.filterLabel}><Clock size={14} /> 이용 시간대</label>
                  <select className={styles.input} value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
                    <option>전일</option>
                    <option>주간 (08:00~18:00)</option>
                    <option>야간 (18:00~08:00)</option>
                    <option>주말</option>
                  </select>
                </div>
                <div className={styles.totalPreview}>
                  <span>예상 결제 금액</span>
                  <strong className={styles.totalAmount}>{calcTotal(selected).toLocaleString()}원</strong>
                  <span className={styles.totalSub}>({totalMonths}개월 × {selected.monthlyRate.toLocaleString()}원)</span>
                </div>
                <button className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center' }} onClick={handlePay}>
                  결제 신청하기
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
