'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, FolderKanban, Tag, DollarSign } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { api } from '@/hooks/useApi';
import { useToast } from '@/components/ui/toast';

interface Project {
  id: string;
  name: string;
  color: string;
  client?: { name: string } | null;
}

interface TagItem {
  id: string;
  name: string;
}

interface TimeEntry {
  id: string;
  description: string;
  start: string;
  stop: string | null;
  duration: number | null;
  billable: boolean;
  projectId: string | null;
  project?: Project | null;
  tags?: { tag: TagItem }[];
}

export function TimerBar({ onEntryChange }: { onEntryChange?: () => void }) {
  const { success, error: showError } = useToast();
  const [running, setRunning] = useState<TimeEntry | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [billable, setBillable] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      const data = await api('/api/projects');
      setProjects(data);
    } catch {}
  }, []);

  const loadRunning = useCallback(async () => {
    try {
      const data = await api('/api/time-entries/current');
      if (data) {
        setRunning(data);
        setDescription(data.description || '');
        setSelectedProject(data.project || null);
        setBillable(data.billable || false);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadRunning();
    loadProjects();
  }, [loadRunning, loadProjects]);

  useEffect(() => {
    if (running) {
      const start = new Date(running.start).getTime();
      const update = () => setElapsed(Math.floor((Date.now() - start) / 1000));
      update();
      intervalRef.current = setInterval(update, 1000);
    } else {
      setElapsed(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const handleStart = async () => {
    try {
      const entry = await api('/api/time-entries', {
        method: 'POST',
        body: JSON.stringify({
          description,
          start: new Date().toISOString(),
          projectId: selectedProject?.id,
          billable,
        }),
      });
      setRunning(entry);
      success('Timer started');
      onEntryChange?.();
    } catch { showError('Failed to start timer'); }
  };

  const handleStop = async () => {
    if (!running) return;
    try {
      await api(`/api/time-entries/${running.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          stop: new Date().toISOString(),
          description,
          projectId: selectedProject?.id,
          billable,
        }),
      });
      const dur = formatDuration(elapsed);
      setRunning(null);
      setDescription('');
      setSelectedProject(null);
      setBillable(false);
      success(`Time entry saved (${dur})`);
      onEntryChange?.();
    } catch { showError('Failed to stop timer'); }
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you working on?"
          className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !running) handleStart();
          }}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProjectPicker(!showProjectPicker)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
              selectedProject ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {selectedProject && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: selectedProject.color }}
              />
            )}
            <FolderKanban size={14} />
            {selectedProject ? selectedProject.name : ''}
          </button>

          <button
            onClick={() => setBillable(!billable)}
            className={cn(
              'px-2 py-1 rounded text-xs transition-colors',
              billable ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <DollarSign size={14} />
          </button>
        </div>

        <div className="text-white font-mono text-lg min-w-[80px] text-right">
          {running ? formatDuration(elapsed) : '00:00:00'}
        </div>

        <button
          onClick={running ? handleStop : handleStart}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
            running
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-purple-600 hover:bg-purple-700'
          )}
        >
          {running ? <Square size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
        </button>
      </div>

      {showProjectPicker && (
        <div className="absolute top-14 right-20 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-2 w-64 max-h-64 overflow-y-auto">
          <button
            onClick={() => { setSelectedProject(null); setShowProjectPicker(false); }}
            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-700 rounded"
          >
            No Project
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelectedProject(p); setShowProjectPicker(false); }}
              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center gap-2"
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
              {p.client && <span className="text-gray-500 text-xs ml-auto">{p.client.name}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
