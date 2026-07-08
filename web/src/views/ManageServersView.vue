<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { api, serverApi } from '../composables/api'
import { useToast } from '../composables/useToast'
import { useServerStore } from '../stores/server'
import { useI18n } from '../i18n'
import type { ServerForm } from '../composables/api'

const store = useServerStore()
const toast = useToast()
const { t } = useI18n()

onMounted(async () => {
  try { const res = await api.listServers(); store.setServers(res.servers) }
  catch(e) { toast.error('Gagal memuat daftar server') }
})

type ModalMode = 'add'|'edit'|null
const modalMode = ref<ModalMode>(null)
const editId = ref('')
const busy = ref(false)
const testingId = ref<string|null>(null)
const testResult = ref<Record<string,{ok:boolean;msg:string}>>({})

const emptyForm = (): ServerForm => ({
  id:'', label:'', admin_host:'', admin_port:'6432',
  admin_user:'pgbouncer_admin', admin_pass:'',
  ini_path:'', service_name:'pgbouncer', control_mode:'ssh',
  ssh_host:'', ssh_port:'22', ssh_user:'pgbouncer_ctl',
  ssh_key_path:'/run/secrets/pgb_ssh_key', ssh_use_sudo:true,
})
const form = reactive<ServerForm>(emptyForm())

function openAdd() { Object.assign(form, emptyForm()); modalMode.value='add' }

function openEdit(id:string) {
  const inst = store.servers.value.find(s=>s.id===id)
  if (!inst) return
  Object.assign(form, emptyForm())
  form.id=inst.id; form.label=inst.label
  form.admin_host=inst.host; form.admin_port=inst.port
  form.admin_pass=''
  editId.value=id; modalMode.value='edit'
}
function closeModal() { modalMode.value=null }

function validate(): string|null {
  if (!form.id.trim()) return 'ID wajib diisi'
  if (!/^[a-z0-9_-]+$/.test(form.id)) return 'ID hanya boleh huruf kecil, angka, - dan _'
  if (!form.label.trim()) return t('label')+' wajib diisi'
  if (!form.admin_host.trim()) return t('admin_host')+' wajib diisi'
  if (form.control_mode==='ssh'&&!form.ssh_host.trim()) return t('ssh_host')+' wajib diisi'
  if (form.control_mode==='ssh'&&!form.ssh_user.trim()) return t('ssh_user')+' wajib diisi'
  if (modalMode.value==='add'&&!form.admin_pass.trim()) return t('admin_password')+' wajib diisi'
  return null
}

async function submit() {
  const err = validate()
  if (err) { toast.warn(err); return }
  busy.value=true
  try {
    if (modalMode.value==='add') {
      await serverApi.addServer({...form})
      toast.success(t('server_added', form.label))
    } else {
      await serverApi.updateServer(editId.value, {...form})
      toast.success(t('server_updated', form.label))
    }
    const res = await api.listServers(); store.setServers(res.servers)
    closeModal()
  } catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { busy.value=false }
}

async function deleteServer(id:string, label:string) {
  if (!confirm(t('confirm_delete', label))) return
  try {
    await serverApi.deleteServer(id)
    toast.success(t('server_deleted', label))
    const res = await api.listServers(); store.setServers(res.servers)
    if (store.activeId.value===id&&store.servers.value.length>0) store.setActive(store.servers.value[0].id)
  } catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
}

async function testConnection(id:string) {
  testingId.value=id
  testResult.value[id]={ok:false, msg:t('loading')}
  try {
    const res = await serverApi.testServer(id)
    testResult.value[id]={ok:res.ok, msg:res.ok?`✓ ${t('connected')} · ${res.version}`:`✕ ${res.error}`}
  } catch(e) {
    testResult.value[id]={ok:false, msg:`✕ ${e instanceof Error?e.message:String(e)}`}
  } finally { testingId.value=null }
}

const showPass = ref(false)
const isSSH = computed(() => form.control_mode==='ssh')
</script>

