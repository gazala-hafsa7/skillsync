import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from "../api/api";
import type { ProjectCalendarItem } from '../types/calendar';
export type ProjectStatus = 'open' | 'in-progress' | 'completed';

export interface ProjectMember {
  userId: string;
  name: string;
  email?: string;
}

export interface MentorRequest {
  mentorId: string;
  mentorName: string;
  mentorEmail?: string;
  message: string;
  accepted?: boolean;
  reply?: string;
  requestedAt?: string;
  acceptedAt?: string;
  repliedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  domain: string;
  teamLead: string;
  teamLeadId: string;
  needsMentor: boolean;
  maxTeamSize: number;
  members: ProjectMember[];
  mentorRequests: MentorRequest[];
  tags: string[];
  status: ProjectStatus;
  createdAt: string;
  calendarItems: ProjectCalendarItem[];
}

export interface ProjectUpdateInput {
  title: string;
  description: string;
  domain: string;
  needsMentor: boolean;
  maxTeamSize: number;
  tags: string[];
  status: ProjectStatus;
}

interface ProjectContextType {
  projects: Project[];
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'members' | 'calendarItems' | 'mentorRequests'>) => void;
  updateProject: (projectId: string, project: ProjectUpdateInput) => Promise<any>;
  joinProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  addProjectCalendarItem: (projectId: string, item: { title: string; description: string; eventDate: string }) => Promise<any>;
  sendMentorRequest: (projectId: string, message: string) => Promise<any>;
  acceptMentorRequest: (projectId: string, mentorId: string) => Promise<any>;
  replyToMentorRequest: (projectId: string, mentorId: string, reply: string) => Promise<any>;
}

const normalizeProject = (p: any): Project => ({
  ...p,
  needsMentor: Boolean(p.needsMentor),
  members: (p.members || []).map((member: any) =>
    typeof member === 'string'
      ? { userId: member, name: 'Member', email: '' }
      : member
  ),
  mentorRequests: (p.mentorRequests || []).map((item: any) => ({
    ...item,
    mentorId: item.mentorId,
  })),
  calendarItems: (p.calendarItems || []).map((item: any) => ({
    ...item,
    id: item._id || item.id,
  })),
  id: p._id || p.id,
});

const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    const loadProjects = async () => {
      const data = await api.getProjects();

      const formatted = data.map((p: any) => normalizeProject(p));

      setProjects(formatted);
  };

     loadProjects();
}, []);
  const addProject = async (project: any) => {
  const newProject = await api.createProject(project);
  setProjects(prev => [...prev, normalizeProject(newProject)]);
  };

  const updateProject = async (projectId: string, project: ProjectUpdateInput) => {
    const updatedProject = await api.updateProject(projectId, project);

    if (updatedProject?._id || updatedProject?.id) {
      setProjects(prev => prev.map(item => (item.id === projectId ? normalizeProject(updatedProject) : item)));
    }

    return updatedProject;
  };

  const joinProject = async (projectId: string) => {
    const data = await api.joinProject(projectId);

    setProjects(prev =>
      prev.map(p => (
        p.id === projectId
          ? normalizeProject(data)
          : p
      ))
    );
  };

  const deleteProject = async (projectId: string) => {
    await api.deleteProject(projectId);

    setProjects(prev =>
      prev.filter(p => p.id !== projectId)
   );
  };

  const addProjectCalendarItem = async (projectId: string, item: { title: string; description: string; eventDate: string }) => {
    const data = await api.addProjectCalendarItem(projectId, item);

    if (Array.isArray(data)) {
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId
            ? {
                ...project,
                calendarItems: data,
              }
            : project
        )
      );
    }

    return data;
  };

  const sendMentorRequest = async (projectId: string, message: string) => {
    const data = await api.sendMentorRequest(projectId, message);

    if (data?._id || data?.id) {
      setProjects(prev => prev.map(project => (project.id === projectId ? normalizeProject(data) : project)));
    }

    return data;
  };

  const acceptMentorRequest = async (projectId: string, mentorId: string) => {
    const data = await api.acceptMentorRequest(projectId, mentorId);

    if (data?._id || data?.id) {
      setProjects(prev => prev.map(project => (project.id === projectId ? normalizeProject(data) : project)));
    }

    return data;
  };

  const replyToMentorRequest = async (projectId: string, mentorId: string, reply: string) => {
    const data = await api.replyToMentorRequest(projectId, mentorId, reply);

    if (data?._id || data?.id) {
      setProjects(prev => prev.map(project => (project.id === projectId ? normalizeProject(data) : project)));
    }

    return data;
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProject, joinProject, deleteProject, addProjectCalendarItem, sendMentorRequest, acceptMentorRequest, replyToMentorRequest }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
};
