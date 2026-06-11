import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../api/api';
import { useAuth } from './AuthContext';
import { useNews } from './NewsContext';
import { useProjects } from './ProjectContext';
import { useResults } from './ResultContext';

type NotificationType = 'project-join' | 'project-message' | 'admin-update' | 'result-tag';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  sourceKey: string;
  link?: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  followedAdmins: string[];
  isFollowingAdmin: (adminName: string) => boolean;
  toggleAdminFollow: (adminName: string) => void;
  markAllAsRead: () => void;
  markAsRead: (notificationId: string) => void;
  removeNotification: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const normalizeName = (value: string) => value.trim().toLowerCase();

const createStorageKey = (userId: string, suffix: string) => `skillsync:${userId}:${suffix}`;

const getMessageKey = (message: any, index: number) =>
  `${message.senderId ?? 'unknown'}:${message.createdAt ?? 'unknown'}:${message.text ?? ''}:${index}`;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { news } = useNews();
  const { results } = useResults();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [followedAdmins, setFollowedAdmins] = useState<string[]>([]);
  const memberSnapshotRef = useRef<Record<string, string[]>>({});
  const newsSnapshotRef = useRef<string[]>([]);
  const resultSnapshotRef = useRef<string[]>([]);
  const newsBaselineReadyRef = useRef(false);
  const resultBaselineReadyRef = useRef(false);
  const messageSnapshotRef = useRef<Record<string, Set<string>>>({});

  const isStudent = user?.role === 'student';

  useEffect(() => {
    memberSnapshotRef.current = {};
    newsSnapshotRef.current = [];
    resultSnapshotRef.current = [];
    newsBaselineReadyRef.current = false;
    resultBaselineReadyRef.current = false;
    messageSnapshotRef.current = {};

    if (!user?._id || !isStudent) {
      setNotifications([]);
      setFollowedAdmins([]);
      return;
    }

    try {
      const storedNotifications = localStorage.getItem(createStorageKey(user._id, 'notifications'));
      const storedAdmins = localStorage.getItem(createStorageKey(user._id, 'followed-admins'));
      setNotifications(storedNotifications ? JSON.parse(storedNotifications) : []);
      setFollowedAdmins(storedAdmins ? JSON.parse(storedAdmins) : []);
    } catch {
      setNotifications([]);
      setFollowedAdmins([]);
    }
  }, [user?._id, isStudent]);

  useEffect(() => {
    if (!user?._id || !isStudent) return;
    localStorage.setItem(createStorageKey(user._id, 'notifications'), JSON.stringify(notifications));
  }, [notifications, user?._id, isStudent]);

  useEffect(() => {
    if (!user?._id || !isStudent) return;
    localStorage.setItem(createStorageKey(user._id, 'followed-admins'), JSON.stringify(followedAdmins));
  }, [followedAdmins, user?._id, isStudent]);

  const pushNotification = (item: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) => {
    setNotifications(prev => {
      if (prev.some(notification => notification.sourceKey === item.sourceKey)) {
        return prev;
      }

      return [
        {
          ...item,
          id: `${item.sourceKey}:${Date.now()}`,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ].slice(0, 40);
    });
  };

  useEffect(() => {
    if (!user?._id || !isStudent) return;

    const nextSnapshot: Record<string, string[]> = {};

    projects.forEach(project => {
      const memberIds = (project.members || []).map(member => member.userId).filter(Boolean);
      nextSnapshot[project.id] = memberIds;

      const previousMemberIds = memberSnapshotRef.current[project.id];
      if (!previousMemberIds) {
        return;
      }

      if (project.teamLeadId !== user._id) {
        return;
      }

      const newMembers = (project.members || []).filter(member => !previousMemberIds.includes(member.userId));

      newMembers.forEach(member => {
        pushNotification({
          type: 'project-join',
          title: `${member.name} joined your project`,
          message: `${member.name} joined ${project.title}.`,
          sourceKey: `project-join:${project.id}:${member.userId}`,
          link: 'projects',
        });
      });
    });

    memberSnapshotRef.current = nextSnapshot;
  }, [projects, user?._id, isStudent]);

  useEffect(() => {
    if (!user?._id || !isStudent) return;

    const currentNewsIds = news.map(item => item.id);

    if (!newsBaselineReadyRef.current) {
      newsSnapshotRef.current = currentNewsIds;
      newsBaselineReadyRef.current = true;
      return;
    }

    const previousIds = new Set(newsSnapshotRef.current);
    const followedAdminNames = new Set(followedAdmins.map(normalizeName));

    news.forEach(item => {
      if (previousIds.has(item.id)) {
        return;
      }

      if (!followedAdminNames.has(normalizeName(item.postedBy || ''))) {
        return;
      }

      pushNotification({
        type: 'admin-update',
        title: `${item.postedBy} posted an update`,
        message: item.title,
        sourceKey: `admin-update:${item.id}`,
        link: 'newsboard',
      });
    });

    newsSnapshotRef.current = currentNewsIds;
  }, [news, followedAdmins, user?._id, isStudent]);

  useEffect(() => {
    if (!user?._id || !isStudent) return;

    const taggedResults = results.filter(item => item.taggedStudents.some(student => student.userId === user._id));
    const currentTaggedKeys = taggedResults.map(item => item.id);

    if (!resultBaselineReadyRef.current) {
      resultSnapshotRef.current = currentTaggedKeys;
      resultBaselineReadyRef.current = true;
      return;
    }

    const previousKeys = new Set(resultSnapshotRef.current);

    taggedResults.forEach(item => {
      if (previousKeys.has(item.id)) {
        return;
      }

      pushNotification({
        type: 'result-tag',
        title: 'You were tagged in a result',
        message: item.title,
        sourceKey: `result-tag:${item.id}:${user._id}`,
        link: 'results',
      });
    });

    resultSnapshotRef.current = currentTaggedKeys;
  }, [results, user?._id, isStudent]);

  useEffect(() => {
    if (!user?._id || !isStudent) return;

    const accessibleProjects = projects.filter(project => {
      if (project.teamLeadId === user._id) return true;
      return (project.members || []).some(member => member.userId === user._id);
    });

    if (accessibleProjects.length === 0) {
      messageSnapshotRef.current = {};
      return;
    }

    let active = true;

    const loadMessages = async () => {
      const responses = await Promise.all(
        accessibleProjects.map(async project => ({
          project,
          messages: await api.getProjectMessages(project.id),
        }))
      );

      if (!active) return;

      responses.forEach(({ project, messages }) => {
        if (!Array.isArray(messages)) {
          return;
        }

        const nextKeys = new Set(messages.map((message, index) => getMessageKey(message, index)));
        const previousKeys = messageSnapshotRef.current[project.id];

        if (!previousKeys) {
          messageSnapshotRef.current[project.id] = nextKeys;
          return;
        }

        messages.forEach((message, index) => {
          const messageKey = getMessageKey(message, index);
          if (previousKeys.has(messageKey) || message.senderId === user._id) {
            return;
          }

          pushNotification({
            type: 'project-message',
            title: `New message in ${project.title}`,
            message: `${message.senderName}: ${message.text}`,
            sourceKey: `project-message:${project.id}:${messageKey}`,
            link: `project-chat/${project.id}`,
          });
        });

        messageSnapshotRef.current[project.id] = nextKeys;
      });
    };

    void loadMessages();
    const intervalId = window.setInterval(() => {
      void loadMessages();
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [projects, user?._id, isStudent]);

  const toggleAdminFollow = (adminName: string) => {
    if (!isStudent) return;

    const normalizedName = normalizeName(adminName);
    if (!normalizedName) return;

    setFollowedAdmins(prev => {
      const exists = prev.some(item => normalizeName(item) === normalizedName);
      if (exists) {
        return prev.filter(item => normalizeName(item) !== normalizedName);
      }

      return [...prev, adminName.trim()];
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, read: true })));
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(item => (item.id === notificationId ? { ...item, read: true } : item)));
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(item => item.id !== notificationId));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: notifications.filter(item => !item.read).length,
        followedAdmins,
        isFollowingAdmin: (adminName: string) => followedAdmins.some(item => normalizeName(item) === normalizeName(adminName)),
        toggleAdminFollow,
        markAllAsRead,
        markAsRead,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
