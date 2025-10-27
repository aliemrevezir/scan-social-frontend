import Link from 'next/link';
import { Logo } from '@/components/atoms/Logo';
import { Input } from '@/components/atoms/Input';

export function AppHeader() {
  return (
    <header className="header">
      <div className="container-app navbar">
        <div className="flex items-center gap-4">
          <Logo />
          <nav className="nav-links">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/campaigns">Campaigns</Link>
            <Link href="/search">Search</Link>
            <Link href="/influencers">Influencers</Link>
            <Link href="/transcripts">Transcripts</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Input type="search" placeholder="Search…" className="w-56" aria-label="Global search" />
          <Link href="/profile" className="text-sm font-semibold">Profile</Link>
        </div>
      </div>
    </header>
  );
}