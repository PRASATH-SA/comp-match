import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check for token in URL params (after Google OAuth)
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'success') {
        window.history.replaceState({}, '', window.location.pathname);
      }

      const { data } = await authAPI.getMe();
      setUser(data.user);
    } catch {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    if (data.token) localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    return data;
  };

  const verifyOTP = async (email, code, purpose = 'registration') => {
    const { data } = await authAPI.verifyOTP({ email, code, purpose });
    if (data.token) localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const googleLogin = () => {
    authAPI.googleLogin();
  };

  const logout = async () => {
    await authAPI.logout();
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOTP, googleLogin, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
