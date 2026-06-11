import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/api';
import type { PersonalCalendarItem } from '../types/calendar';

export type Role = 'student' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: Role;
  isMentor?: boolean;
  dept?: string;
  year?: string;
  skills?: string[];
  achievements?: string[];
  personalCalendar?: PersonalCalendarItem[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, roleOverride?: Role) => Promise<any>;
  register: (data: { name: string; email: string; password: string; role?: Role }) => Promise<any>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const persistUser = (data: any, roleOverride?: Role) => {
    const nextUser: User = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role || roleOverride || 'student',
      isMentor: Boolean(data.isMentor),
      dept: data.dept || '',
      year: data.year || '',
      skills: Array.isArray(data.skills) ? data.skills : [],
      achievements: Array.isArray(data.achievements) ? data.achievements : [],
      personalCalendar: Array.isArray(data.personalCalendar) ? data.personalCalendar : [],
    };

    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) return;

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem('user');
    }
  }, []);

  const login = async (email: string, password: string, roleOverride?: Role) => {
    const data = await api.login(email, password);

    if (data.token) {
      persistUser(data, roleOverride);
    }

    return data;
  };

  const register = async (data: { name: string; email: string; password: string; role?: Role }) => {
    const response = await api.register(data);

    if (response.token) {
      persistUser(response);
    }

    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    const response = await api.updateMyProfile(data);

    if (response._id) {
      persistUser({ ...response, token: localStorage.getItem('token') });
      return;
    }

    setUser(prev => {
      if (!prev) return null;

      const nextUser = { ...prev, ...data };
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
