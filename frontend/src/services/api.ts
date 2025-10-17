import axios from 'axios';

// API base URL - backend FastAPI server
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API service functions
export const projectsApi = {
  // Get all projects
  getProjects: async (params?: { skip?: number; limit?: number; status?: string }) => {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  },

  // Get project details with knowledge graph
  getProject: async (projectId: string) => {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  },

  // Get project prompts
  getProjectPrompts: async (projectId: string, limit: number = 50) => {
    const response = await apiClient.get(`/projects/${projectId}/prompts`, {
      params: { limit },
    });
    return response.data;
  },

  // Create new project
  createProject: async (projectData: any) => {
    const response = await apiClient.post('/projects', projectData);
    return response.data;
  },

  // Update project
  updateProject: async (projectId: string, projectData: any) => {
    const response = await apiClient.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId: string) => {
    await apiClient.delete(`/projects/${projectId}`);
  },
};

export const citationsApi = {
  // Get recent citations
  getRecentCitations: async (limit: number = 10) => {
    const response = await apiClient.get('/citations/recent', {
      params: { limit },
    });
    return response.data;
  },

  // Get citations for a specific project
  getProjectCitations: async (projectId: string, limit: number = 50) => {
    const response = await apiClient.get(`/projects/${projectId}/citations`, {
      params: { limit },
    });
    return response.data;
  },
};

export const statsApi = {
  // Get overview statistics
  getOverview: async () => {
    const response = await apiClient.get('/stats/overview');
    return response.data;
  },
};

// Authentication API interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
}

// Authentication API
export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user info
  getCurrentUser: async (token: string): Promise<UserResponse> => {
    const response = await apiClient.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Verify token
  verifyToken: async (token: string): Promise<boolean> => {
    try {
      await apiClient.post('/auth/verify', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch {
      return false;
    }
  },

  // Logout
  logout: async (token: string): Promise<void> => {
    await apiClient.post('/auth/logout', null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// Set default authorization header
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient;
