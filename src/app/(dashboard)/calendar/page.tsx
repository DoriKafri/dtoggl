'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/hooks/useApi';
import { formatDuration } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface TimeEntry {
  id: string;
  description: string;
  start: string;
  stop: string | null;
  duration: number | null;
  project?: { id: string; name: string; color: string } | null;
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function getCalendarGrid(year: number, month: number): (Date | null)[][] {
  const days = getDaysInMonth(year, month);
  const firstDay = days[0].getDay();
  const startPad = firstDay === 0 ? 6 : firstDay - 1; // Monday start

  const grid: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(startPad).fill(null);

  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    grid.push(week);
  }
  return grid;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const grid = useMemo(() => getCalendarGrid(year, month), [year, month]);

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);
      const data = await api(`/api/time-entries?start=${start.toISOString()}&end=${end.toISOString()}`);
      setEntries(data.filter((e: TimeEntry) => e.stop !== null));
    } catch {
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  // Group entries by day key
  const entriesByDay = useMemo(() => {
    const map: Record<string, { entries: TimeEntry[]; total: number }> = {};
    for (const entry of entries) {
      const key = new Date(entry.start).toDateString();
      if (!map[key]) map[key] = { entries: [], total: 0 };
      map[key].entries.push(entry);
      map[key].total += entry.duration || 0;
    }
    return map;
  }, [entries]);

  const goMonth = (delta: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
    setSelectedDay(null);
  };

  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date().toDateString());
  };

  const today = new Date().toDateString();
  const selectedEntries = selectedDay ? entriesByDay[selectedDay] : null;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-purple-400" size={22} />
          <h1 className="text-lg font-semibold text-white">{monthLabel}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goMonth(-1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => goMonth(1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Calendar grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="text-center text-xs text-gray-500 font-medium py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {grid.flat().map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} className="aspect-square bg-gray-900/30 rounded-lg" />;
              }

              const key = day.toDateString();
              const dayData = entriesByDay[key];
              const isToday = key === today;
              const isSelected = key === selectedDay;
              const totalHours = dayData ? dayData.total / 3600 : 0;

              // Color intensity based on hours worked
              let bgClass = 'bg-gray-900/50 hover:bg-gray-800';
              if (totalHours > 0) {
                if (totalHours >= 8) bgClass = 'bg-purple-600/40 hover:bg-purple-600/50';
                else if (totalHours >= 6) bgClass = 'bg-purple-600/30 hover:bg-purple-600/40';
                else if (totalHours >= 4) bgClass = 'bg-purple-600/20 hover:bg-purple-600/30';
                else if (totalHours >= 2) bgClass = 'bg-purple-600/15 hover:bg-purple-600/20';
                else bgClass = 'bg-purple-600/10 hover:bg-purple-600/15';
              }

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(isSelected ? null : key)}
                  className={`aspect-square rounded-lg p-1.5 flex flex-col items-start transition-all ${bgClass} ${
                    isSelected ? 'ring-2 ring-purple-500' : ''
                  } ${isToday ? 'ring-1 ring-purple-400/50' : ''}`}
                >
                  <span
                    className={`text-xs font-medium ${
                      isToday ? 'bg-purple-500 text-white w-5 h-5 rounded-full flex items-center justify-center' : 'text-gray-400'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {dayData && (
                    <>
                      <span className="text-[10px] text-purple-300 font-mono mt-auto">
                        {formatDuration(dayData.total)}
                      </span>
                      {/* Project dots */}
                      <div className="flex gap-0.5 mt-0.5 flex-wrap">
                        {Array.from(new Set(dayData.entries.map((e) => e.project?.color).filter(Boolean)))
                          .slice(0, 5)
                          .map((color, j) => (
                            <span
                              key={j}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: color as string }}
                            />
                          ))}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Month stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <div className="text-xs text-gray-500">Total Hours</div>
              <div className="text-lg font-mono text-white mt-1">
                {formatDuration(Object.values(entriesByDay).reduce((sum, d) => sum + d.total, 0))}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <div className="text-xs text-gray-500">Days Tracked</div>
              <div className="text-lg font-mono text-white mt-1">
                {Object.keys(entriesByDay).length}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <div className="text-xs text-gray-500">Avg Per Day</div>
              <div className="text-lg font-mono text-white mt-1">
                {Object.keys(entriesByDay).length > 0
                  ? formatDuration(
                      Math.round(
                        Object.values(entriesByDay).reduce((sum, d) => sum + d.total, 0) /
                          Object.keys(entriesByDay).length
                      )
                    )
                  : '00:00:00'}
              </div>
            </div>
          </div>
        </div>

        {/* Detail sidebar */}
        {selectedDay && (
          <div className="w-80 bg-gray-800/50 border-l border-gray-700 overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-sm font-semibold text-white">
                {new Date(selectedDay).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              {selectedEntries && (
                <p className="text-xs text-gray-400 mt-1">
                  {selectedEntries.entries.length} entries &middot; {formatDuration(selectedEntries.total)}
                </p>
              )}
            </div>
            <div className="divide-y divide-gray-700/50">
              {selectedEntries?.entries.length ? (
                selectedEntries.entries.map((entry) => (
                  <div key={entry.id} className="p-3">
                    <div className="text-sm text-white">
                      {entry.description || '(no description)'}
                    </div>
                    {entry.project && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: entry.project.color }}
                        />
                        <span className="text-xs text-gray-400">{entry.project.name}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(entry.start).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {entry.stop &&
                          ` - ${new Date(entry.stop).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`}
                      </span>
                      <span className="text-xs font-mono text-gray-300">
                        {formatDuration(entry.duration || 0)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-gray-500">No entries this day</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
