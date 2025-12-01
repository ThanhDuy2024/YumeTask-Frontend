import React, { createContext, useContext, useEffect, useState } from 'react';
import * as todoService from '../services/todoService';
import { useAuth } from './AuthContext';

const TodoContext = createContext();
export const useTodos = () => useContext(TodoContext);

export function TodoProvider({ children }) {
  const { user } = useAuth();
  const userKey = user?.email || null;

  const [lists, setLists] = useState(() => todoService.loadData(userKey).lists);
  const [tasks, setTasks] = useState(() => todoService.loadData(userKey).tasks);

  useEffect(() => {
    const data = todoService.loadData(userKey);
    setLists(data.lists);
    setTasks(data.tasks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey]);

  useEffect(() => {
    todoService.saveData(userKey, { lists, tasks });
  }, [userKey, lists, tasks]);

  // CRUD task/list operations
  const addTask = (task) => setTasks(prev => [task, ...prev]);
  const updateTask = (id, patch) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  const removeTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  const createList = (list) => setLists(prev => [...prev, list]);
  const updateList = (id, patch) => setLists(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  const deleteList = (id) => {
    // move tasks to inbox
    setTasks(prev => prev.map(t => t.listId === id ? { ...t, listId: 'inbox' } : t));
    setLists(prev => prev.filter(l => l.id !== id));
  };

  return (
    <TodoContext.Provider value={{ lists, tasks, addTask, updateTask, removeTask, createList, updateList, deleteList }}>
      {children}
    </TodoContext.Provider>
  );
}
