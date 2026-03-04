import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { NewsProvider } from './context/NewsContext';
import { Navbar } from './components/layout/navbar';
import { Footer } from './components/layout/footer';
import Home from './pages/Home';
import Login from './pages/login';
import Projects from './pages/projects';
import NewsBoard from './pages/newsboard';
import Profile from './pages/profile';
import './styles/globals.css';

type Page = 'home' | 'login' | 'projects' | 'newsboard' | 'profile';

const AppInner: React.FC = () => {
  const [page, setPage] = useState<Page>('home');

  const navigate = (p: string) => {
    setPage(p as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (page === 'login') return <Login onNavigate={navigate} />;

  return (
    <>
      <Navbar activePage={page} onNavigate={navigate} />
      {page === 'home'      && <Home onNavigate={navigate} />}
      {page === 'projects'  && <Projects />}
      {page === 'newsboard' && <NewsBoard />}
      {page === 'profile'   && <Profile />}
      <Footer />
    </>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <ProjectProvider>
      <NewsProvider>
        <AppInner />
      </NewsProvider>
    </ProjectProvider>
  </AuthProvider>
);

export default App;