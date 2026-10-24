<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../composables/api'
import { useAuthStore } from '../stores/auth'
import { useBranding } from '../stores/branding'
import { useI18n } from '../i18n'
const { t } = useI18n()
const auth = useAuthStore()
const { branding, logoUrl } = useBranding()
const username = ref(''); const password = ref(''); const error = ref(''); const loading = ref(false)
const emit = defineEmits<{(e:'logged-in'):void}>()
async function login() {
  error.value = ''; loading.value = true
  try {
    const res = await api.login(username.value, password.value)
    auth.setAuth(res.token, res.username, res.role)
    emit('logged-in')
  } catch(e) { error.value = e instanceof Error ? e.message : 'Login gagal' }
  finally { loading.value = false }
}
</script>
<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-logo">
        <img v-if="logoUrl" :src="logoUrl" alt="logo" style="width:1.8rem;height:1.8rem;object-fit:contain" />
        <span v-else style="font-size:1.6rem;color:var(--accent)">◈</span>
        <div><div style="font-size:1.1rem;font-weight:700">{{ branding.app_name }}</div><div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-dim)">{{ branding.app_sub }}</div></div>
      </div>
      <div class="lf"><label>{{ t('username') }}</label><input v-model="username" class="input" type="text" @keyup.enter="login" autofocus /></div>
      <div class="lf"><label>{{ t('password') }}</label><input v-model="password" class="input" type="password" @keyup.enter="login" /></div>
      <p v-if="error" class="err-text">{{ error }}</p>
      <button class="btn btn-ok" style="width:100%;padding:.6rem" :disabled="loading" @click="login">{{ loading ? t('loading') : t('login') }}</button>
      <p v-if="branding.company_name" style="text-align:center;font-size:.75rem;color:var(--text-muted)">{{ branding.company_name }}</p>
    </div>
  </div>
</template>
<style scoped>
.login-wrap{display:flex;align-items:center;justify-content:center;height:100vh;background:var(--bg)}
.login-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:2rem 2.5rem;width:100%;max-width:380px;display:flex;flex-direction:column;gap:1rem}
.login-logo{display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem}
.lf{display:flex;flex-direction:column;gap:.3rem}
.lf label{font-size:.82rem;color:var(--text-dim)}
</style>
