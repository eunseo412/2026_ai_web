'use client';

import React from 'react';
import { Users, Mail, Phone, MapPin } from 'lucide-react';
import styles from './contact.module.css';

export default function ContactPage() {
  const teamMembers = [
    {
      name: '이채민',
      role: 'Frontend Engineer',
      desc: '홈 검색 인터페이스, 결과 페이지 UI, Leaflet 지도 시각화 및 필터·정렬 기능을 구현했습니다. React 19와 Next.js 기반의 사용자 경험 설계 및 프론트엔드 개발을 담당했습니다.',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    {
      name: '서은서',
      role: 'Backend Engineer',
      desc: '주차장 데이터 처리 로직을 개발하고 거리 계산, 요금 계산, 조건별 필터링 기능을 구현했습니다. Next.js API Routes를 활용한 백엔드 서비스 설계를 담당했습니다.',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    {
      name: '박민준',
      role: 'API / AI Integration Engineer',
      desc: 'Google Gemini LLM 기반 주차장 추천 시스템을 구축하고, 환경변수 관리 및 API 연동을 담당했습니다. 추천 실패 시 안정적인 서비스 제공을 위한 Fallback 로직을 설계했습니다.',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    {
      name: '김건',
      role: 'DevOps & QA Engineer',
      desc: 'Vercel 기반 배포 환경을 구축하고 CI/CD 파이프라인을 관리했습니다. 환경변수 설정, 서비스 로깅, 성능 모니터링 및 품질 검증 프로세스를 담당했습니다.',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    }
  ];

  return (
    <div className={styles.container}>

      {/* Header Block */}
      <section className={`${styles.header} animate-fade-in`}>
        <div style={{
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          padding: '6px 16px',
          borderRadius: '50px',
          fontSize: '0.85rem',
          fontWeight: 700,
          display: 'inline-flex',
          marginBottom: '16px',
          gap: '6px',
          alignItems: 'center'
        }}>
          <Users size={14} />
          <span>ParkingMate 팀소개</span>
        </div>
        <h1 className={styles.title}>
          우리는 <span className={styles.gradientText}>ParkingMate</span> 팀입니다
        </h1>
        <p className={styles.subtitle}>
          더 쾌적하고 막힘없는 이동 경험을 제공하기 위해 열정을 바치며, 각자의 전문 역량을 유기적으로 엮어 이번 서비스를 완성해 냈습니다.
        </p>
      </section>

      {/* Team Grid */}
      <section className={styles.teamGrid}>
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className={`${styles.memberCard} animate-scale-in`}
            style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
          >
            <div className={styles.avatarWrapper}>
              <Users size={32} />
            </div>

            <h3 className={styles.name}>{member.name}</h3>
            <span className={styles.role}>{member.role}</span>
            <p className={styles.desc}>{member.desc}</p>

            <div className={styles.links}>
              <a href={member.github} target="_blank" rel="noreferrer" className={styles.linkIcon} aria-label="GitHub">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
              <a href={member.linkedin} target="_blank" rel="noreferrer" className={styles.linkIcon} aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>
        ))}
      </section>

      {/* Project Inquiry Card */}
      <section className={`${styles.contactInfoCard} animate-scale-in`} style={{ animationDelay: '0.5s' }}>
        <div>
          <h2 className={styles.infoTitle}>프로젝트 제휴 및 기술 문의</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            ParkingMate 서비스에 관한 피드백이나 비즈니스 연동 문의는 아래의 연락처로 남겨주시면 정성껏 답변해 드리겠습니다.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div className={styles.infoRow}>
            <div className={styles.infoIconWrapper}>
              <Mail size={20} />
            </div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>이메일 주소</span>
              <span className={styles.infoValue}>purunmul@kentech.ac.kr</span>
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoIconWrapper}>
              <Phone size={20} />
            </div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>대표 유선번호</span>
              <span className={styles.infoValue}>010-4646-0069 (평일 09:00 ~ 18:00)</span>
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoIconWrapper}>
              <MapPin size={20} />
            </div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>오피스 위치</span>
              <span className={styles.infoValue}>전라남도 나주시 켄텍길 21</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
