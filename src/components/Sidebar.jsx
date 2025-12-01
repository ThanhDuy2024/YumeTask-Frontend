import React from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useTodos } from '../context/TodoContext';

export default function Sidebar({ selectedList, setSelectedList, openCreateList, openEditList, onLogout, user }) {
  const { lists, deleteList } = useTodos();

  const countForList = (id, tasks) => {
    return 0;
  };

  return (
    <aside className="w-72 bg-white border-r p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold">{user?.name || 'Khách'}</div>
          <div className="text-xs text-gray-500">{user?.email || ''}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-auto">
        {lists.map(l => (
          <div key={l.id} className="flex items-center">
            <button onClick={() => setSelectedList(l.id)} className={`w-full text-left px-3 py-2 rounded ${selectedList === l.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
              {l.name}
            </button>
            {!l.system && (
              <div className="ml-2 flex gap-1">
                <button onClick={() => openEditList(l)} className="p-1 rounded hover:bg-gray-100"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => deleteList(l.id)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4"/></button>
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="mt-4">
        <button onClick={openCreateList} className="w-full px-3 py-2 rounded bg-blue-50 hover:bg-blue-100 flex items-center gap-2"><Plus className="w-4 h-4 text-blue-600"/>Tạo danh sách</button>
        <button onClick={onLogout} className="w-full px-3 py-2 mt-3 rounded border text-red-600">Đăng xuất</button>
      </div>
    </aside>
  );
}
