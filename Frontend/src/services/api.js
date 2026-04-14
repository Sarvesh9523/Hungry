import axios from 'axios';

const api = axios.create({
  baseURL: '',
  withCredentials: true // ✅ sends cookie automatically on every request
});

// Attach access token — unchanged
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ✅ refreshToken no longer read from localStorage — cookie is sent automatically
api.interceptors.response.use((response) => response, async (error) => {
  const originalRequest = error.config;
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    try {
      const res = await axios.post(
        `/api/auth/refresh`,
        {}, // empty body — refreshToken comes from cookie
        { withCredentials: true }
      );

      const newToken = res.data.token;
      localStorage.setItem('token', newToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return api(originalRequest);
    } catch (err) {
      localStorage.removeItem('token'); // ✅ only token to remove — no refreshToken in localStorage anymore
      window.location.href = '/user/login';
    }
  }
  return Promise.reject(error);
});

export default api;