'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/toast';
import { ShortcutsHelp } from '@/components/ui/shortcuts-help';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function KeyboardShortcutsInit() {
  useKeyboardShortcuts();
  return null;
}

export function DashboardProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <KeyboardShortcutsInit />
      <ShortcutsHelp />
      {children}
    </ToastProvider>
  );
}
