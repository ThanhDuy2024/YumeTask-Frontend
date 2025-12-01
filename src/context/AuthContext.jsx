import React, { createContext, useContext, useState } from 'react';
import * as authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const register = async (payload) => {
    const u = await authService.register(payload);
    setUser(u);
    navigate('/');
    return u;
  };

  const login = async (payload) => {
    const u = await authService.login(payload);
    setUser(u);
    navigate('/');
    return u;
  };

  const oauthLogin = async (provider) => {
    const u = await authService.oauthLogin(provider);
    setUser(u);
    navigate('/');
    return u;
  };

  const phoneLogin = async (phone) => {
    const u = await authService.phoneLogin(phone);
    setUser(u);
    navigate('/');
    return u;
  };

  const logout = () => { setUser(null); navigate('/auth'); };

  return (
    <AuthContext.Provider value={{ user, register, login, oauthLogin, phoneLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
