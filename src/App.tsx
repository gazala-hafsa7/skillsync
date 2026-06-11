import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { NewsProvider } from './context/NewsContext';
import { NotificationProvider } from './context/NotificationContext';
import { ResultProvider } from './context/ResultContext';
import { Navbar } from './components/layout/navbar';
import { Footer } from './components/layout/footer';
import Home from './pages/Home';
import Login from './pages/login';
import Projects from './pages/projects';
import NewsBoard from './pages/newsboard';
import ResultsPage from './pages/results';
import Profile from './pages/profile';
import ProjectChatPage from './pages/projectChat';
import './styles/globals.css';

type Page = 'home' | 'login' | 'projects' | 'newsboard' | 'results' | 'profile';

const getProjectChatIdFromHash = () => {
  const match = window.location.hash.match(/^#project-chat\/(.+)$/);
  return match?.[1] ?? null;
};

const getProfileIdFromHash = () => {
  const match = window.location.hash.match(/^#profile\/(.+)$/);
  return match?.[1] ?? null;
};

const AppInner: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [projectChatId, setProjectChatId] = useState<string | null>(() => getProjectChatIdFromHash());
  const [profileId, setProfileId] = useState<string | null>(() => getProfileIdFromHash());

  React.useEffect(() => {
    const handleHashChange = () => {
      const chatId = getProjectChatIdFromHash();
      const nextProfileId = getProfileIdFromHash();
      setProjectChatId(chatId);
      setProfileId(nextProfileId);

      if (!chatId && !nextProfileId && window.location.hash === '') {
        setPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (p: string) => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setProjectChatId(null);
      setProfileId(null);
    }

    setPage(p as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (page === 'login') return <Login onNavigate={navigate} />;

  if (projectChatId) {
    return (
      <>
        <Navbar activePage="projects" onNavigate={navigate} />
        <ProjectChatPage projectId={projectChatId} onNavigate={navigate} />
        <Footer />
      </>
    );
  }

  if (profileId) {
    return (
      <>
        <Navbar activePage="profile" onNavigate={navigate} />
        <Profile userId={profileId} />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar activePage={page} onNavigate={navigate} />
      {page === 'home'      && <Home onNavigate={navigate} />}
      {page === 'projects'  && <Projects />}
      {page === 'newsboard' && <NewsBoard />}
      {page === 'results'   && <ResultsPage />}
      {page === 'profile'   && <Profile />}
      <Footer />
    </>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <ProjectProvider>
      <NewsProvider>
        <ResultProvider>
          <NotificationProvider>
            <AppInner />
          </NotificationProvider>
        </ResultProvider>
      </NewsProvider>
    </ProjectProvider>
  </AuthProvider>
);

export default App;
