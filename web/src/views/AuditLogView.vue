<script setup lang="ts">
import { ref, computed } from 'vue'
import { api } from '../composables/api'
import { usePolling } from '../composables/usePolling'
import { useI18n } from '../i18n'
const { t } = useI18n()
const limit = ref(200)
const { data, refresh } = usePolling(() => api.listAudit(limit.value), 10000)
const search = ref('')
const entries = computed(() => {
  const rows = data.value?.entries ?? []
  if (!search.value) return rows
  const q = search.value.toLowerCase()
  return rows.filter((r:any) => JSON.stringify(r).toLowerCase().includes(q))
})
const ac = (a:string) => a.includes('delete')||a.includes('stop')||a.includes('kill') ? 'badge-danger' : a.includes('login')||a.includes('start')||a.includes('create') ? 'badge-ok' : a.includes('restart')||a.includes('restore') ? 'badge-warn' : 'badge-neutral'
</script>
<template>
<div>
  <div class="flex items-center gap-2" style="margin-bottom:1rem;flex-wrap:wrap">
    <h2 style="flex:1">{{ t('audit_log') }}</h2>
    <input v-model="search" class="input" style="width:200px" :placeholder="t('filter')" />
    <select v-model="limit" class="input" style="width:90px"><option :value="100">100</option><option :value="200">200</option><option :value="500">500</option></select>
    <button class="btn btn-accent btn-xs" @click="refresh">↻</button>
  </div>
  <div class="card"><div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>Waktu</th><th>User</th><th>Action</th><th>Target</th><th>IP</th><th>Status</th><th>Detail</th></tr></thead>
    <tbody>
      <tr v-if="!entries.length"><td colspan="7" class="muted" style="text-align:center;padding:1.5rem">{{ t('no_data') }}</td></tr>
      <tr v-for="e in entries" :key="e.id">
        <td style="font-size:.72rem;white-space:nowrap">{{ new Date(e.timestamp).toLocaleString() }}</td>
        <td><strong>{{ e.user }}</strong></td>
        <td><span class="badge" :class="ac(e.action)">{{ e.action }}</span></td>
        <td class="muted" style="font-size:.75rem">{{ e.target||'—' }}</td>
        <td class="muted" style="font-size:.72rem">{{ e.ip }}</td>
        <td><span class="badge" :class="e.success?'badge-ok':'badge-danger'">{{ e.success?'✓':'✕' }}</span></td>
        <td class="muted" style="font-size:.72rem;max-width:180px;white-space:normal">{{ e.details||'—' }}</td>
      </tr>
    </tbody>
  </table></div></div>
</div>
</template>
