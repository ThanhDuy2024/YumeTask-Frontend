import { load, save } from '../utils/storage';

const DEFAULT_KEY = 'todo_data_public';
const defaultLists = [
  { id: 'inbox', name: 'Hộp thư đến', system: true },
  { id: 'my-day', name: 'Ngày của tôi', system: true },
  { id: 'important', name: 'Quan trọng', system: true },
  { id: 'planned', name: 'Đã lên kế hoạch', system: true },
  { id: 'tasks', name: 'Nhiệm vụ', system: true }
];

export const loadData = (userKey) => {
  const key = userKey ? `todo_data_${userKey}` : DEFAULT_KEY;
  const raw = load(key, null);
  if (!raw) return { lists: defaultLists, tasks: [] };
  return raw;
};

export const saveData = (userKey, data) => {
  const key = userKey ? `todo_data_${userKey}` : DEFAULT_KEY;
  save(key, data);
};
