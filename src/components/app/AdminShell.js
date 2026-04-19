import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, Megaphone } from 'lucide-react';
import { getSessionAndProfile, isAdmin } from '@/lib/supabase/session';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

const LINKS = [
  { href: '/admin', label: 'Vue d\'ensemble', icon: LayoutDashboard, key: 'overview' },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users, key: 'users' },
  { href: '/admin/courses', label: 'Cours', icon: BookOpen, key: 'courses' },
  { href: '/admin/notifications', label: 'Annonces', icon: Megaphone, key: 'notifications' },
];

export default async function AdminShell({ children, active = 'overview' }) {
  const { user, profile } = await getSessionAndProfile();
  if (!user) redirect('/login');
  if (!isAdmin(profile)) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <header className="sticky top-0 z-30 border-b border-[#21262d] bg-[#0d1117]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-bold text-lg tracking-tight text-[#FFCC00]">
              DeutschMaroc
            </Link>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFCC00]/10 text-[#FFCC00] border border-[#FFCC00]/40 font-mono uppercase">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#FFCC00] transition hidden md:block">
              ← Espace élève
            </Link>
            <NotificationBell />
            <UserMenu profile={profile} email={user.email} />
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <aside className="md:sticky md:top-20 self-start">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {LINKS.map((l) => {
              const Icon = l.icon;
              const isActive = active === l.key;
              return (
                <Link
                  key={l.key}
                  href={l.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                    isActive
                      ? 'bg-[#161b22] text-[#FFCC00] border border-[#30363d]'
                      : 'text-gray-400 hover:text-[#e6edf3] hover:bg-[#161b22]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
