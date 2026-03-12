'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Timer,
  BarChart3,
  FolderKanban,
  Users,
  Tag,
  Settings,
  LogOut,
  Clock,
} from 'lucide-react';
import { api } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: 'TRACK', items: [
    { href: '/timer', icon: Timer, label: 'Timer' },
  ]},
  { label: 'ANALYZE', items: [
    { href: '/reports', icon: BarChart3, label: 'Reports' },
  ]},
  { label: 'MANAGE', items: [
    { href: '/projects', icon: FolderKanban, label: 'Projects' },
    { href: '/clients', icon: Users, label: 'Clients' },
    { href: '/tags', icon: Tag, label: 'Tags' },
  ]},
  { label: 'ADMIN', items: [
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await api('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-52 bg-gray-900 border-r border-gray-700 flex flex-col z-40">
      <div className="p-4 border-b border-gray-700">
        <Link href="/timer" className="flex items-center gap-2">
          <Clock className="text-purple-500" size={24} />
          <span className="text-lg font-bold text-white">dToggl</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="px-4 mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.label}
            </div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                  pathname === item.href || pathname?.startsWith(item.href + '/')
                    ? 'bg-purple-600/20 text-purple-400 border-r-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}
