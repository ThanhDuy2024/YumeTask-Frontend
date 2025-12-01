import React from 'react';
import { Menu, X } from 'lucide-react';

export default function HeaderBar({ sidebarOpen, setSidebarOpen, title, rightActions }) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-3">{rightActions}</div>
    </div>
  );
}
