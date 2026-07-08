import { ref } from 'vue'
const theme = ref<'dark'|'light'>((localStorage.getItem('pgbm_theme') as 'dark'|'light') || 'dark')
function applyTheme(t: string) { document.documentElement.setAttribute('data-theme', t) }
applyTheme(theme.value)
export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('pgbm_theme', theme.value)
    applyTheme(theme.value)
  }
  return { theme, toggleTheme }
}
