import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check localStorage for existing token and validate it
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      api.defaults.headers.common['Authorization'] = 'Bearer ' + savedToken;
      setToken(savedToken);
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(err => {
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (nombre, email, password) => {
    const { data } = await api.post('/auth/register', { nombre, email, password });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      return data;
    } catch {
      logout();
      throw new Error('Sesión expirada');
    }
  }, [logout]);

  const updateUser = useCallback((userData) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  }, []);

  const createUser = useCallback(async (userData) => {
    const { data } = await api.post('/auth/users', userData);
    return data;
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data } = await api.get('/auth/users');
    return data;
  }, []);

  const updateUserById = useCallback(async (id, userData) => {
    const { data } = await api.put(`/auth/users/${id}`, userData);
    return data;
  }, []);

  const deleteUser = useCallback(async (id, password) => {
    const { data } = await api.delete(`/auth/users/${id}`, { data: { password } });
    return data;
  }, []);

  const resendVerification = useCallback(async (id) => {
    const { data } = await api.post(`/auth/users/${id}/resend-verification`);
    return data;
  }, []);

  const adminVerifyUser = useCallback(async (id) => {
    const { data } = await api.post(`/auth/users/${id}/verify`);
    return data;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const { data } = await api.post('/auth/change-password', { currentPassword, newPassword });
    return data;
  }, []);

  const verifyMe = useCallback(async () => {
    const { data } = await api.post('/auth/verify-me');
    return data;
  }, []);

  const isAuthenticated = !!user;
  const roles = user?.roles || (user?.role ? [user.role] : []);
  const isSuperadmin = roles.includes('superadmin');
  const isAdmin = roles.includes('admin');
  const isEmployee = roles.includes('employee');
  const isCommercial = roles.includes('commercial');
  const isClient = roles.includes('client');
  const isSuperadminOrAdmin = isSuperadmin || isAdmin;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    roles,
    isSuperadmin,
    isAdmin,
    isEmployee,
    isCommercial,
    isClient,
    isSuperadminOrAdmin,
    login,
    register,
    logout,
    loadUser,
    setUser,
    updateUser,
    createUser,
    fetchUsers,
    updateUserById,
    deleteUser,
    resendVerification,
    adminVerifyUser,
    changePassword,
    verifyMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
