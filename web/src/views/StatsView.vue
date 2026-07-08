<script setup lang="ts">
import { computed } from 'vue'
import { api } from '../composables/api'
import { usePolling } from '../composables/usePolling'
import { useServerStore } from '../stores/server'
import { useI18n } from '../i18n'
import MetricCard from '../components/MetricCard.vue'
import RefreshBar from '../components/RefreshBar.vue'

const { activeId } = useServerStore()
const { t } = useI18n()
const sid = computed(() => activeId.value)
const { data, loading, error, lastUpdated, paused, refresh } = usePolling(() => api.getStats(sid.value), 5000)
const rows = computed(() => data.value?.rows??[])
const totals = computed(() => {
  const sum = (k:string) => rows.value.reduce((s,r)=>s+Number(r[k]??0),0)
  return { req:sum('total_requests')||sum('total_xact_count'), recv:sum('total_received'), sent:sum('total_sent') }
})
function fmtBytes(b:number) {
  if(b>1e9) return (b/1e9).toFixed(2)+' GB'
  if(b>1e6) return (b/1e6).toFixed(2)+' MB'
  if(b>1e3) return (b/1e3).toFixed(2)+' KB'
  return b+' B'
}
</script>
<template>
  <div>
    <RefreshBar :last-updated="lastUpdated" :paused="paused" :interval-ms="5000"
      @refresh="refresh" @toggle-pause="paused=!paused" @change-interval="()=>{}" />
    <div class="metrics-grid mb-3">
      <MetricCard :label="t('total_requests')" :value="totals.req.toLocaleString()" color="accent" />
      <MetricCard :label="t('total_received')" :value="fmtBytes(totals.recv)" color="ok" />
      <MetricCard :label="t('total_sent')"     :value="fmtBytes(totals.sent)" color="purple" />
    </div>
    <div class="card">
      <div class="card-header"><h2 class="card-title">{{ t('stats_per_db') }}</h2></div>
      <p v-if="loading&&!data" class="muted">{{ t('loading') }}</p>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr>
          <th>{{ t('database') }}</th><th>{{ t('total_requests') }}</th>
          <th>{{ t('total_received') }}</th><th>{{ t('total_sent') }}</th>
          <th>Total Query Time</th><th>Avg Req</th><th>Avg Recv</th><th>Avg Sent</th><th>Avg Query (µs)</th>
        </tr></thead>
        <tbody>
          <tr v-if="!rows.length"><td colspan="9" class="muted" style="text-align:center;padding:1.5rem">{{ t('no_data') }}</td></tr>
          <tr v-for="(r,i) in rows" :key="i">
            <td><code style="font-size:.78rem">{{ r['database'] }}</code></td>
            <td>{{ Number(r['total_requests']??r['total_xact_count']??0).toLocaleString() }}</td>
            <td>{{ fmtBytes(Number(r['total_received']??0)) }}</td>
            <td>{{ fmtBytes(Number(r['total_sent']??0)) }}</td>
            <td class="muted">{{ Number(r['total_query_time']??r['total_xact_time']??0).toLocaleString() }} µs</td>
            <td>{{ r['avg_req']??r['avg_xact_count']??'—' }}</td>
            <td>{{ r['avg_recv']!=null?fmtBytes(Number(r['avg_recv'])):'—' }}</td>
            <td>{{ r['avg_sent']!=null?fmtBytes(Number(r['avg_sent'])):'—' }}</td>
            <td>{{ r['avg_query']??r['avg_query_time']??'—' }}</td>
          </tr>
        </tbody>
      </table></div>
    </div>
  </div>
</template>
<style scoped>
.metrics-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.75rem}
.mb-3{margin-bottom:.75rem}
</style>
