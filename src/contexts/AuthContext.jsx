import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken, clearToken, getToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.get('/auth/me')
      .then((u) => setUser(u))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const { token, user: u } = await api.post('/auth/login', { username, password });
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const setup = useCallback(async (name, username, password) => {
    const { token, user: u } = await api.post('/auth/setup', { name, username, password });
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, setup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
