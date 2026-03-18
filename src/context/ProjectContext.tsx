import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from "../api/api";
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
  joinProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    const loadProjects = async () => {
      const data = await api.getProjects();

      const formatted = data.map((p: any) => ({
        ...p,
        id: p._id
      }));

      setProjects(formatted);
  };

     loadProjects();
}, []);
  const addProject = async (project: any) => {
  const newProject = await api.createProject(project);
  setProjects(prev => [...prev, newProject]);
  };

  const joinProject = async (projectId: string) => {
   const data = await api.joinProject(projectId);

    setProjects(prev =>
      prev.map(p => (p.id === projectId ? data : p))
    );
  };

  const deleteProject = async (projectId: string) => {
    await api.deleteProject(projectId);

    setProjects(prev =>
      prev.filter(p => p.id !== projectId)
   );
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