import { ref } from 'vue'
import { api } from '../composables/api'
import type { BrandingConfig } from '../types/api'

const branding = ref<BrandingConfig>({ company_name: '', app_name: 'PgBouncer', app_sub: 'Manager', logo_mime: '', has_logo: false })
const loaded = ref(false)
const logoUrl = ref('')

function applyFavicon() {
  const href = logoUrl.value || '/favicon.ico'
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link) }
  link.href = href
}

async function loadBranding() {
  try {
    branding.value = await api.getBranding()
    logoUrl.value = branding.value.has_logo ? `/api/branding/logo?v=${Date.now()}` : ''
    applyFavicon()
  } catch { /* keep defaults */ }
  finally { loaded.value = true }
}

export function useBranding() {
  return { branding, loaded, logoUrl, loadBranding, applyFavicon }
}
