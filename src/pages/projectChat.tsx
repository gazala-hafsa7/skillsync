import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { ProjectChatView } from '../components/project/ProjectChatView';
import { ProjectCalendarPanel } from '../components/project/ProjectCalendarPanel';
import type { ProjectMember } from '../context/ProjectContext';

const normalizeMembers = (members: any[]): ProjectMember[] =>
  (members || []).map(member =>
    typeof member === 'string'
      ? { userId: member, name: 'Member', email: '' }
      : member
  );

interface ProjectChatPageProps {
  projectId: string;
  onNavigate?: (page: string) => void;
}

const ProjectChatPage: React.FC<ProjectChatPageProps> = ({ projectId, onNavigate }) => {
  const { projects, addProjectCalendarItem } = useProjects();
  const { user } = useAuth();

  const project = projects.find(item => item.id === projectId);

  if (!project) {
    return (
      <main style={{ minHeight: '100vh', padding: '60px 40px' }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Project chat not found</h1>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>This project could not be loaded in the current tab.</p>
          <button
            type="button"
            onClick={() => onNavigate?.('projects')}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f3f4f6', padding: '10px 16px', cursor: 'pointer' }}
          >
            Back to Projects
          </button>
        </div>
      </main>
    );
  }

  const members = normalizeMembers(project.members);
  const isOwner = user?._id === project.teamLeadId;
  const isMember = members.some(member => member.userId === user?._id);

  if (!isOwner && !isMember) {
    return (
      <main style={{ minHeight: '100vh', padding: '60px 40px' }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Chat access restricted</h1>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Only the team lead and joined members can use this project chat.</p>
          <button
            type="button"
            onClick={() => onNavigate?.('projects')}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f3f4f6', padding: '10px 16px', cursor: 'pointer' }}
          >
            Back to Projects
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', padding: '60px 40px' }}>
      <div className="container" style={{ maxWidth: 1100, padding: 0 }}>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 6 }}>Project Chat</h1>
            <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>{project.title}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('projects')}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f3f4f6', padding: '10px 16px', cursor: 'pointer' }}
          >
            Back to Projects
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, alignItems: 'start' }}>
          <ProjectCalendarPanel
            items={project.calendarItems || []}
            onAddItem={item => addProjectCalendarItem(project.id, item)}
          />

          <ProjectChatView
            projectId={project.id}
            projectTitle={project.title}
            currentUserId={user?._id ?? ''}
            mode="page"
          />
        </div>
      </div>
    </main>
  );
};

export default ProjectChatPage;
