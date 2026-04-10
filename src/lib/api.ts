import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('td_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('td_token')
      await SecureStore.deleteItemAsync('td_user')
    }
    return Promise.reject(err)
  }
)

export default api
export { API_URL }
