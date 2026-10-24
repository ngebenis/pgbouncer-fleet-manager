<script setup lang="ts">
import { reactive, ref } from 'vue'
import { api } from '../composables/api'
import { useBranding } from '../stores/branding'
import { useToast } from '../composables/useToast'
import { useI18n } from '../i18n'
const { t } = useI18n(); const toast = useToast()
const { branding, logoUrl, loadBranding } = useBranding()
const emit = defineEmits<{(e:'saved'):void}>()

const form = reactive({ company_name: branding.value.company_name, app_name: branding.value.app_name, app_sub: branding.value.app_sub })
const busy = ref(false)
const logoFile = ref<File|null>(null)
const logoPreview = ref('')

function onPickLogo(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null
  logoFile.value = file
  if (logoPreview.value) URL.revokeObjectURL(logoPreview.value)
  logoPreview.value = file ? URL.createObjectURL(file) : ''
}

async function saveText() {
  busy.value = true
  try {
    await api.setBranding({ ...form })
    await loadBranding()
    toast.success(t('branding_saved'))
    emit('saved')
  } catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { busy.value = false }
}

async function uploadLogo() {
  if (!logoFile.value) { toast.warn(t('choose_file_first')); return }
  busy.value = true
  try {
    await api.uploadBrandingLogo(logoFile.value)
    logoFile.value = null
    if (logoPreview.value) { URL.revokeObjectURL(logoPreview.value); logoPreview.value = '' }
    await loadBranding()
    toast.success(t('logo_uploaded'))
    emit('saved')
  } catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { busy.value = false }
}

async function resetLogo() {
  if (!confirm(t('confirm_reset_logo'))) return
  busy.value = true
  try {
    await api.resetBrandingLogo()
    await loadBranding()
    toast.success(t('logo_reset'))
    emit('saved')
  } catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { busy.value = false }
}
</script>
<template>
<div style="display:flex;flex-direction:column;gap:.75rem">
  <div class="card">
    <div class="card-header"><h2 class="card-title">{{ t('branding_identity') }}</h2></div>
    <p class="muted" style="margin:.25rem 0 1rem">{{ t('branding_identity_hint') }}</p>
    <div class="flex gap-2 flex-wrap" style="align-items:flex-end">
      <div style="flex:1;min-width:220px"><label class="fl">{{ t('app_name') }}</label><input v-model="form.app_name" class="input" placeholder="PgBouncer" /></div>
      <div style="flex:1;min-width:220px"><label class="fl">{{ t('app_sub') }}</label><input v-model="form.app_sub" class="input" placeholder="Manager" /></div>
      <div style="flex:2;min-width:260px"><label class="fl">{{ t('company_name') }}</label><input v-model="form.company_name" class="input" :placeholder="t('company_name_placeholder')" /></div>
      <button class="btn btn-ok" :disabled="busy" @click="saveText">{{ busy?'...':t('save') }}</button>
    </div>
  </div>
  <div class="card">
    <div class="card-header"><h2 class="card-title">{{ t('logo') }}</h2></div>
    <p class="muted" style="margin:.25rem 0 1rem">{{ t('logo_hint') }}</p>
    <div class="flex gap-3" style="align-items:center;margin-bottom:.9rem">
      <div class="logo-preview">
        <img v-if="logoPreview || logoUrl" :src="logoPreview || logoUrl" alt="logo" />
        <span v-else style="font-size:1.6rem;color:var(--accent)">◈</span>
      </div>
      <div class="muted" style="font-size:.78rem">{{ branding.has_logo ? t('logo_active') : t('logo_default') }}</div>
    </div>
    <div class="flex gap-2 flex-wrap">
      <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon" class="input" @change="onPickLogo" />
      <button class="btn btn-ok" :disabled="busy||!logoFile" @click="uploadLogo">{{ busy?'...':'↑ '+t('upload') }}</button>
      <button class="btn btn-danger" :disabled="busy||!branding.has_logo" @click="resetLogo">{{ t('reset_logo') }}</button>
    </div>
  </div>
</div>
</template>
<style scoped>
.fl{display:block;font-size:.78rem;color:var(--text-dim);margin-bottom:.25rem}
.logo-preview{width:56px;height:56px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
.logo-preview img{width:100%;height:100%;object-fit:contain}
</style>
