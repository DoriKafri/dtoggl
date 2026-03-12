'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(additionalShortcuts?: ShortcutMap) {
  const router = useRouter();
  const pathname = usePathname();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // Allow Escape even in inputs
        if (e.key !== 'Escape') return;
      }

      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Global navigation shortcuts
      if (key === 't' && !ctrl && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        router.push('/timer');
        return;
      }
      if (key === 'r' && !ctrl && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        router.push('/reports');
        return;
      }
      if (key === 'p' && !ctrl && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        router.push('/projects');
        return;
      }
      if (key === 'c' && !ctrl && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        router.push('/calendar');
        return;
      }

      // Ctrl+N: Focus timer input (new entry)
      if (key === 'n' && ctrl) {
        e.preventDefault();
        if (pathname !== '/timer') {
          router.push('/timer');
        }
        // Focus the timer description input
        setTimeout(() => {
          const input = document.querySelector<HTMLInputElement>('input[placeholder*="working on"]');
          input?.focus();
        }, 100);
        return;
      }

      // ? key: Show help
      if (key === '?' && e.shiftKey) {
        e.preventDefault();
        // Dispatch custom event for help modal
        window.dispatchEvent(new CustomEvent('dtoggl:show-shortcuts'));
        return;
      }

      // Run additional page-specific shortcuts
      if (additionalShortcuts) {
        const shortcutKey = `${ctrl ? 'ctrl+' : ''}${e.shiftKey ? 'shift+' : ''}${key}`;
        if (additionalShortcuts[shortcutKey]) {
          e.preventDefault();
          additionalShortcuts[shortcutKey]();
        }
      }
    },
    [router, pathname, additionalShortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export const SHORTCUTS = [
  { keys: ['T'], description: 'Go to Timer' },
  { keys: ['R'], description: 'Go to Reports' },
  { keys: ['P'], description: 'Go to Projects' },
  { keys: ['C'], description: 'Go to Calendar' },
  { keys: ['Ctrl', 'N'], description: 'New time entry' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['Esc'], description: 'Close modal/dialog' },
];
