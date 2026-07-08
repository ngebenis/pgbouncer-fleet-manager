<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '../composables/api'
import { usePolling } from '../composables/usePolling'
import { useToast } from '../composables/useToast'
import { useServerStore } from '../stores/server'
import { useI18n } from '../i18n'

const { activeId } = useServerStore()
const toast = useToast()
const { t } = useI18n()
const sid = computed(() => activeId.value)

const runtimeCfg = usePolling(() => api.getConfig(sid.value), 30000)
const runtimeRows = computed(() => runtimeCfg.data.value?.rows??[])
const cfgSearch = ref('')
const filteredCfg = computed(() => {
  if (!cfgSearch.value) return runtimeRows.value
  const q = cfgSearch.value.toLowerCase()
  return runtimeRows.value.filter(r=>String(r['key']??'').toLowerCase().includes(q))
})

const setKey = ref(''); const setValue = ref(''); const setBusy = ref(false)
async function doSet() {
  if (!setKey.value) return
  setBusy.value = true
  try { await api.setParam(sid.value, setKey.value, setValue.value); toast.success(`SET ${setKey.value} = ${setValue.value}`); await runtimeCfg.refresh() }
  catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { setBusy.value = false }
}

const rawCfg = usePolling(() => api.getRawConfig(sid.value), 30000)
const iniAvailable = computed(() => !rawCfg.error.value?.includes('not configured'))
const dbSection = computed(() => rawCfg.data.value?.sections.find(s=>s.Name==='databases')??null)
const dbNames = computed(() => dbSection.value ? Object.keys(dbSection.value.Values) : [])
const selDb = ref(''); const selMode = ref<'session'|'transaction'|'statement'>('transaction')
const dbBusy = ref(false)
async function applyPoolMode() {
  if (!selDb.value) { toast.warn(t('select_database')); return }
  dbBusy.value = true
  try { await api.setDatabaseField(sid.value, selDb.value, 'pool_mode', selMode.value); toast.success(`pool_mode "${selDb.value}" → ${selMode.value}`); await rawCfg.refresh() }
  catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { dbBusy.value = false }
}
const gField = ref(''); const gValue = ref(''); const gBusy = ref(false)
async function applyGlobal() {
  if (!gField.value) { toast.warn(t('field_name')); return }
  gBusy.value = true
  try { await api.setGlobalField(sid.value, gField.value, gValue.value); toast.success(`"${gField.value}" → ${gValue.value}`); await rawCfg.refresh() }
  catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { gBusy.value = false }
}
const changeableColor = (c:string) => c==='yes'?'badge-ok':'badge-neutral'
</script>
<template>
  <div style="display:flex;flex-direction:column;gap:.75rem">
    <div class="card">
      <div class="card-header"><h2 class="card-title">{{ t('runtime_set') }}</h2><span class="muted" style="font-size:.75rem">{{ t('changeable_only') }}</span></div>
      <div class="flex gap-2 flex-wrap" style="margin-top:.75rem">
        <input v-model="setKey" class="input" style="flex:1;min-width:160px" :placeholder="t('field_name')+', e.g. default_pool_size'" />
        <input v-model="setValue" class="input" style="flex:1;min-width:100px" :placeholder="t('value')" />
        <button class="btn btn-accent" :disabled="setBusy" @click="doSet">{{ setBusy?'...':'SET' }}</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2 class="card-title">{{ t('show_config') }}</h2><input v-model="cfgSearch" class="input" style="width:180px" :placeholder="t('filter')+' key...'" /></div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>{{ t('key') }}</th><th>{{ t('value') }}</th><th>{{ t('changeable') }}</th><th>{{ t('description') }}</th></tr></thead>
        <tbody>
          <tr v-for="(r,i) in filteredCfg" :key="i">
            <td><code style="font-size:.78rem">{{ r['key'] }}</code></td>
            <td><strong>{{ r['value'] }}</strong></td>
            <td><span class="badge" :class="changeableColor(String(r['changeable']??''))">{{ r['changeable'] }}</span></td>
            <td class="muted" style="font-size:.75rem;max-width:300px;white-space:normal">{{ r['description'] }}</td>
          </tr>
        </tbody>
      </table></div>
    </div>
    <template v-if="iniAvailable">
      <div class="card">
        <div class="card-header"><h2 class="card-title">{{ t('pool_mode_per_db') }}</h2><span class="muted" style="font-size:.75rem">{{ t('edit_ini_reload') }}</span></div>
        <div class="flex gap-2 flex-wrap" style="margin-top:.75rem">
          <select v-model="selDb" class="input" style="flex:1;min-width:160px">
            <option value="" disabled>{{ t('select_database') }}</option>
            <option v-for="n in dbNames" :key="n" :value="n">{{ n }}</option>
          </select>
          <select v-model="selMode" class="input" style="flex:1;min-width:130px">
            <option value="session">session</option>
            <option value="transaction">transaction</option>
            <option value="statement">statement</option>
          </select>
          <button class="btn btn-ok" :disabled="dbBusy" @click="applyPoolMode">{{ dbBusy?'...':t('apply_reload') }}</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h2 class="card-title">{{ t('global_setting') }}</h2></div>
        <p class="muted" style="font-size:.78rem;margin-bottom:.6rem">e.g. <code>default_pool_size</code>, <code>max_client_conn</code>, <code>pool_mode</code></p>
        <div class="flex gap-2 flex-wrap">
          <input v-model="gField" class="input" style="flex:1;min-width:160px" :placeholder="t('field_name')" />
          <input v-model="gValue" class="input" style="flex:1;min-width:100px" :placeholder="t('new_value')" />
          <button class="btn btn-ok" :disabled="gBusy" @click="applyGlobal">{{ gBusy?'...':t('apply_reload') }}</button>
        </div>
      </div>
    </template>
    <div v-else class="card">
      <p class="muted">{{ t('edit_ini_reload') }} — SSH mode. Edit file di server remote lalu klik <strong>{{ t('reload_config') }}</strong>.</p>
    </div>
  </div>
</template>
