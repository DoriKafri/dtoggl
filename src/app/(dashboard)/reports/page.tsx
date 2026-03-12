'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/hooks/useApi';
import { formatDuration } from '@/lib/utils';
import { BarChart3, Download } from 'lucide-react';

interface ReportData {
  totalSeconds: number;
  billableSeconds: number;
  billablePercentage: number;
  entryCount: number;
  byProject: { name: string; color: string; seconds: number; count: number }[];
  byDay: { date: string; seconds: number; billableSeconds: number }[];
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [range, setRange] = useState('week');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    let start: Date;
    switch (range) {
      case 'month': start = new Date(now.getFullYear(), now.getMonth(), 1); break;
      case 'year': start = new Date(now.getFullYear(), 0, 1); break;
      default: start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    try {
      const d = await api(`/api/reports?start=${start.toISOString()}&end=${now.toISOString()}`);
      setData(d);
    } catch {} finally { setLoading(false); }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const maxDaySeconds = data ? Math.max(...data.byDay.map((d) => d.seconds), 1) : 1;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Reports</h1>
        <div className="flex items-center gap-2">
          {['week', 'month', 'year'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                range === r ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
      ) : !data ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <BarChart3 size={32} className="opacity-50" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="text-xs text-gray-500 uppercase mb-1">Total Hours</div>
              <div className="text-2xl font-bold text-white">{formatDuration(data.totalSeconds)}</div>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="text-xs text-gray-500 uppercase mb-1">Billable</div>
              <div className="text-2xl font-bold text-purple-400">{data.billablePercentage}%</div>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="text-xs text-gray-500 uppercase mb-1">Entries</div>
              <div className="text-2xl font-bold text-white">{data.entryCount}</div>
            </div>
          </div>

          <div className="grid grid-cols-[2fr_1fr] gap-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Daily Breakdown</h3>
              <div className="flex items-end gap-1 h-48">
                {data.byDay.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col justify-end" style={{ height: '160px' }}>
                      <div
                        className="w-full bg-purple-600 rounded-t"
                        style={{ height: `${(d.billableSeconds / maxDaySeconds) * 160}px` }}
                      />
                      <div
                        className="w-full bg-purple-400/40 rounded-t"
                        style={{ height: `${((d.seconds - d.billableSeconds) / maxDaySeconds) * 160}px` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-4">By Project</h3>
              <div className="space-y-3">
                {data.byProject.map((p) => (
                  <div key={p.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-white">{p.name}</span>
                      </div>
                      <span className="text-gray-400 font-mono text-xs">{formatDuration(p.seconds)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: p.color,
                          width: `${(p.seconds / data.totalSeconds) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
