import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://172.20.10.11:3001',
})

// ✅ automatski dodaj token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default boot(({ app }) => {
  app.config.globalProperties.$api = api
})

export { api }
