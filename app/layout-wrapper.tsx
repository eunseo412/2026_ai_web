'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sun, Moon, ParkingSquare,
  MapPin, Star, Zap, MessageSquare, CreditCard, Navigation, Info, Users, Menu, X
} from 'lucide-react';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { href: '/',                  label: '주차장 찾기',    icon: MapPin },
  { href: '/register',          label: '내 주차장 등록', icon: ParkingSquare },
  { href: '/subscription',      label: '정기결제',       icon: CreditCard },
  { href: '/community',         label: '커뮤니티',       icon: MessageSquare },
  { href: '/favorites',         label: '단골 주차장',    icon: Star },
  { href: '/parking-location',  label: '주차 위치 찾기', icon: Navigation },
  { href: '/about',             label: '소개',           icon: Info },
  { href: '/contact',           label: '팀원 소개',      icon: Users },
];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
    setTheme(currentTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className={`${styles.header} glass`}>
        <Link href="/">
          <div className={styles.logo}>
            <ParkingSquare size={28} strokeWidth={2.5} />
            <span>ParkingMate<span className={styles.logoDot}>.</span></span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${pathname === href ? styles.navLinkActive : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="테마 전환"
            title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Mobile Hamburger */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="메뉴 열기"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Nav */}
      {menuOpen && (
        <div className={styles.mobileNav} onClick={() => setMenuOpen(false)}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.mobileNavLink} ${pathname === href ? styles.mobileNavLinkActive : ''}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      )}

      <main className={styles.mainContent}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div>
            <div className={styles.logo} style={{ fontSize: '1.15rem', marginBottom: '8px', cursor: 'default' }}>
              <ParkingSquare size={20} />
              <span>ParkingMate</span>
            </div>
            <p className={styles.footerText}>
              국토교통부 전국주차장정보표준데이터 공공데이터 포털 오픈 API 연동 서비스
            </p>
          </div>

          <div className={styles.footerLinks}>
            <Link href="/" className={styles.footerLink}>주차장 찾기</Link>
            <Link href="/register" className={styles.footerLink}>내 주차장 등록</Link>
            <Link href="/community" className={styles.footerLink}>커뮤니티</Link>
            <Link href="/about" className={styles.footerLink}>서비스 소개</Link>
            <Link href="/contact" className={styles.footerLink}>팀원 연락처</Link>
          </div>
        </div>
        <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-light)' }}>
          © {new Date().getFullYear()} ParkingMate Team. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
