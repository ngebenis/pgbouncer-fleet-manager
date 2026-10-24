<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from './composables/api'
import { useServerStore } from './stores/server'
import { useAuthStore } from './stores/auth'
import { useTheme } from './stores/theme'
import { useBranding } from './stores/branding'
import { useToast } from './composables/useToast'
import { useI18n, LOCALES } from './i18n'
import Toast from './components/Toast.vue'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import PoolsView from './views/PoolsView.vue'
import ClientsView from './views/ClientsView.vue'
import ServersView from './views/ServersView.vue'
import StatsView from './views/StatsView.vue'
import DatabasesView from './views/DatabasesView.vue'
import ConfigView from './views/ConfigView.vue'
import ManageServersView from './views/ManageServersView.vue'
import UsersView from './views/UsersView.vue'
import AuditLogView from './views/AuditLogView.vue'
import BackupView from './views/BackupView.vue'
import BrandingView from './views/BrandingView.vue'

const store = useServerStore()
const auth = useAuthStore()
const { theme, toggleTheme } = useTheme()
const toast = useToast()
const { t, locale, setLocale } = useI18n()
const { branding, logoUrl, loadBranding } = useBranding()

type Page = 'dashboard'|'pools'|'clients'|'servers'|'stats'|'databases'|'config'|'manage-servers'|'users'|'audit'|'backup'|'branding'
const page = ref<Page>('dashboard')
const showProfileMenu = ref(false)
const showChangePass = ref(false)
const showLangMenu = ref(false)
const activeLocale = computed(() => LOCALES.find(l => l.code === locale.value) ?? LOCALES[0])
function chooseLocale(code: typeof LOCALES[number]['code']) { setLocale(code); showLangMenu.value = false }
const cpOld = ref(''); const cpNew = ref(''); const cpBusy = ref(false)

const nav = computed(() => [
  { id: 'dashboard' as Page, label: t('dashboard') },
  { id: 'pools' as Page, label: t('pools') },
  { id: 'clients' as Page, label: t('clients') },
  { id: 'servers' as Page, label: t('servers') },
  { id: 'stats' as Page, label: t('stats') },
  { id: 'databases' as Page, label: t('databases') },
  { id: 'config' as Page, label: t('configuration') },
])
const adminNav = computed(() => [
  { id: 'manage-servers' as Page, label: t('manage_servers') },
  { id: 'users' as Page, label: t('users') },
  { id: 'audit' as Page, label: t('audit_log') },
  { id: 'backup' as Page, label: t('backup') },
  { id: 'branding' as Page, label: t('branding') },
])

async function loadServers() {
  try { const res = await api.listServers(); store.setServers(res.servers) }
  catch(e) { if ((e as Error).message?.includes('401')) auth.clearAuth() }
}
onMounted(async () => { if (auth.isLoggedIn.value) await loadServers() })
async function onLoggedIn() { await loadServers() }
async function logout() {
  try { await api.logout() } catch {}
  auth.clearAuth(); showProfileMenu.value = false
}
async function changePassword() {
  if (!cpOld.value || !cpNew.value) {
    toast.warn('Old password dan new password wajib diisi')
    return
  }
  if (cpNew.value.length < 4) {
    toast.warn('Password minimal 4 karakter')
    return
  }
  cpBusy.value = true
  try {
    await api.changePassword(cpOld.value, cpNew.value)
    toast.success(t('password_changed'))
    showChangePass.value = false
    cpOld.value = ''
    cpNew.value = ''
  } catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { cpBusy.value = false }
}
const activeServer = computed(() => store.activeServer.value)
const pageTitle = computed(() => [...nav.value, ...adminNav.value].find(n => n.id === page.value)?.label ?? '')
</script>

