'use client';

import { useState, useEffect, useCallback } from 'react';
import { TimerBar } from '@/components/timer/TimerBar';
import { api } from '@/hooks/useApi';
import { formatDuration, formatDate, formatTime } from '@/lib/utils';
import { Trash2, Edit3, FolderKanban } from 'lucide-react';

interface TimeEntry {
  id: string;
  description: string;
  start: string;
  stop: string | null;
  duration: number | null;
  billable: boolean;
  projectId: string | null;
  project?: { id: string; name: string; color: string; client?: { name: string } | null } | null;
  tags?: { tag: { id: string; name: string } }[];
}

export default function TimerPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const data = await api(`/api/time-entries?start=${weekAgo.toISOString()}&end=${now.toISOString()}`);
      setEntries(data.filter((e: TimeEntry) => e.stop !== null));
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const deleteEntry = async (id: string) => {
    await api(`/api/time-entries/${id}`, { method: 'DELETE' });
    loadEntries();
  };

  // Group entries by day
  const grouped = entries.reduce<Record<string, { date: string; entries: TimeEntry[]; total: number }>>((acc, entry) => {
    const day = new Date(entry.start).toDateString();
    if (!acc[day]) {
      acc[day] = { date: day, entries: [], total: 0 };
    }
    acc[day].entries.push(entry);
    acc[day].total += entry.duration || 0;
    return acc;
  }, {});

  const days = Object.values(grouped).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col h-screen">
      <TimerBar onEntryChange={loadEntries} />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : days.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-lg">No time entries yet</p>
            <p className="text-sm mt-1">Start the timer to track your work</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {days.map((day) => (
              <div key={day.date}>
                <div className="flex items-center justify-between px-6 py-3 bg-gray-900/50 sticky top-0">
                  <span className="text-sm font-medium text-gray-300">
                    {formatDate(new Date(day.date))}
                  </span>
                  <span className="text-sm text-gray-400 font-mono">
                    {formatDuration(day.total)}
                  </span>
                </div>
                <div className="divide-y divide-gray-800/50">
                  {day.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 px-6 py-3 hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white truncate">
                            {entry.description || '(no description)'}
                          </span>
                        </div>
                        {entry.project && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: entry.project.color }}
                            />
                            <span className="text-xs text-gray-400">{entry.project.name}</span>
                            {entry.project.client && (
                              <span className="text-xs text-gray-500">- {entry.project.client.name}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex gap-1">
                            {entry.tags.map((t) => (
                              <span key={t.tag.id} className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                                {t.tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {entry.billable && (
                          <span className="text-xs text-green-400">$</span>
                        )}
                      </div>

                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTime(new Date(entry.start))} - {entry.stop ? formatTime(new Date(entry.stop)) : '...'}
                      </div>

                      <div className="text-sm font-mono text-white min-w-[70px] text-right">
                        {formatDuration(entry.duration || 0)}
                      </div>

                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
