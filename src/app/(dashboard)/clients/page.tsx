'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, Trash2, Edit3, Users } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  _count?: { projects: number };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api('/api/clients');
      setClients(data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditClient(null); setName(''); setShowModal(true); };
  const openEdit = (c: Client) => { setEditClient(c); setName(c.name); setShowModal(true); };

  const handleSave = async () => {
    if (editClient) {
      await api(`/api/clients/${editClient.id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
    } else {
      await api('/api/clients', { method: 'POST', body: JSON.stringify({ name }) });
    }
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await api(`/api/clients/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Clients</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-1" /> New Client
        </Button>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="grid grid-cols-[1fr_150px_60px] gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-800">
          <span>Client</span>
          <span>Projects</span>
          <span></span>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
        ) : clients.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Users size={32} className="mx-auto mb-2 opacity-50" />
            <p>No clients yet</p>
          </div>
        ) : (
          clients.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-[1fr_150px_60px] gap-4 px-6 py-3 items-center hover:bg-gray-800/50 transition-colors group border-b border-gray-800/50"
            >
              <span className="text-sm text-white">{c.name}</span>
              <span className="text-sm text-gray-400">{c._count?.projects || 0}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="text-gray-500 hover:text-white">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(c.id)} className="text-gray-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editClient ? 'Edit Client' : 'New Client'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" autoFocus />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editClient ? 'Save' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
