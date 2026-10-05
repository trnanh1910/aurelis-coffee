import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);
const readUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem('aurelis_user') || sessionStorage.getItem('aurelis_user'),
    );
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [authLoading, setAuthLoading] = useState(() =>
    Boolean(localStorage.getItem('aurelis_token') || sessionStorage.getItem('aurelis_token')),
  );

  useEffect(() => {
    if (!localStorage.getItem('aurelis_token') && !sessionStorage.getItem('aurelis_token')) return;
    let active = true;
    authService
      .me()
      .then((freshUser) => {
        if (!active) return;
        const storage = localStorage.getItem('aurelis_token') ? localStorage : sessionStorage;
        storage.setItem('aurelis_user', JSON.stringify(freshUser));
        setUser(freshUser);
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem('aurelis_token');
        localStorage.removeItem('aurelis_user');
        setUser(null);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password, remember = true) => {
    const result = await authService.login({ email, password });
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;
    otherStorage.removeItem('aurelis_token');
    otherStorage.removeItem('aurelis_user');
    storage.setItem('aurelis_token', result.token);
    storage.setItem('aurelis_user', JSON.stringify(result.user));
    setUser(result.user);
    return result.user;
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    const storage = localStorage.getItem('aurelis_token') ? localStorage : sessionStorage;
    storage.setItem('aurelis_user', JSON.stringify(nextUser));
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('aurelis_token') || sessionStorage.getItem('aurelis_token'))
        await authService.logout();
    } catch {
      /* A local sign out still works if the network is unavailable. */
    }
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem('aurelis_token');
      storage.removeItem('aurelis_user');
    }
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, authLoading, login, logout, updateUser, isAuthenticated: Boolean(user) }),
    [user, authLoading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
