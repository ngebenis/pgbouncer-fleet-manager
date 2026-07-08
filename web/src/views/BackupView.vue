<script setup lang="ts">
import { ref, reactive } from 'vue'
import { api } from '../composables/api'
import { useToast } from '../composables/useToast'
import { useI18n } from '../i18n'
const { t } = useI18n(); const toast = useToast()
const busy = ref(false); const restoreFile = ref<File|null>(null)
const alerts = reactive({ cl_waiting_threshold:1, maxwait_ms_threshold:5000, enabled:true })
api.getAlerts().then(r => Object.assign(alerts, r))
async function downloadBackup() {
  busy.value=true
  try {
    const res = await api.downloadBackup()
    const url = URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href=url; a.download=`pgbm-backup-${new Date().toISOString().slice(0,19).replace(/[:]/g,'-')}.zip`; a.click()
    URL.revokeObjectURL(url); toast.success('Backup didownload')
  } catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { busy.value=false }
}
async function doRestore() {
  if (!restoreFile.value) { toast.warn('Pilih file dulu'); return }
  if (!confirm('Restore akan menimpa data. Lanjutkan?')) return
  busy.value=true
  try { const res = await api.restoreBackup(restoreFile.value) as any; toast.success(`Restore OK: ${res.restored?.join(', ')||''}`) }
  catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { busy.value=false }
}
async function saveAlerts() {
  try { await api.setAlerts({...alerts}); toast.success('Alert disimpan') }
  catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
}
</script>
<template>
<div style="display:flex;flex-direction:column;gap:.75rem">
  <div class="card">
    <div class="card-header"><h2 class="card-title">{{ t('backup_download') }}</h2></div>
    <p class="muted" style="margin:.25rem 0 1rem">{{ t('backup_note') }}</p>
    <button class="btn btn-ok" :disabled="busy" @click="downloadBackup">{{ busy?'...':'⬇ '+t('backup_download') }}</button>
  </div>
  <div class="card">
    <div class="card-header"><h2 class="card-title">{{ t('backup_restore') }}</h2></div>
    <div class="flex gap-2 flex-wrap" style="margin-top:.75rem">
      <input type="file" accept=".zip" class="input" @change="e => restoreFile=(e.target as HTMLInputElement).files?.[0]??null" />
      <button class="btn btn-warn" :disabled="busy||!restoreFile" @click="doRestore">{{ busy?'...':'↑ Restore' }}</button>
    </div>
  </div>
  <div class="card">
    <div class="card-header"><h2 class="card-title">{{ t('alerts_title') }}</h2></div>
    <div class="flex gap-2 flex-wrap" style="margin-top:.75rem;align-items:flex-end">
      <div style="flex:1;min-width:180px"><label class="fl">{{ t('cl_waiting_threshold') }}</label><input v-model.number="alerts.cl_waiting_threshold" class="input" type="number" min="0" /></div>
      <div style="flex:1;min-width:180px"><label class="fl">{{ t('maxwait_threshold') }}</label><input v-model.number="alerts.maxwait_ms_threshold" class="input" type="number" min="0" /></div>
      <div style="flex:1;min-width:140px"><label class="fl">{{ t('alerts_enabled') }}</label><label style="display:flex;align-items:center;gap:.4rem;font-size:.85rem;cursor:pointer;padding:.4rem 0"><input type="checkbox" v-model="alerts.enabled" />{{ alerts.enabled?'Aktif':'Nonaktif' }}</label></div>
      <button class="btn btn-ok" @click="saveAlerts">{{ t('save') }}</button>
    </div>
  </div>
</div>
</template>
<style scoped>
.fl{display:block;font-size:.78rem;color:var(--text-dim);margin-bottom:.25rem}
</style>
