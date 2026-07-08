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
const { data, loading, error, lastUpdated, paused, refresh } = usePolling(() => api.getClients(sid.value), 5000)
const search = ref(''); const stateFilter = ref('')
const states = computed(() => Array.from(new Set((data.value?.rows??[]).map(r=>String(r['state']??'')).filter(Boolean))))
const filtered = computed(() => {
  let rows = data.value?.rows??[]
  if (stateFilter.value) rows = rows.filter(r=>r['state']===stateFilter.value)
  if (search.value) { const q=search.value.toLowerCase(); rows=rows.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(q))) }
  return rows
})
const stateColor = (s:string) => s==='active'?'badge-ok':s==='waiting'?'badge-danger':s==='idle'?'badge-neutral':'badge-accent'
</script>
<template>
  <div>
    <RefreshBar :last-updated="lastUpdated" :paused="paused" :interval-ms="5000"
      @refresh="refresh" @toggle-pause="paused=!paused" @change-interval="()=>{}" />
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ t('clients') }} <span class="muted" style="font-size:.75rem">({{ filtered.length }})</span></h2>
        <div class="flex gap-2">
          <select v-model="stateFilter" class="input" style="width:140px">
            <option value="">{{ t('state') }}: All</option>
            <option v-for="s in states" :key="s" :value="s">{{ s }}</option>
          </select>
          <input v-model="search" class="input" style="width:180px" :placeholder="t('filter')" />
        </div>
      </div>
      <p v-if="loading&&!data" class="muted">{{ t('loading') }}</p>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>{{ t('type') }}</th><th>{{ t('user') }}</th><th>{{ t('database') }}</th><th>{{ t('state') }}</th><th>Addr</th><th>{{ t('port') }}</th><th>Local Addr</th><th>Local Port</th><th>{{ t('connect_time') }}</th><th>{{ t('request_time') }}</th><th>Wait</th></tr></thead>
        <tbody>
          <tr v-if="!filtered.length"><td colspan="11" class="muted" style="text-align:center;padding:1.5rem">{{ t('no_data') }}</td></tr>
          <tr v-for="(r,i) in filtered" :key="i">
            <td>{{ r['type'] }}</td><td>{{ r['user'] }}</td>
            <td><code style="font-size:.78rem">{{ r['database'] }}</code></td>
            <td><span class="badge" :class="stateColor(String(r['state']??''))">{{ r['state'] }}</span></td>
            <td class="muted">{{ r['addr'] }}</td><td class="muted">{{ r['port'] }}</td>
            <td class="muted">{{ r['local_addr'] }}</td><td class="muted">{{ r['local_port'] }}</td>
            <td class="muted" style="font-size:.75rem">{{ r['connect_time'] }}</td>
            <td class="muted" style="font-size:.75rem">{{ r['request_time'] }}</td>
            <td>{{ r['wait']??r['wait_us'] }}</td>
          </tr>
        </tbody>
      </table></div>
    </div>
  </div>
</template>
