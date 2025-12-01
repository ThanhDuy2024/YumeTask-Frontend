import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register, oauthLogin, phoneLogin } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const doLogin = async () => { try { await login({ email: form.email, password: form.password }); } catch (e) { alert(e.message); } };
  const doRegister = async () => { try { await register({ name: form.name, email: form.email, password: form.password }); } catch (e) { alert(e.message); } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Microsoft To Do</h1>
        </div>

        {showLogin ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Đăng nhập</h2>
            <input className="w-full px-4 py-3 border rounded mb-2" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <input type="password" className="w-full px-4 py-3 border rounded mb-2" placeholder="Mật khẩu" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            <button onClick={doLogin} className="w-full bg-blue-600 text-white py-3 rounded">Đăng nhập</button>
            <div className="mt-3 text-center"><button onClick={() => setShowLogin(false)} className="text-blue-600">Chưa có tài khoản? Đăng ký</button></div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Đăng ký</h2>
            <input className="w-full px-4 py-3 border rounded mb-2" placeholder="Họ và tên" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="w-full px-4 py-3 border rounded mb-2" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <input type="password" className="w-full px-4 py-3 border rounded mb-2" placeholder="Mật khẩu" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            <button onClick={doRegister} className="w-full bg-green-600 text-white py-3 rounded">Đăng ký</button>
            <div className="mt-3 text-center"><button onClick={() => setShowLogin(true)} className="text-blue-600">Đã có tài khoản? Đăng nhập</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
