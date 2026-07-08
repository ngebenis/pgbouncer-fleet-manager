<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '../composables/api'
import { usePolling } from '../composables/usePolling'
import { useServerStore } from '../stores/server'
import { useI18n } from '../i18n'
import RefreshBar from '../components/RefreshBar.vue'

const { activeId } = useServerStore()
const { t } = useI18n()
const sid = computed(() => activeId.value)
const { data, loading, error, lastUpdated, paused, refresh } = usePolling(() => api.getServers(sid.value), 5000)
const search = ref('')
const filtered = computed(() => {
  const rows = data.value?.rows??[]
  if (!search.value) return rows
  const q = search.value.toLowerCase()
  return rows.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(q)))
})
const stateColor = (s:string) => s==='active'?'badge-ok':s==='idle'?'badge-neutral':s==='used'?'badge-accent':'badge-warn'
</script>
<template>
  <div>
    <RefreshBar :last-updated="lastUpdated" :paused="paused" :interval-ms="5000"
      @refresh="refresh" @toggle-pause="paused=!paused" @change-interval="()=>{}" />
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Server Connections <span class="muted" style="font-size:.75rem">({{ filtered.length }})</span></h2>
        <input v-model="search" class="input" style="width:180px" :placeholder="t('filter')" />
      </div>
      <p v-if="loading&&!data" class="muted">{{ t('loading') }}</p>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>{{ t('type') }}</th><th>{{ t('user') }}</th><th>{{ t('database') }}</th><th>{{ t('state') }}</th><th>Addr</th><th>{{ t('port') }}</th><th>Local Addr</th><th>{{ t('connect_time') }}</th><th>{{ t('request_time') }}</th><th>{{ t('close_needed') }}</th></tr></thead>
        <tbody>
          <tr v-if="!filtered.length"><td colspan="10" class="muted" style="text-align:center;padding:1.5rem">{{ t('no_data') }}</td></tr>
          <tr v-for="(r,i) in filtered" :key="i">
            <td>{{ r['type'] }}</td><td>{{ r['user'] }}</td>
            <td><code style="font-size:.78rem">{{ r['database'] }}</code></td>
            <td><span class="badge" :class="stateColor(String(r['state']??''))">{{ r['state'] }}</span></td>
            <td class="muted">{{ r['addr'] }}</td><td class="muted">{{ r['port'] }}</td>
            <td class="muted">{{ r['local_addr'] }}</td>
            <td class="muted" style="font-size:.75rem">{{ r['connect_time'] }}</td>
            <td class="muted" style="font-size:.75rem">{{ r['request_time'] }}</td>
            <td>{{ r['close_needed']?'⚠ Yes':'—' }}</td>
          </tr>
        </tbody>
      </table></div>
    </div>
  </div>
</template>