<template>
  <div>
    <LoginView v-if="!auth.isLoggedIn.value" @logged-in="onLoggedIn" />
    <div v-else class="layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <img v-if="logoUrl" :src="logoUrl" alt="logo" class="brand-logo-img" />
          <span v-else class="brand-icon">◈</span>
          <div><div class="brand-name">{{ branding.app_name }}</div><div class="brand-sub">{{ branding.app_sub }}</div></div>
        </div>
        <div class="server-section">
          <div class="section-label">Server</div>
          <div v-for="s in store.servers.value" :key="s.id"
            class="server-item" :class="{ active: store.activeId.value === s.id }"
            @click="store.setActive(s.id)">
            <span class="dot dot-ok" style="width:6px;height:6px;flex-shrink:0"></span>
            <div><div class="server-label">{{ s.label }}</div><div class="server-host">{{ s.host }}:{{ s.port }}</div></div>
          </div>
        </div>
        <hr class="sidebar-divider" />
        <nav class="sidebar-nav">
          <div class="section-label">Menu</div>
          <template v-for="item in nav" :key="item.id">
            <button class="nav-item" :class="{ active: page === item.id }" @click="page = item.id">{{ item.label }}</button>
          </template>
          <template v-if="auth.isAdmin.value">
            <div class="section-label" style="margin-top:.75rem">Admin</div>
            <template v-for="item in adminNav" :key="item.id">
              <button class="nav-item" :class="{ active: page === item.id }" @click="page = item.id">{{ item.label }}</button>
            </template>
          </template>
        </nav>
        <div v-if="branding.company_name" class="sidebar-footer"><span class="muted" style="font-size:.68rem">{{ branding.company_name }}</span></div>
      </aside>
      <div class="main-wrap">
        <header class="topbar">
          <div>
            <h1 class="topbar-title">{{ pageTitle }}</h1>
            <p v-if="activeServer" class="topbar-sub">{{ activeServer.label }} · {{ activeServer.host }}:{{ activeServer.port }}</p>
          </div>
          <div class="topbar-actions">
            <div class="user-menu-wrap">
              <button class="btn btn-xs btn-neutral" @click="showLangMenu = !showLangMenu; showProfileMenu = false">{{ activeLocale.flag }} {{ activeLocale.code.toUpperCase() }}</button>
              <div v-if="showLangMenu" class="user-dropdown lang-dropdown">
                <button v-for="l in LOCALES" :key="l.code" class="dropdown-item"
                  :class="{active: l.code === locale}" @click="chooseLocale(l.code)">{{ l.flag }} {{ l.label }}</button>
              </div>
            </div>
            <button class="btn btn-xs btn-neutral" @click="toggleTheme">{{ theme === 'dark' ? '☀' : '🌙' }}</button>
            <div class="user-menu-wrap">
              <button class="btn btn-xs btn-neutral" @click="showProfileMenu = !showProfileMenu; showLangMenu = false">
                👤 {{ auth.username.value }}
                <span class="badge" :class="auth.role.value==='admin'?'badge-ok':'badge-neutral'" style="margin-left:.3rem">{{ auth.role.value }}</span>
              </button>
              <div v-if="showProfileMenu" class="user-dropdown">
                <button class="dropdown-item" @click="showChangePass=true;showProfileMenu=false">🔑 {{ t('change_password') }}</button>
                <hr style="border-color:var(--border);margin:.25rem 0" />
                <button class="dropdown-item danger" @click="logout">⏏ {{ t('logout') }}</button>
              </div>
            </div>
          </div>
        </header>
        <main class="content">
          <DashboardView     v-if="page==='dashboard'" />
          <PoolsView         v-else-if="page==='pools'" />
          <ClientsView       v-else-if="page==='clients'" />
          <ServersView       v-else-if="page==='servers'" />
          <StatsView         v-else-if="page==='stats'" />
          <DatabasesView     v-else-if="page==='databases'" />
          <ConfigView        v-else-if="page==='config'" />
          <ManageServersView v-else-if="page==='manage-servers'" />
          <UsersView         v-else-if="page==='users'" />
          <AuditLogView      v-else-if="page==='audit'" />
          <BackupView        v-else-if="page==='backup'" />
          <BrandingView      v-else-if="page==='branding'" @saved="loadBranding" />
        </main>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showChangePass" class="modal-backdrop" @click.self="showChangePass=false">
        <div class="modal">
          <div class="modal-header"><h2>{{ t('change_password') }}</h2><button class="btn btn-xs btn-neutral" @click="showChangePass=false">✕</button></div>
          <div class="modal-body">
            <div class="mf"><label class="fl">{{ t('old_password') }}</label><input v-model="cpOld" class="input" type="password" /></div>
            <div class="mf"><label class="fl">{{ t('new_password') }}</label><input v-model="cpNew" class="input" type="password" /></div>
          </div>
          <div class="modal-footer"><button class="btn btn-neutral" @click="showChangePass=false">{{ t('cancel') }}</button><button class="btn btn-ok" :disabled="cpBusy" @click="changePassword">{{ cpBusy?'...':t('save') }}</button></div>
        </div>
      </div>
    </Teleport>
    <Toast />
  </div>
