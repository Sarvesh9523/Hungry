import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.BACKEND_URL
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor to handle token expiry
api.interceptors.response.use((response) => response, async (error) => {
  const originalRequest = error.config;
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`, { refreshToken });
        const newToken = res.data.token;
        const newRefreshToken = res.data.refreshToken;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update original request auth header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (err) {
        // Refresh token is invalid/expired
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/user/login';
      }
    }
  }
  return Promise.reject(error);
});

export default api;
