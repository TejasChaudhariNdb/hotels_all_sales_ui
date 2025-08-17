import axios from 'axios'

// Create base axios instance
const api = axios.create({
  // baseURL:"http://localhost:8000/api",
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

// Interceptor to add token if available
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Generic GET
export const makeGet = async (url, params = {}) => {
  const response = await api.get(url, { params })
  return response.data
}

// Generic POST
export const makePost = async (url, data = {}) => {
  const response = await api.post(url, data)
  return response.data
}

// Generic DELETE
export const makeDelete = async (url, params = {}) => {
  const response = await api.delete(url, { params });
  return response.data;
};

// Generic PUT
export const makePut = async (url, data = {}) => {
  const response = await api.put(url, data)
  return response.data
}
