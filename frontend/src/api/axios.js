import axios from 'axios'

const API = axios.create({
  baseURL: '/api'
})

API.interceptors.request.use((req) => {
  const user = localStorage.getItem('insightUser')
  if (user) {
    req.headers.Authorization = `Bearer ${JSON.parse(user).token}`
  }
  return req
})

export default API