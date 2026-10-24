import axios from 'axios'
import type { RowsResponse, StatusResponse, VersionResponse, ActionResponse, RawConfigResponse, ServersListResponse, BrandingConfig } from '../types/api'
const http = axios.create({ baseURL: '/api', timeout: 10000 })
http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('pgbm_token')
  if (token && cfg.headers) cfg.headers['Authorization'] = `Bearer ${token}`
  return cfg
})
http.interceptors.response.use(r => r, err => {
  const msg = err?.response?.data?.error || err.message || 'Request failed'
  return Promise.reject(new Error(msg))
})
const q = (server: string) => ({ params: { server } })
export const api = {
  login: (username: string, password: string) =>
    http.post<{token:string;username:string;role:string}>('/auth/login', {username, password}).then(r => r.data),
  logout: () => http.post('/auth/logout').then(r => r.data),
  me: () => http.get<{username:string;role:string}>('/auth/me').then(r => r.data),
  changePassword: (old_password: string, new_password: string) =>
    http.post<ActionResponse>('/auth/change-password', {old_password, new_password}).then(r => r.data),
  listServers: () => http.get<ServersListResponse>('/servers-list').then(r => r.data),
  listUsers: () => http.get<{users:any[]}>('/users').then(r => r.data),
  createUser: (username: string, password: string, role: string) =>
    http.post<ActionResponse>('/users', {username, password, role}).then(r => r.data),
  updateUser: (username: string, data: {role?:string;password?:string}) =>
    http.put<ActionResponse>(`/users/${username}`, data).then(r => r.data),
  deleteUser: (username: string) => http.delete<ActionResponse>(`/users/${username}`).then(r => r.data),
  listAudit: (limit=200) => http.get<{entries:any[]}>(`/audit?limit=${limit}`).then(r => r.data),
  downloadBackup: () => http.get('/backup', {responseType:'blob'}).then(r => r),
  restoreBackup: (file: File) => {
    const fd = new FormData(); fd.append('backup', file)
    return http.post<ActionResponse>('/restore', fd).then(r => r.data)
  },
  getAlerts: () => http.get<any>('/alerts').then(r => r.data),
  getBranding: () => http.get<BrandingConfig>('/branding').then(r => r.data),
  setBranding: (data: {company_name:string;app_name:string;app_sub:string}) =>
    http.put<ActionResponse>('/branding', data).then(r => r.data),
  uploadBrandingLogo: (file: File) => {
    const fd = new FormData(); fd.append('logo', file)
    return http.post<ActionResponse>('/branding/logo', fd).then(r => r.data)
  },
  resetBrandingLogo: () => http.delete<ActionResponse>('/branding/logo').then(r => r.data),
  getSSHPubKey: () => http.get<{public_key:string;key_path:string}>('/ssh-pubkey').then(r => r.data),
  setAlerts: (cfg: any) => http.put<ActionResponse>('/alerts', cfg).then(r => r.data),
  getServiceStatus: (s:string) => http.get<StatusResponse>('/status', q(s)).then(r => r.data),
  getPools:     (s:string) => http.get<RowsResponse>('/pools', q(s)).then(r => r.data),
  getClients:   (s:string) => http.get<RowsResponse>('/clients', q(s)).then(r => r.data),
  getServers:   (s:string) => http.get<RowsResponse>('/servers', q(s)).then(r => r.data),
  getStats:     (s:string) => http.get<RowsResponse>('/stats', q(s)).then(r => r.data),
  getDatabases: (s:string) => http.get<RowsResponse>('/databases', q(s)).then(r => r.data),
  getConfig:    (s:string) => http.get<RowsResponse>('/config', q(s)).then(r => r.data),
  getLists:     (s:string) => http.get<RowsResponse>('/lists', q(s)).then(r => r.data),
  getVersion:   (s:string) => http.get<VersionResponse>('/version', q(s)).then(r => r.data),
  startService:   (s:string) => http.post<ActionResponse>('/service/start',{},q(s)).then(r=>r.data),
  stopService:    (s:string) => http.post<ActionResponse>('/service/stop',{},q(s)).then(r=>r.data),
  restartService: (s:string) => http.post<ActionResponse>('/service/restart',{},q(s)).then(r=>r.data),
  reload: (s:string) => http.post<ActionResponse>('/admin/reload',{},q(s)).then(r=>r.data),
  pause:  (s:string, db?:string) => http.post<ActionResponse>('/admin/pause',{database:db||''},q(s)).then(r=>r.data),
  resume: (s:string, db?:string) => http.post<ActionResponse>('/admin/resume',{database:db||''},q(s)).then(r=>r.data),
  kill:   (s:string, db:string) => http.post<ActionResponse>('/admin/kill',{database:db},q(s)).then(r=>r.data),
  setParam: (s:string, key:string, value:string) => http.post<ActionResponse>('/admin/set',{key,value},q(s)).then(r=>r.data),
  getRawConfig: (s:string) => http.get<RawConfigResponse>('/config-edit/raw',q(s)).then(r=>r.data),
  setDatabaseField: (s:string,database:string,field:string,value:string) =>
    http.post<ActionResponse>('/config-edit/database-field',{database,field,value},q(s)).then(r=>r.data),
  setGlobalField: (s:string,field:string,value:string) =>
    http.post<ActionResponse>('/config-edit/global-field',{field,value},q(s)).then(r=>r.data),
}
export interface ServerForm {
  id:string;label:string;admin_host:string;admin_port:string;admin_user:string;admin_pass:string
  ini_path:string;service_name:string;control_mode:string;ssh_host:string;ssh_port:string
  ssh_user:string;ssh_key_path:string;ssh_use_sudo:boolean
}
export const serverApi = {
  addServer:    (form:ServerForm) => http.post<ActionResponse>('/servers',form).then(r=>r.data),
  updateServer: (id:string, form:Partial<ServerForm>) => http.put<ActionResponse>(`/servers/${id}`,form).then(r=>r.data),
  deleteServer: (id:string) => http.delete<ActionResponse>(`/servers/${id}`).then(r=>r.data),
  testServer:   (id:string) => http.post<{ok:boolean;version?:string;error?:string}>(`/servers/${id}/test`).then(r=>r.data),
}
