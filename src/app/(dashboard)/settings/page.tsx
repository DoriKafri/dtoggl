'use client';

import { useState, useEffect } from 'react';
import { api } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<{ id: string; email: string; name: string | null } | null>(null);

  useEffect(() => {
    api('/api/auth/me').then(setUser).catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={20} className="text-gray-400" />
        <h1 className="text-xl font-semibold text-white">Settings</h1>
      </div>

      <div className="max-w-lg space-y-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <Input value={user?.name || ''} disabled />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <Input value={user?.email || ''} disabled />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Workspace</h2>
          <p className="text-sm text-gray-500">Workspace settings will appear here.</p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">About</h2>
          <p className="text-sm text-gray-400">
            dToggl v1.0.0 — Built with Next.js, Prisma, and Tailwind CSS.
          </p>
          <p className="text-sm text-gray-500 mt-1">A Develeap time tracking tool.</p>
        </div>
      </div>
    </div>
  );
}
