import * as SecureStore from 'expo-secure-store'

export const getToken = async () => SecureStore.getItemAsync('td_token')
export const getUser = async () => {
  const u = await SecureStore.getItemAsync('td_user')
  return u ? JSON.parse(u) : null
}
export const setAuth = async (token: string, user: any) => {
  await SecureStore.setItemAsync('td_token', token)
  await SecureStore.setItemAsync('td_user', JSON.stringify(user))
}
export const clearAuth = async () => {
  await SecureStore.deleteItemAsync('td_token')
  await SecureStore.deleteItemAsync('td_user')
}
