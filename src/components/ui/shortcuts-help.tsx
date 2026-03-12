'use client';

import { useState, useEffect } from 'react';
import { Modal } from './modal';
import { SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { Keyboard } from 'lucide-react';

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('dtoggl:show-shortcuts', handler);
    return () => window.removeEventListener('dtoggl:show-shortcuts', handler);
  }, []);

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Keyboard Shortcuts">
      <div className="space-y-2">
        {SHORTCUTS.map((s) => (
          <div key={s.description} className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-300">{s.description}</span>
            <div className="flex items-center gap-1">
              {s.keys.map((k, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-gray-600 mx-0.5">+</span>}
                  <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-mono bg-gray-700 border border-gray-600 rounded text-gray-300">
                    {k}
                  </kbd>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-700">
        Shortcuts are disabled when typing in input fields (except Esc).
      </p>
    </Modal>
  );
}
