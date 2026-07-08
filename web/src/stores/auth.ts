import { ref, computed } from 'vue'
import axios from 'axios'
const token = ref<string>(localStorage.getItem('pgbm_token') || '')
const username = ref<string>(localStorage.getItem('pgbm_username') || '')
const role = ref<string>(localStorage.getItem('pgbm_role') || '')
if (token.value) axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
export function useAuthStore() {
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 'admin')
  function setAuth(t: string, u: string, r: string) {
    token.value=t; username.value=u; role.value=r
    localStorage.setItem('pgbm_token',t); localStorage.setItem('pgbm_username',u); localStorage.setItem('pgbm_role',r)
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
  }
  function clearAuth() {
    token.value=''; username.value=''; role.value=''
    localStorage.removeItem('pgbm_token'); localStorage.removeItem('pgbm_username'); localStorage.removeItem('pgbm_role')
    delete axios.defaults.headers.common['Authorization']
  }
  return { token, username, role, isLoggedIn, isAdmin, setAuth, clearAuth }
}
