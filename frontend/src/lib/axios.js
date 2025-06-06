import axios from "axios"

export const  axiosInstance = axios.create({
    baseURL:import.meta.env.VITE_BACKEND_CORS,
    withCredentials:true
})

axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );