import React, { createContext, useContext, useState } from 'react';

export type ProjectStatus = 'open' | 'in-progress' | 'completed';

export interface Project {
  id: string;
  title: string;
  description: string;
  domain: string;
  teamLead: string;
  teamLeadId: string;
  maxTeamSize: number;
  members: { id: string; name: string }[];
  tags: string[];
  status: ProjectStatus;
  createdAt: string;
}

interface ProjectContextType {
  projects: Project[];
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'members'>) => void;
  joinProject: (projectId: string, userId: string, userName: string) => void;
  deleteProject: (projectId: string, userId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  const addProject = (p: Omit<Project, 'id' | 'createdAt' | 'members'>) => {
    setProjects(prev => [{
      ...p,
      id: Date.now().toString(),
      createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      members: [{ id: p.teamLeadId, name: p.teamLead }],
    }, ...prev]);
  };

  const joinProject = (projectId: string, userId: string, userName: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId && !p.members.find(m => m.id === userId)
        ? { ...p, members: [...p.members, { id: userId, name: userName }] }
        : p
    ));
  };

  const deleteProject = (projectId: string, userId: string) => {
    setProjects(prev => prev.filter(p => !(p.id === projectId && p.teamLeadId === userId)));
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, joinProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
};