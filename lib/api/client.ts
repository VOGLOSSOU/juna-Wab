import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/lib/store/auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://juna-app.up.railway.app/api/v1'
const publicAuthPaths = new Set(['/auth/login', '/auth/register', '/auth/refresh',
  '/auth/send-verification-code', '/auth/verify-code', '/auth/forgot-password', '/auth/reset-password', '/auth/logout'])
type RequestConfig = InternalAxiosRequestConfig & { _retry?: boolean; _authRevision?: number }
const pathOf = (url?: string) => (url ?? '').split('?')[0].replace(/\/$/, '')
const token = (key: string) => typeof window === 'undefined' ? null : localStorage.getItem(key)

export const apiClient = axios.create({ baseURL: BASE_URL, timeout: 15000,
  headers: { 'Content-Type': 'application/json' }, withCredentials: false })
apiClient.interceptors.request.use((config: RequestConfig) => {
  const access = token('accessToken')
  config._authRevision = useAuthStore.getState().authRevision
  if (access && !publicAuthPaths.has(pathOf(config.url))) config.headers.Authorization = `Bearer ${access}`
  else delete config.headers.Authorization
  return config
})

let refreshing: { revision: number; access: string; refresh: string; promise: Promise<string> } | null = null
async function refreshAccess(access: string, refresh: string, revision: number): Promise<string> {
  const unchanged = () => useAuthStore.getState().authRevision === revision &&
    token('accessToken') === access && token('refreshToken') === refresh
  try {
    const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh }, { timeout: 15000 })
    if (!unchanged()) throw new Error('Session modifiée pendant la vérification.')
    const nextAccess: unknown = data?.data?.accessToken
    const nextRefresh: unknown = data?.data?.refreshToken ?? refresh
    if (typeof nextAccess !== 'string' || !nextAccess || typeof nextRefresh !== 'string' || !nextRefresh) {
      throw new Error('Le service de connexion est momentanément indisponible.')
    }
    useAuthStore.getState().setTokens(nextAccess, nextRefresh)
    return nextAccess
  } catch (error) {
    const status = (error as AxiosError)?.response?.status
    // Never expire a visitor, a newer account, or a session on network/5xx errors.
    if (unchanged() && (status === 401 || status === 403)) useAuthStore.getState().expireSession()
    throw error
  }
}

apiClient.interceptors.response.use(response => response, async (error: AxiosError) => {
  const original = error.config as RequestConfig | undefined
  if (!original || error.response?.status !== 401 || original._retry ||
      publicAuthPaths.has(pathOf(original.url)) || !original.headers.Authorization) return Promise.reject(error)
  const state = useAuthStore.getState()
  if (original._authRevision !== state.authRevision) return Promise.reject(error)
  const access = token('accessToken')
  if (!access) return Promise.reject(error)
  original._retry = true
  // A parallel request may have already refreshed this same session.
  if (original.headers.Authorization !== `Bearer ${access}`) return apiClient(original)
  const refresh = token('refreshToken')
  if (!refresh) {
    state.expireSession()
    return Promise.reject(error)
  }
  if (!refreshing || refreshing.revision !== state.authRevision || refreshing.access !== access || refreshing.refresh !== refresh) {
    const request = { revision: state.authRevision, access, refresh,
      promise: refreshAccess(access, refresh, state.authRevision) }
    refreshing = request
    void request.promise.finally(() => { if (refreshing === request) refreshing = null }).catch(() => {})
  }
  try {
    const revision = state.authRevision
    const newAccess = await refreshing.promise
    if (useAuthStore.getState().authRevision !== revision || token('accessToken') !== newAccess) return Promise.reject(error)
    original.headers.Authorization = `Bearer ${newAccess}`
    return apiClient(original)
  } catch (refreshError) { return Promise.reject(refreshError) }
})
