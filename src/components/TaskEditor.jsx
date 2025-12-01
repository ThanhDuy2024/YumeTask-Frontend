import React, { useEffect, useState } from 'react';

export default function TaskEditor({ task, lists, onCancel, onSave, onDelete }) {
  const [form, setForm] = useState({ text: '', notes: '', dueDate: '', important: false, listId: 'inbox', completed: false });

  useEffect(() => {
    if (task) setForm({ text: task.text, notes: task.notes || '', dueDate: task.dueDate || '', important: !!task.important, listId: task.listId || 'inbox', completed: !!task.completed });
  }, [task]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Chi tiết nhiệm vụ</h3>
      <div className="space-y-3">
        <input value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} className="w-full px-3 py-2 border rounded" />
        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 border rounded" rows={3} />
        <div className="flex gap-2">
          <select value={form.listId} onChange={e => setForm(f => ({ ...f, listId: e.target.value }))} className="flex-1 px-3 py-2 border rounded">
            {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <input type="date" value={form.dueDate || ''} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-40 px-3 py-2 border rounded" />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.important} onChange={e => setForm(f => ({ ...f, important: e.target.checked }))} /> Quan trọng</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.completed} onChange={e => setForm(f => ({ ...f, completed: e.target.checked }))} /> Hoàn thành</label>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1 border rounded">Hủy</button>
        <button onClick={() => onSave(form)} className="px-3 py-1 bg-blue-600 text-white rounded">Lưu</button>
        <button onClick={() => { if (confirm('Xóa nhiệm vụ?')) onDelete(); }} className="px-3 py-1 bg-red-50 text-red-600 rounded border">Xóa</button>
      </div>
    </div>
  );
}
