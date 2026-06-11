import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/api';
import { useAuth } from './AuthContext';

export interface TaggedStudent {
  userId: string;
  name: string;
  email?: string;
}

export interface ResultItem {
  id: string;
  title: string;
  description: string;
  category: string;
  resultDate?: string;
  formattedResultDate?: string;
  postedBy: string;
  taggedStudents: TaggedStudent[];
  createdAt?: string;
}

interface ResultContextType {
  results: ResultItem[];
  addResult: (item: Omit<ResultItem, 'id' | 'formattedResultDate'>) => Promise<any>;
  deleteResult: (id: string) => Promise<void>;
}

const ResultContext = createContext<ResultContextType | null>(null);

const normalizeResult = (item: any): ResultItem => ({
  ...item,
  id: item._id || item.id,
  resultDate: item.resultDate || '',
  formattedResultDate: item.resultDate
    ? new Date(item.resultDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '',
  taggedStudents: Array.isArray(item.taggedStudents) ? item.taggedStudents : [],
});

export const ResultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<ResultItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setResults([]);
      return;
    }

    let active = true;

    const loadResults = async () => {
      const data = await api.getResults();

      if (active && Array.isArray(data)) {
        setResults(data.map(normalizeResult));
      }
    };

    loadResults();

    const intervalId = window.setInterval(loadResults, 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [user]);

  const addResult = async (item: Omit<ResultItem, 'id' | 'formattedResultDate'>) => {
    const data = await api.createResult(item);

    if (data?._id) {
      setResults(prev => [normalizeResult(data), ...prev]);
    }

    return data;
  };

  const deleteResult = async (id: string) => {
    await api.deleteResult(id);
    setResults(prev => prev.filter(item => item.id !== id));
  };

  return <ResultContext.Provider value={{ results, addResult, deleteResult }}>{children}</ResultContext.Provider>;
};

export const useResults = () => {
  const ctx = useContext(ResultContext);
  if (!ctx) throw new Error('useResults must be used within ResultProvider');
  return ctx;
};
