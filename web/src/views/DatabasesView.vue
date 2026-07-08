<script setup lang="ts">
import { computed } from 'vue'
import { api } from '../composables/api'
import { usePolling } from '../composables/usePolling'
import { useServerStore } from '../stores/server'
import { useI18n } from '../i18n'
import RefreshBar from '../components/RefreshBar.vue'

const { activeId } = useServerStore()
const { t } = useI18n()
const sid = computed(() => activeId.value)
const { data, loading, error, lastUpdated, paused, refresh } = usePolling(() => api.getDatabases(sid.value), 8000)
const rows = computed(() => data.value?.rows??[])
const poolModeColor = (m:string) => m==='transaction'?'badge-accent':m==='session'?'badge-ok':m==='statement'?'badge-purple':'badge-neutral'
</script>
<template>
  <div>
    <RefreshBar :last-updated="lastUpdated" :paused="paused" :interval-ms="8000"
      @refresh="refresh" @toggle-pause="paused=!paused" @change-interval="()=>{}" />
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ t('databases') }} <span class="muted" style="font-size:.75rem">({{ rows.length }})</span></h2>
      </div>
      <p v-if="loading&&!data" class="muted">{{ t('loading') }}</p>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr>
          <th>{{ t('name') }}</th><th>{{ t('host') }}</th><th>{{ t('port') }}</th>
          <th>{{ t('database') }}</th><th>Force User</th><th>{{ t('pool_size') }}</th>
          <th>Reserve Pool</th><th>{{ t('mode') }}</th><th>{{ t('max_conn') }}</th>
          <th>{{ t('current') }}</th><th>{{ t('paused') }}</th><th>{{ t('disabled') }}</th>
        </tr></thead>
        <tbody>
          <tr v-if="!rows.length"><td colspan="12" class="muted" style="text-align:center;padding:1.5rem">{{ t('no_data') }}</td></tr>
          <tr v-for="(r,i) in rows" :key="i">
            <td><strong>{{ r['name'] }}</strong></td>
            <td class="muted">{{ r['host']||'—' }}</td>
            <td class="muted">{{ r['port'] }}</td>
            <td><code style="font-size:.78rem">{{ r['database'] }}</code></td>
            <td class="muted">{{ r['force_user']||'—' }}</td>
            <td>{{ r['pool_size'] }}</td><td>{{ r['reserve_pool'] }}</td>
            <td><span class="badge" :class="poolModeColor(String(r['pool_mode']??''))">{{ r['pool_mode']||'default' }}</span></td>
            <td>{{ r['max_connections'] }}</td><td>{{ r['current_connections'] }}</td>
            <td><span v-if="r['paused']" class="badge badge-warn">{{ t('paused') }}</span><span v-else class="muted">—</span></td>
            <td><span v-if="r['disabled']" class="badge badge-danger">{{ t('disabled') }}</span><span v-else class="muted">—</span></td>
          </tr>
        </tbody>
      </table></div>
    </div>
  </div>
</template>
