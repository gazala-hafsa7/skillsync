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