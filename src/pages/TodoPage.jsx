import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import HeaderBar from '../components/HeaderBar';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import TaskEditor from '../components/TaskEditor';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useTodos } from '../context/TodoContext';

const uid = () => Math.random().toString(36).slice(2,9);
const todayISO = () => new Date().toISOString().slice(0,10);

export default function TodoPage() {
  const { user, logout } = useAuth();
  const { lists, tasks, addTask, updateTask, removeTask, createList, updateList, deleteList } = useTodos();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedList, setSelectedList] = useState('my-day');
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [listModalMode, setListModalMode] = useState('create');
  const [listForm, setListForm] = useState({ id: '', name: '' });

  // Derived tasks for the selected view
  const tasksBySelected = useMemo(() => {
    if (selectedList === 'important') return tasks.filter(t => t.important);
    if (selectedList === 'my-day') return tasks.filter(t => t.dueDate === todayISO());
    if (selectedList === 'planned') return tasks.filter(t => !!t.dueDate);
    return tasks.filter(t => t.listId === selectedList);
  }, [tasks, selectedList]);

  const newTaskInputRef = useRef(null);

  const handleAddTask = () => {
    const text = newTaskText.trim();
    if (!text) return;
    const t = {
      id: uid(), text, completed: false, important: false, dueDate: null, notes: '', listId: (selectedList === 'my-day' || selectedList === 'important' || selectedList === 'planned') ? 'inbox' : selectedList, createdAt: new Date().toISOString()
    };
    addTask(t);
    setNewTaskText('');
    if (newTaskInputRef.current) newTaskInputRef.current.focus();
  };

  const openEditTask = (task) => { setSelectedTask(task); setShowTaskModal(true); };
  const closeEditTask = () => { setSelectedTask(null); setShowTaskModal(false); };

  const handleSaveTask = (patch) => { updateTask(selectedTask.id, patch); setShowTaskModal(false); };

  const openCreateList = () => { setListModalMode('create'); setListForm({ id: '', name: '' }); setShowListModal(true); };
  const openEditList = (l) => { setListModalMode('edit'); setListForm({ id: l.id, name: l.name }); setShowListModal(true); };
  const handleSaveList = () => {
    if (listModalMode === 'create') createList({ id: 'list-' + uid(), name: listForm.name, system: false });
    else updateList(listForm.id, { name: listForm.name });
    setShowListModal(false);
  };

  return (
    <div className="flex h-screen">
      <Sidebar selectedList={selectedList} setSelectedList={setSelectedList} openCreateList={openCreateList} openEditList={openEditList} onLogout={logout} user={user} />

      <div className="flex-1 flex flex-col">
        <HeaderBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} title={lists.find(l=>l.id===selectedList)?.name || 'Danh sách'} rightActions={<></>} />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow p-4 mb-4 flex items-center gap-3">
              <Plus className="w-5 h-5 text-blue-600" />
              <input ref={newTaskInputRef} value={newTaskText} onChange={e=>setNewTaskText(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleAddTask()} placeholder="Thêm nhiệm vụ" className="flex-1 outline-none text-sm" />
              <button onClick={handleAddTask} className="px-3 py-1 bg-green-600 text-white rounded">Thêm</button>
            </div>

            <div className="space-y-3">
              {tasksBySelected.length === 0 ? (
                <div className="text-center py-12 text-gray-400">Chưa có nhiệm vụ</div>
              ) : tasksBySelected.map(t => (
                <TaskCard key={t.id} task={t} onToggleComplete={(id)=>updateTask(id, { completed: !t.completed })} onToggleImportant={(id)=>updateTask(id, { important: !t.important })} onDelete={(id)=>removeTask(id)} onOpenEdit={(task)=>openEditTask(task)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal open={showTaskModal} onClose={closeEditTask}>
        {selectedTask && <TaskEditor task={selectedTask} lists={lists} onCancel={closeEditTask} onSave={(patch)=>handleSaveTask(patch)} onDelete={()=>{ removeTask(selectedTask.id); closeEditTask(); }} />}
      </Modal>

      <Modal open={showListModal} onClose={()=>setShowListModal(false)}>
        <div>
          <h3 className="text-lg font-semibold mb-3">{listModalMode === 'create' ? 'Tạo danh sách mới' : 'Sửa danh sách'}</h3>
          <input value={listForm.name} onChange={e=>setListForm(f=>({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border rounded mb-3" />
          <div className="flex gap-2 justify-end">
            <button onClick={()=>setShowListModal(false)} className="px-3 py-1 border rounded">Hủy</button>
            <button onClick={handleSaveList} className="px-3 py-1 bg-blue-600 text-white rounded">Lưu</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
