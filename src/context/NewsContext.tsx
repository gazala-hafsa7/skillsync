import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/api';

export type NewsType = 'hackathon' | 'workshop' | 'startup' | 'general';

export interface NewsItem {
  id: string;
  type: NewsType;
  title: string;
  description: string;
  date: string;
  rawDate: string;
  eventDate?: string;
  formattedEventDate?: string;
  postedBy: string;
  hot: boolean;
  link?: string;
}

interface NewsContextType {
  news: NewsItem[];
  addNews: (item: Omit<NewsItem, 'id' | 'date' | 'rawDate' | 'formattedEventDate'>) => Promise<any>;
  updateNews: (id: string, item: Omit<NewsItem, 'id' | 'date' | 'rawDate' | 'formattedEventDate'>) => Promise<any>;
  deleteNews: (id: string) => Promise<void>;
}

const NewsContext = createContext<NewsContextType | null>(null);

const normalizeNews = (item: any): NewsItem => ({
  ...item,
  id: item._id || item.id,
  rawDate: item.date,
  date: item.date
    ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '',
  eventDate: item.eventDate || '',
  formattedEventDate: item.eventDate
    ? new Date(item.eventDate).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '',
});

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    let active = true;

    const loadNews = async () => {
      const data = await api.getNews();

      if (active && Array.isArray(data)) {
        setNews(data.map(normalizeNews));
      }
    };

    loadNews();

    const intervalId = window.setInterval(loadNews, 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const addNews = async (item: Omit<NewsItem, 'id' | 'date' | 'rawDate' | 'formattedEventDate'>) => {
    const data = await api.createNews(item);

    if (data?._id) {
      setNews(prev => [normalizeNews(data), ...prev]);
    }

    return data;
  };

  const updateNews = async (id: string, item: Omit<NewsItem, 'id' | 'date' | 'rawDate' | 'formattedEventDate'>) => {
    const data = await api.updateNews(id, item);

    if (data?._id || data?.id) {
      const normalized = normalizeNews(data);
      setNews(prev => prev.map(entry => (entry.id === id ? normalized : entry)));
    }

    return data;
  };

  const deleteNews = async (id: string) => {
    await api.deleteNews(id);
    setNews(prev => prev.filter(item => item.id !== id));
  };

  return (
    <NewsContext.Provider value={{ news, addNews, updateNews, deleteNews }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  const ctx = useContext(NewsContext);
  if (!ctx) throw new Error('useNews must be used within NewsProvider');
  return ctx;
};
