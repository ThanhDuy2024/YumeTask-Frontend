import React from 'react';
import { Circle, CheckCircle2, Star, Trash2 } from 'lucide-react';

export default function TaskCard({ task, onToggleComplete, onToggleImportant, onDelete, onOpenEdit }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition cursor-pointer" onClick={() => onOpenEdit(task)}>
      <div className="flex items-center gap-3">
        <button onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}>
          {task.completed ? <CheckCircle2 className="w-5 h-5 text-blue-600" /> : <Circle className="w-5 h-5 text-gray-400" />}
        </button>

        <div className="flex-1">
          <div className={`${task.completed ? 'line-through text-gray-400' : ''}`}>{task.text}</div>
          {task.notes && <div className="text-xs text-gray-500 mt-1">{task.notes}</div>}
        </div>

        <div className="flex items-center gap-2">
          {task.dueDate && <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{task.dueDate}</div>}
          <button onClick={(e) => { e.stopPropagation(); onToggleImportant(task.id); }}><Star className={`w-5 h-5 ${task.important ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="text-red-500 p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
