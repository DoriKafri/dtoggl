'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { PROJECT_COLORS } from '@/lib/utils';
import { Plus, Trash2, Edit3, FolderKanban } from 'lucide-react';

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
  billable: boolean;
  archived: boolean;
  clientId: string | null;
  client: Client | null;
  _count?: { timeEntries: number };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#E74C3C');
  const [billable, setBillable] = useState(false);
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([api('/api/projects'), api('/api/clients')]);
      setProjects(p);
      setClients(c);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditProject(null);
    setName('');
    setColor('#E74C3C');
    setBillable(false);
    setClientId('');
    setShowModal(true);
  };

  const openEdit = (p: Project) => {
    setEditProject(p);
    setName(p.name);
    setColor(p.color);
    setBillable(p.billable);
    setClientId(p.clientId || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    const data = { name, color, billable, clientId: clientId || null };
    if (editProject) {
      await api(`/api/projects/${editProject.id}`, { method: 'PATCH', body: JSON.stringify(data) });
    } else {
      await api('/api/projects', { method: 'POST', body: JSON.stringify(data) });
    }
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await api(`/api/projects/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Projects</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-1" /> New Project
        </Button>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="grid grid-cols-[1fr_150px_120px_100px_60px] gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-800">
          <span>Project</span>
          <span>Client</span>
          <span>Entries</span>
          <span>Billable</span>
          <span></span>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <FolderKanban size={32} className="mx-auto mb-2 opacity-50" />
            <p>No projects yet</p>
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[1fr_150px_120px_100px_60px] gap-4 px-6 py-3 items-center hover:bg-gray-800/50 transition-colors group border-b border-gray-800/50"
            >
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-sm text-white">{p.name}</span>
              </div>
              <span className="text-sm text-gray-400">{p.client?.name || '-'}</span>
              <span className="text-sm text-gray-400">{p._count?.timeEntries || 0}</span>
              <span className="text-sm text-gray-400">{p.billable ? 'Yes' : 'No'}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(p)} className="text-gray-500 hover:text-white">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(p.id)} className="text-gray-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editProject ? 'Edit Project' : 'New Project'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Color</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'ring-2 ring-white scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
            >
              <option value="">No client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} className="rounded" />
            Billable
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editProject ? 'Save' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
