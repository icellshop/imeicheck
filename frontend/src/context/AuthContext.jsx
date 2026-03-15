import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { clearToken, getToken, setToken } from '../lib/session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setAuthToken] = useState(getToken());
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  const loadServices = useCallback(async () => {
    try {
      const data = await apiFetch('/api/services');
      setServices(Array.isArray(data) ? data.filter((s) => s.active) : []);
    } catch {
      // silently fail
    }
  }, []);

  const refreshUser = useCallback(async (currentToken) => {
    const tk = currentToken ?? getToken();
    if (!tk) {
      setUser(null);
      setAuthLoading(false);
      return;
    }
    try {
      const data = await apiFetch('/api/users/me', {}, tk);
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    setAuthLoading(true);
    refreshUser(token);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  function login(newToken) {
    setToken(newToken);
    setAuthToken(newToken);
  }

  function logout() {
    clearToken();
    setAuthToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, user, services, authLoading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
