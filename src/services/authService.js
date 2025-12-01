import { load, save } from '../utils/storage';
const USERS_KEY = 'ms_users';

export const register = async ({ name, email, password }) => {
  const users = load(USERS_KEY, {});
  if (users[email]) throw new Error('Email đã tồn tại');
  users[email] = { id: Date.now().toString(), name, email, password };
  save(USERS_KEY, users);
  return { id: users[email].id, name, email };
};

export const login = async ({ email, password }) => {
  const users = load(USERS_KEY, {});
  const u = users[email];
  if (!u || u.password !== password) throw new Error('Email hoặc mật khẩu không đúng');
  return { id: u.id, name: u.name, email: u.email };
};

export const oauthLogin = async (provider) => {
  return { id: `${provider}-${Date.now()}`, name: `${provider} user`, email: `${provider}-${Date.now()}@example.com` };
};

export const phoneLogin = async (phone) => {
  return { id: `phone-${phone}`, name: phone, phone };
};
