'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-mustard border-t-8 comic-border p-1 z-30 flex justify-around items-center comic-shadow" style={{ boxShadow: '0px -6px 0px #000000' }}>
      <Link href="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
        <i className="fa-solid fa-house nav-icon"></i>
        <span className="nav-text">Home</span>
      </Link>
      <Link href="/latest" className={`bottom-nav-item ${isActive('/latest') ? 'active' : ''}`}>
        <i className="fa-solid fa-clock nav-icon"></i>
        <span className="nav-text">Terbaru</span>
      </Link>
      <Link href="/search" className={`bottom-nav-item ${isActive('/search') ? 'active' : ''}`}>
        <i className="fa-solid fa-search nav-icon"></i>
        <span className="nav-text">Search</span>
      </Link>
      <Link href="/populer" className={`bottom-nav-item ${isActive('/populer') ? 'active' : ''}`}>
        <i className="fa-solid fa-star nav-icon"></i>
        <span className="nav-text">Populer</span>
      </Link>
      <Link href="/auth" className={`bottom-nav-item ${isActive('/auth') ? 'active' : ''}`}>
        <i className="fa-solid fa-user nav-icon"></i>
        <span className="nav-text">Profil</span>
      </Link>
    </nav>
  );
}
