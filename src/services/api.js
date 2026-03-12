import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const expenseAPI = {
  getAll: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  }
};

export const categoryAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};

export const incomeAPI = {
  getAll: async () => {
    const response = await api.get('/income');
    return response.data;
  }
};

export default api;