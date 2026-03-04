import React, { createContext, useContext, useState } from 'react';

export type NewsType = 'hackathon' | 'workshop' | 'startup' | 'general';

export interface NewsItem {
  id: string;
  type: NewsType;
  title: string;
  description: string;
  date: string;
  postedBy: string;
  hot: boolean;
  link?: string;
}

interface NewsContextType {
  news: NewsItem[];
  addNews: (item: Omit<NewsItem, 'id' | 'date'>) => void;
  deleteNews: (id: string) => void;
}

const NewsContext = createContext<NewsContextType | null>(null);

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [news, setNews] = useState<NewsItem[]>([]);

  const addNews = (item: Omit<NewsItem, 'id' | 'date'>) => {
    setNews(prev => [{
      ...item,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    }, ...prev]);
  };

  const deleteNews = (id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NewsContext.Provider value={{ news, addNews, deleteNews }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  const ctx = useContext(NewsContext);
  if (!ctx) throw new Error('useNews must be used within NewsProvider');
  return ctx;
};