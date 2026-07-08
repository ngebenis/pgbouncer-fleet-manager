<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '../composables/api'
import { usePolling } from '../composables/usePolling'
import { useToast } from '../composables/useToast'
import { useServerStore } from '../stores/server'
import { useI18n } from '../i18n'
import RefreshBar from '../components/RefreshBar.vue'
import type { PgRow } from '../types/api'

const { activeId } = useServerStore()
const toast = useToast()
const { t } = useI18n()
const sid = computed(() => activeId.value)
const { data, loading, error, lastUpdated, paused, refresh } = usePolling(() => api.getPools(sid.value), 4000)
const search = ref('')
const filtered = computed(() => {
  const rows = data.value?.rows??[]
  if (!search.value) return rows
  const q = search.value.toLowerCase()
  return rows.filter(r => Object.values(r).some(v => String(v??'').toLowerCase().includes(q)))
})
const busy = ref<string|null>(null)
async function doPause(db:string) {
  if (!confirm(t('confirm_pause', db))) return
  busy.value='pause:'+db
  try { await api.pause(sid.value, db); toast.success(`${t('pause')}: ${db}`); await refresh() }
  catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { busy.value=null }
}
async function doResume(db:string) {
  busy.value='resume:'+db
  try { await api.resume(sid.value, db); toast.success(`${t('resume')}: ${db}`); await refresh() }
  catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { busy.value=null }
}
async function doKill(db:string) {
  if (!confirm(t('confirm_kill', db))) return
  busy.value='kill:'+db
  try { await api.kill(sid.value, db); toast.success(`${t('kill')}: ${db}`); await refresh() }
  catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { busy.value=null }
}
const poolModeColor = (m:string) => m==='transaction'?'badge-accent':m==='session'?'badge-ok':m==='statement'?'badge-purple':'badge-neutral'
const rowClass = (r:PgRow) => {
  const w=Number(r['cl_waiting']??0); const ms=Number(r['maxwait_us']??0)/1000
  return (w>0||ms>5000)?'row-danger':ms>1000?'row-warn':''
}
</script>
<template>
  <div>
    <RefreshBar :last-updated="lastUpdated" :paused="paused" :interval-ms="4000"
      @refresh="refresh" @toggle-pause="paused=!paused" @change-interval="()=>{}" />
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ t('pools') }} <span class="muted" style="font-size:.75rem">({{ filtered.length }})</span></h2>
        <div class="flex gap-2">
          <input v-model="search" class="input" style="width:200px" :placeholder="t('filter')" />
          <button class="btn btn-warn btn-xs" :disabled="busy!==null" @click="doPause('')">⏸ {{ t('pause_all') }}</button>
          <button class="btn btn-ok btn-xs" :disabled="busy!==null" @click="doResume('')">▶ {{ t('resume_all') }}</button>
        </div>
      </div>
      <p v-if="loading&&!data" class="muted">{{ t('loading') }}</p>
      <p v-if="error" class="err-text">{{ error }}</p>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr>
          <th>{{ t('database') }}</th><th>{{ t('user') }}</th><th>{{ t('mode') }}</th>
          <th>{{ t('cl_active') }}</th><th>{{ t('cl_waiting') }}</th>
          <th>{{ t('sv_active') }}</th><th>{{ t('sv_idle') }}</th><th>SV Used</th>
          <th>{{ t('max_wait') }}</th><th>{{ t('actions') }}</th>
        </tr></thead>
        <tbody>
          <tr v-if="!filtered.length"><td colspan="10" class="muted" style="text-align:center;padding:1.5rem">{{ t('no_data') }}</td></tr>
          <tr v-for="(r,i) in filtered" :key="i" :class="rowClass(r)">
            <td><code style="font-size:.8rem">{{ r['database']??r['db'] }}</code></td>
            <td>{{ r['user'] }}</td>
            <td><span class="badge" :class="poolModeColor(String(r['pool_mode']??''))">{{ r['pool_mode']??'—' }}</span></td>
            <td><strong>{{ r['cl_active'] }}</strong></td>
            <td><span :class="Number(r['cl_waiting'])>0?'badge badge-danger':''">{{ r['cl_waiting'] }}</span></td>
            <td>{{ r['sv_active'] }}</td><td>{{ r['sv_idle'] }}</td><td>{{ r['sv_used'] }}</td>
            <td><span :class="Number(r['maxwait_us'])/1000>1000?'badge badge-warn':'muted'">
              {{ r['maxwait_us']?(Number(r['maxwait_us'])/1000).toFixed(0)+'ms':'0ms' }}
            </span></td>
            <td><div class="flex gap-2">
              <button class="btn btn-xs btn-warn" :disabled="busy!==null" @click="doPause(String(r['database']??r['db']??''))">⏸</button>
              <button class="btn btn-xs btn-ok"   :disabled="busy!==null" @click="doResume(String(r['database']??r['db']??''))">▶</button>
              <button class="btn btn-xs btn-danger" :disabled="busy!==null" @click="doKill(String(r['database']??r['db']??''))">✕</button>
            </div></td>
          </tr>
        </tbody>
      </table></div>
    </div>
  </div>
</template>
