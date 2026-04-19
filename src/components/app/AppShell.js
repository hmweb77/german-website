import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionAndProfile, isActiveUser } from '@/lib/supabase/session';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

export default async function AppShell({ children, activeSection = 'dashboard' }) {
  const { user, profile } = await getSessionAndProfile();
  if (!user) redirect('/login');
  if (!isActiveUser(profile)) redirect('/access-denied');
  if (!profile.display_name) redirect('/activate');

  const navLinks = [
    { href: '/dashboard', label: 'Tableau de bord', key: 'dashboard' },
  ];
  if (profile.is_admin) {
    navLinks.push({ href: '/admin', label: 'Administration', key: 'admin' });
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <header className="sticky top-0 z-30 border-b border-[#21262d] bg-[#0d1117]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="font-bold text-lg tracking-tight text-[#FFCC00]"
            >
              DeutschMaroc
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    activeSection === link.key
                      ? 'bg-[#161b22] text-[#e6edf3]'
                      : 'text-gray-400 hover:text-[#e6edf3] hover:bg-[#161b22]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenu profile={profile} email={user.email} />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