<template>
  <div>
    <div class="flex items-center gap-2" style="margin-bottom:1rem">
      <h2 style="flex:1">{{ t('server_list') }}</h2>
      <button class="btn btn-accent" @click="openAdd">+ {{ t('add_server') }}</button>
    </div>

    <div class="server-grid">
      <div v-for="s in store.servers.value" :key="s.id"
        class="server-card" :class="{active: store.activeId.value===s.id}">
        <div class="sc-top">
          <div>
            <div class="sc-label">{{ s.label }}</div>
            <div class="sc-host">{{ s.host }}:{{ s.port }}</div>
            <div class="sc-id muted">id: {{ s.id }}</div>
          </div>
          <span class="badge" :class="s.control_mode==='ssh'?'badge-accent':'badge-neutral'">
            {{ s.control_mode?.toUpperCase()||'LOCAL' }}
          </span>
        </div>
        <div v-if="testResult[s.id]" class="test-result" :class="testResult[s.id].ok?'test-ok':'test-err'">
          {{ testResult[s.id].msg }}
        </div>
        <div class="sc-actions">
          <button class="btn btn-xs btn-neutral" :disabled="testingId===s.id" @click="testConnection(s.id)">
            {{ testingId===s.id?t('loading')+'...':'⚡ '+t('test') }}
          </button>
          <button class="btn btn-xs btn-accent" @click="store.setActive(s.id)">
            {{ store.activeId.value===s.id?'✓ '+t('active'):t('active') }}
          </button>
          <button class="btn btn-xs btn-neutral" @click="openEdit(s.id)">✏ {{ t('edit') }}</button>
          <button class="btn btn-xs btn-danger"
            :disabled="store.servers.value.length<=1"
            @click="deleteServer(s.id, s.label)">
            🗑 {{ t('delete') }}
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="modalMode" class="modal-backdrop" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ modalMode==='add'?t('add_server'):t('edit_server') }}</h2>
            <button class="btn btn-xs btn-neutral" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">

            <!-- Basic info -->
            <div class="field-group">
              <div class="group-title">{{ t('server_label') }} & ID</div>
              <div class="field-row">
                <div class="field">
                  <label>{{ t('server_id') }} <span class="req">*</span></label>
                  <input v-model="form.id" class="input" placeholder="e.g. prd01" :readonly="modalMode==='edit'" />
                  <span class="hint">{{ t('id_hint') }}</span>
                </div>
                <div class="field">
                  <label>{{ t('label') }} <span class="req">*</span></label>
                  <input v-model="form.label" class="input" placeholder="e.g. Production 01" />
                </div>
              </div>
            </div>

            <!-- Admin console -->
            <div class="field-group">
              <div class="group-title">{{ t('admin_host') }} / Admin Console</div>
              <div class="field-row">
                <div class="field" style="flex:2">
                  <label>{{ t('admin_host') }} <span class="req">*</span></label>
                  <input v-model="form.admin_host" class="input" placeholder="10.0.0.10" />
                </div>
                <div class="field" style="flex:1">
                  <label>{{ t('admin_port') }}</label>
                  <input v-model="form.admin_port" class="input" placeholder="6432" />
                </div>
              </div>
              <div class="field-row">
                <div class="field">
                  <label>{{ t('admin_user') }}</label>
                  <input v-model="form.admin_user" class="input" placeholder="pgbouncer_admin" />
                </div>
                <div class="field">
                  <label>{{ t('admin_password') }} <span v-if="modalMode==='edit'" class="muted" style="font-size:.7rem">{{ t('password_keep') }}</span><span v-else class="req">*</span></label>
                  <div style="position:relative;display:flex">
                    <input v-model="form.admin_pass" class="input" :type="showPass?'text':'password'" placeholder="••••••••" style="padding-right:2.5rem" />
                    <button class="btn btn-xs btn-neutral" style="position:absolute;right:.35rem;top:50%;transform:translateY(-50%);border:none;background:transparent" @click="showPass=!showPass">{{ showPass?'🙈':'👁' }}</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Service control -->
            <div class="field-group">
              <div class="group-title">{{ t('control_mode') }}</div>
              <div class="field-row">
                <div class="field">
                  <label>{{ t('control_mode') }}</label>
                  <select v-model="form.control_mode" class="input">
                    <option value="ssh">{{ t('control_ssh') }}</option>
                    <option value="local">{{ t('control_local') }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>{{ t('service_name') }}</label>
                  <input v-model="form.service_name" class="input" placeholder="pgbouncer" />
                </div>
              </div>
              <template v-if="isSSH">
                <div class="field-row">
                  <div class="field" style="flex:2">
                    <label>{{ t('ssh_host') }} <span class="req">*</span></label>
                    <input v-model="form.ssh_host" class="input" placeholder="10.0.0.10" />
                  </div>
                  <div class="field" style="flex:1">
                    <label>{{ t('ssh_port') }}</label>
                    <input v-model="form.ssh_port" class="input" placeholder="22" />
                  </div>
                </div>
                <div class="field-row">
                  <div class="field">
                    <label>{{ t('ssh_user') }} <span class="req">*</span></label>
                    <input v-model="form.ssh_user" class="input" placeholder="pgbouncer_ctl" />
                  </div>
                  <div class="field">
                    <label>{{ t('ssh_key_path') }}</label>
                    <input v-model="form.ssh_key_path" class="input" placeholder="/run/secrets/pgb_ssh_key" />
                    <span class="hint">{{ t('key_hint') }}</span>
                  </div>
                </div>
                <div class="field">
                  <label style="display:flex;align-items:center;gap:.4rem;font-size:.82rem;cursor:pointer">
                    <input type="checkbox" v-model="form.ssh_use_sudo" />
                    {{ t('use_sudo') }}
                  </label>
                </div>
              </template>
            </div>

            <!-- Optional -->
            <div class="field-group">
              <div class="group-title">{{ t('ini_path') }}</div>
              <div class="field">
                <input v-model="form.ini_path" class="input" placeholder="/etc/pgbouncer/pgbouncer.ini" />
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn btn-neutral" @click="closeModal">{{ t('cancel') }}</button>
            <button class="btn btn-ok" :disabled="busy" @click="submit">
              {{ busy?t('loading'):modalMode==='add'?t('add'):t('save') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.server-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:.75rem}
.server-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1rem 1.1rem;display:flex;flex-direction:column;gap:.65rem;transition:border-color .15s}
.server-card.active{border-color:var(--accent)}
.sc-top{display:flex;justify-content:space-between;align-items:flex-start}
.sc-label{font-size:.95rem;font-weight:600}.sc-host{font-family:monospace;font-size:.78rem;color:var(--accent);margin-top:.15rem}.sc-id{font-size:.72rem;margin-top:.1rem}
.sc-actions{display:flex;gap:.4rem;flex-wrap:wrap}
.test-result{font-size:.75rem;padding:.3rem .6rem;border-radius:6px;font-family:monospace}
.test-ok{background:var(--ok-soft);color:var(--ok)}.test-err{background:var(--danger-soft);color:var(--danger)}
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(3px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:640px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.2rem;border-bottom:1px solid var(--border)}
.modal-body{overflow-y:auto;padding:1rem 1.2rem;display:flex;flex-direction:column;gap:.75rem}
.modal-footer{display:flex;justify-content:flex-end;gap:.5rem;padding:.85rem 1.2rem;border-top:1px solid var(--border)}
.field-group{border:1px solid var(--border);border-radius:9px;padding:.75rem 1rem;display:flex;flex-direction:column;gap:.6rem}
.group-title{font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-dim);font-weight:600}
.field-row{display:flex;gap:.6rem;flex-wrap:wrap}
.field{display:flex;flex-direction:column;gap:.25rem;flex:1;min-width:160px}
.field label{font-size:.78rem;color:var(--text-dim);font-weight:500}
.req{color:var(--danger)}.hint{font-size:.7rem;color:var(--text-muted)}
</style>
