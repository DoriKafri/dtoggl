'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Tag } from 'lucide-react';

interface TagItem {
  id: string;
  name: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setTags(await api('/api/tags')); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newTag.trim()) return;
    await api('/api/tags', { method: 'POST', body: JSON.stringify({ name: newTag.trim() }) });
    setNewTag('');
    load();
  };

  const handleDelete = async (id: string) => {
    await api(`/api/tags/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Tags</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="New tag name"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          className="max-w-xs"
        />
        <Button onClick={handleCreate}><Plus size={16} className="mr-1" /> Add</Button>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
        ) : tags.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Tag size={32} className="mx-auto mb-2 opacity-50" />
            <p>No tags yet</p>
          </div>
        ) : (
          tags.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-6 py-3 hover:bg-gray-800/50 transition-colors group border-b border-gray-800/50"
            >
              <span className="text-sm text-white">{t.name}</span>
              <button
                onClick={() => handleDelete(t.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