</template>

<style scoped>
.layout{display:flex;height:100vh;overflow:hidden}
.sidebar{width:var(--sidebar-w);min-width:var(--sidebar-w);background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto}
.sidebar-brand{display:flex;align-items:center;gap:.65rem;padding:1.1rem 1rem;border-bottom:1px solid var(--border)}
.brand-icon{font-size:1.4rem;color:var(--accent)}.brand-logo-img{width:1.6rem;height:1.6rem;object-fit:contain;flex-shrink:0}.brand-name{font-size:.95rem;font-weight:700;line-height:1.1}
.brand-sub{font-size:.68rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:.1em}
.server-section{padding:.75rem .75rem .5rem}
.section-label{font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin-bottom:.4rem;padding:0 .25rem}
.server-item{display:flex;align-items:center;gap:.5rem;padding:.5rem .6rem;border-radius:7px;cursor:pointer;transition:background .15s}
.server-item:hover{background:var(--surface-hover)}.server-item.active{background:var(--accent-soft)}
.server-label{font-size:.8rem;font-weight:600;line-height:1.2}.server-host{font-size:.7rem;color:var(--accent);font-family:monospace}
.sidebar-divider{border:none;border-top:1px solid var(--border);margin:.25rem 0}
.sidebar-nav{padding:.5rem .75rem;flex:1}
.nav-item{display:block;width:100%;text-align:left;background:transparent;border:none;color:var(--text-dim);padding:.5rem .6rem;border-radius:7px;cursor:pointer;font-size:.82rem;transition:all .15s;margin-bottom:.1rem}
.nav-item:hover{background:var(--surface-hover);color:var(--text)}.nav-item.active{background:var(--accent-soft);color:var(--accent);font-weight:600}
.sidebar-footer{padding:.75rem 1rem;border-top:1px solid var(--border)}
.main-wrap{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{padding:.85rem 1.5rem;border-bottom:1px solid var(--border);background:var(--surface);display:flex;align-items:center;justify-content:space-between;gap:1rem}
.topbar-title{font-size:1.05rem;font-weight:700}.topbar-sub{color:var(--text-dim);font-size:.72rem;margin-top:.1rem;font-family:monospace}
.topbar-actions{display:flex;align-items:center;gap:.5rem;flex-shrink:0}
.content{flex:1;overflow-y:auto;padding:1.25rem 1.5rem}
.user-menu-wrap{position:relative}
.user-dropdown{position:absolute;right:0;top:calc(100% + 6px);background:var(--surface);border:1px solid var(--border);border-radius:9px;min-width:180px;z-index:200;padding:.3rem;box-shadow:0 8px 24px rgba(0,0,0,.3)}
.dropdown-item{display:block;width:100%;text-align:left;background:transparent;border:none;color:var(--text);padding:.5rem .75rem;border-radius:6px;cursor:pointer;font-size:.82rem}
.dropdown-item:hover{background:var(--surface-hover)}.dropdown-item.danger{color:var(--danger)}
.dropdown-item.active{background:var(--accent-soft);color:var(--accent);font-weight:600}
.lang-dropdown{min-width:190px;max-height:320px;overflow-y:auto}
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:420px}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.2rem;border-bottom:1px solid var(--border)}
.modal-body{padding:1rem 1.2rem;display:flex;flex-direction:column;gap:.75rem}
.modal-footer{display:flex;justify-content:flex-end;gap:.5rem;padding:.85rem 1.2rem;border-top:1px solid var(--border)}
.fl{display:block;font-size:.78rem;color:var(--text-dim);margin-bottom:.25rem}.mf{display:flex;flex-direction:column}
</style>
