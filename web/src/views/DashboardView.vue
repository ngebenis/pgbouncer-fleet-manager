<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '../composables/api'
import { usePolling } from '../composables/usePolling'
import { useToast } from '../composables/useToast'
import { useServerStore } from '../stores/server'
import { useI18n } from '../i18n'
import MetricCard from '../components/MetricCard.vue'
import RefreshBar from '../components/RefreshBar.vue'

const { activeId } = useServerStore()
const toast = useToast()
const { t } = useI18n()
const sid = computed(() => activeId.value)
const intervalMs = ref(5000)

const status = usePolling(() => api.getServiceStatus(sid.value), intervalMs.value)
const pools  = usePolling(() => api.getPools(sid.value), intervalMs.value)
const version = usePolling(() => api.getVersion(sid.value), 60000)

const totalClActive  = computed(() => (pools.data.value?.rows??[]).reduce((s,r) => s+Number(r['cl_active']??0),0))
const totalClWaiting = computed(() => (pools.data.value?.rows??[]).reduce((s,r) => s+Number(r['cl_waiting']??0),0))
const totalSvActive  = computed(() => (pools.data.value?.rows??[]).reduce((s,r) => s+Number(r['sv_active']??0),0))
const totalSvIdle    = computed(() => (pools.data.value?.rows??[]).reduce((s,r) => s+Number(r['sv_idle']??0),0))
const maxWaitMs      = computed(() => Math.max(0,...(pools.data.value?.rows??[]).map(r=>Number(r['maxwait_us']??0)/1000)))
const poolCount      = computed(() => (pools.data.value?.rows??[]).length)

const statusColor = (s?:string) => s==='active'?'ok':s==='failed'?'danger':s==='inactive'?'warn':'neutral'
const statusLabel = (s?:string) => s==='active'?t('active'):s==='inactive'?t('status_inactive'):s==='failed'?t('status_failed'):s?t('status_unknown'):'...'
const busy = ref<string|null>(null)

async function runAction(action:'start'|'stop'|'restart'|'reload', confirmKey?:string) {
  if (confirmKey && !window.confirm(t(confirmKey))) return
  busy.value = action
  try {
    const fn = action==='start'?api.startService:action==='stop'?api.stopService:action==='restart'?api.restartService:api.reload
    await fn(sid.value)
    toast.success(`${t(action)} OK`)
    await status.refresh()
  } catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { busy.value = null }
}
function doRefresh() { status.refresh(); pools.refresh() }
function togglePause() { const p=!status.paused.value; status.paused.value=p; pools.paused.value=p }
</script>
<template>
  <div>
    <RefreshBar :last-updated="pools.lastUpdated.value" :paused="status.paused.value" :interval-ms="intervalMs"
      @refresh="doRefresh" @toggle-pause="togglePause" @change-interval="() => {}" />
    <div class="card mb-3">
      <div class="card-header">
        <div class="flex items-center gap-2">
          <span class="dot" :class="`dot-${statusColor(status.data.value?.status)}`"></span>
          <span class="card-title">{{ t('service') }}</span>
          <span class="badge" :class="`badge-${statusColor(status.data.value?.status)}`">
            {{ statusLabel(status.data.value?.status) }}
          </span>
          <span v-if="version.data.value" class="muted" style="font-size:.72rem">· {{ version.data.value.version }}</span>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-ok btn-xs" :disabled="busy!==null" @click="runAction('start')">{{ busy==='start'?'...':t('start') }}</button>
          <button class="btn btn-warn btn-xs" :disabled="busy!==null" @click="runAction('stop','confirm_stop')">{{ busy==='stop'?'...':t('stop') }}</button>
          <button class="btn btn-danger btn-xs" :disabled="busy!==null" @click="runAction('restart','confirm_restart')">{{ busy==='restart'?'...':t('restart') }}</button>
          <button class="btn btn-accent btn-xs" :disabled="busy!==null" @click="runAction('reload')">{{ busy==='reload'?'...':'↺ '+t('reload_config') }}</button>
        </div>
      </div>
    </div>
    <div class="metrics-grid mb-3">
      <MetricCard :label="t('cl_active')"  :value="totalClActive"  :color="totalClActive>0?'ok':'neutral'" sub="cl_active" />
      <MetricCard :label="t('cl_waiting')" :value="totalClWaiting" :color="totalClWaiting>0?'danger':'neutral'" sub="cl_waiting" />
      <MetricCard :label="t('sv_active')"  :value="totalSvActive"  :color="totalSvActive>0?'accent':'neutral'" sub="sv_active" />
      <MetricCard :label="t('sv_idle')"    :value="totalSvIdle"    color="neutral" sub="sv_idle" />
      <MetricCard :label="t('max_wait')"   :value="maxWaitMs>0?maxWaitMs.toFixed(0)+' ms':'0 ms'" :color="maxWaitMs>5000?'danger':maxWaitMs>1000?'warn':'ok'" sub="maxwait_us" />
      <MetricCard :label="t('pool_count')" :value="poolCount" color="purple" sub="pools" />
    </div>
    <div v-if="totalClWaiting>0" class="alert-banner alert-danger mb-3">
      ⚠ {{ t('warn_waiting', String(totalClWaiting)) }}
    </div>
    <div v-if="maxWaitMs>5000" class="alert-banner alert-warn mb-3">
      ⚠ {{ t('warn_maxwait', maxWaitMs.toFixed(0)) }}
    </div>
  </div>
</template>
<style scoped>
.metrics-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.75rem}
.mb-3{margin-bottom:.75rem}
.alert-banner{padding:.65rem 1rem;border-radius:8px;font-size:.83rem}
.alert-danger{background:var(--danger-soft);border:1px solid rgba(239,68,68,.25);color:#fca5a5}
.alert-warn{background:var(--warn-soft);border:1px solid rgba(245,158,11,.25);color:#fcd34d}
</style>
