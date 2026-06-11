export const api = {
  login: async (email: string, password: string) => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    return res.json();
  },

  register: async (userData: any) => {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
       "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

     return res.json();
   },
  createProject: async (projectData: any) => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });

    return res.json();
  },

  updateProject: async (projectId: string, projectData: any) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });

    return res.json();
  },

  getProjects: async () => {
    const res = await fetch("http://localhost:5000/api/projects");
    return res.json();
  },

  joinProject: async (projectId: string) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:5000/api/projects/${projectId}/join`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
},

  sendMentorRequest: async (projectId: string, message: string) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/projects/${projectId}/mentor-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    return res.json();
  },

  acceptMentorRequest: async (projectId: string, mentorId: string) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/projects/${projectId}/mentor-request/${mentorId}/accept`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  },

  replyToMentorRequest: async (projectId: string, mentorId: string, reply: string) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/projects/${projectId}/mentor-request/${mentorId}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reply }),
    });

    return res.json();
  },

  getProjectMessages: async (projectId: string) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/projects/${projectId}/chat`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  },

  sendProjectMessage: async (projectId: string, text: string) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/projects/${projectId}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

  return res.json();
  },

  getProjectCalendar: async (projectId: string) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/projects/${projectId}/calendar`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  },

  addProjectCalendarItem: async (projectId: string, itemData: any) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/projects/${projectId}/calendar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(itemData),
    });

    return res.json();
  },

  getMyProfile: async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  },

  updateMyProfile: async (profileData: any) => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    return res.json();
  },

  getUserProfile: async (userId: string) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  },

  listUsers: async (role?: string) => {
    const token = localStorage.getItem("token");
    const query = role ? `?role=${encodeURIComponent(role)}` : "";

    const res = await fetch(`http://localhost:5000/api/users${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  },

  getNews: async () => {
    const res = await fetch("http://localhost:5000/api/news");
    return res.json();
  },

  createNews: async (newsData: any) => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/news", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newsData),
    });

    return res.json();
  },

  updateNews: async (newsId: string, newsData: any) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/news/${newsId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newsData),
    });

    return res.json();
  },

  deleteNews: async (newsId: string) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/news/${newsId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  },

  getResults: async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/results", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  },

  createResult: async (resultData: any) => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(resultData),
    });

    return res.json();
  },

  deleteResult: async (resultId: string) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/results/${resultId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  },
  
  deleteProject: async (projectId: string) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
},
};
