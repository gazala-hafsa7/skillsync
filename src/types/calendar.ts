export interface ProjectCalendarItem {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  createdAt: string;
  createdById: string;
  createdByName: string;
}

export interface PersonalCalendarItem {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  createdAt?: string;
  sourceType: 'custom' | 'project' | 'news';
  sourceId?: string;
  sourceLabel?: string;
  projectId?: string;
  projectTitle?: string;
  link?: string;
}
