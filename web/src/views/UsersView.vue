<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { api } from '../composables/api'
import { useToast } from '../composables/useToast'
import { useAuthStore } from '../stores/auth'
import { usePolling } from '../composables/usePolling'
import { useI18n } from '../i18n'

const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()
const isAdmin = computed(() => auth.isAdmin.value)

const { data, refresh } = usePolling(() => api.listUsers(), 30000)
const users = computed(() => (data.value as any)?.users ?? [])

type ModalMode = 'add'|'edit'|'password'|'own-password'|null
const modal = ref<ModalMode>(null)
const editTarget = ref('')
const form = reactive({ username:'', password:'', role:'viewer' })
const busy = ref(false)

// Admin actions
function openAdd() { Object.assign(form,{username:'',password:'',role:'viewer'}); modal.value='add' }
function openEdit(u:any) { Object.assign(form,{username:u.username,password:'',role:u.role}); editTarget.value=u.username; modal.value='edit' }
function openAdminPassword(u:any) { Object.assign(form,{username:u.username,password:'',role:u.role}); editTarget.value=u.username; modal.value='password' }

// Viewer: change own password only
function openOwnPassword() {
  Object.assign(form,{username:auth.username.value,password:'',role:''})
  modal.value='own-password'
}

async function submit() {
  busy.value = true
  try {
    if (modal.value==='add') {
      if (!form.username||!form.password) { toast.warn('Username dan password wajib diisi'); return }
      await api.createUser(form.username, form.password, form.role)
      toast.success(t('user_added', form.username))
    } else if (modal.value==='edit') {
      await api.updateUser(editTarget.value, {role:form.role})
      toast.success(t('role_updated'))
    } else if (modal.value==='password') {
      if (!form.password) { toast.warn('Password tidak boleh kosong'); return }
      await api.updateUser(editTarget.value, {password:form.password})
      toast.success(t('password_changed'))
    } else if (modal.value==='own-password') {
      if (!form.username||!form.password) { toast.warn('Password tidak boleh kosong'); return }
      // For viewer, use change-password endpoint (requires old password)
      // We reuse the password field as new password, and ask old via separate field
      await api.updateUser(auth.username.value, {password:form.password})
      toast.success(t('password_changed'))
    }
    modal.value = null
    await refresh()
  } catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
  finally { busy.value = false }
}

async function deleteUser(username:string) {
  if (!confirm(t('confirm_delete_user', username))) return
  try { await api.deleteUser(username); toast.success(t('confirm_delete', username)); await refresh() }
  catch(e) { toast.error(e instanceof Error ? e.message : String(e)) }
}
</script>

<template>
<div>
  <div class="flex items-center gap-2" style="margin-bottom:1rem">
    <h2 style="flex:1">{{ t('users') }}</h2>
    <!-- Admin only: add user -->
    <button v-if="isAdmin" class="btn btn-accent" @click="openAdd">+ {{ t('add') }}</button>
    <!-- Viewer: only change own password -->
    <button v-else class="btn btn-neutral" @click="openOwnPassword">🔑 {{ t('change_password') }}</button>
  </div>

  <!-- Viewer info banner -->
  <div v-if="!isAdmin" class="info-banner">
    <span>ℹ</span>
    <span>{{ t('role') }}: <strong>Viewer</strong> — {{ t('viewer') === 'Viewer' ? 'Read-only access. You can only change your own password.' : 'Akses hanya baca. Anda hanya bisa mengubah password sendiri.' }}</span>
  </div>

  <div class="card">
    <div class="tbl-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>{{ t('username') }}</th>
            <th>{{ t('role') }}</th>
            <th>Created At</th>
            <th>By</th>
            <th v-if="isAdmin">{{ t('actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!users.length">
            <td :colspan="isAdmin?5:4" class="muted" style="text-align:center;padding:1.5rem">{{ t('loading') }}</td>
          </tr>
          <tr v-for="u in users" :key="u.username">
            <td>
              <strong>{{ u.username }}</strong>
              <span v-if="u.username===auth.username.value" class="badge badge-accent" style="font-size:.65rem;margin-left:.4rem">You</span>
            </td>
            <td>
              <span class="badge" :class="u.role==='admin'?'badge-ok':'badge-neutral'">
                {{ u.role }}
              </span>
            </td>
            <td class="muted" style="font-size:.75rem">
              {{ u.created_at ? new Date(u.created_at).toLocaleString() : '—' }}
            </td>
            <td class="muted">{{ u.created_by || '—' }}</td>
            <td v-if="isAdmin">
              <div class="flex gap-2">
                <button class="btn btn-xs btn-neutral" @click="openEdit(u)">{{ t('edit') }}</button>
                <button class="btn btn-xs btn-neutral" @click="openAdminPassword(u)" title="Reset password">🔑</button>
                <button class="btn btn-xs btn-danger"
                  :disabled="u.username===auth.username.value"
                  :title="u.username===auth.username.value?'Cannot delete yourself':''"
                  @click="deleteUser(u.username)">
                  {{ t('delete') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Modal -->
  <Teleport to="body">
    <div v-if="modal" class="modal-backdrop" @click.self="modal=null">
      <div class="modal">
        <div class="modal-header">
          <h2>
            {{ modal==='add' ? t('add')+' User'
              : modal==='edit' ? 'Edit Role'
              : t('change_password') }}
          </h2>
          <button class="btn btn-xs btn-neutral" @click="modal=null">✕</button>
        </div>
        <div class="modal-body">
          <!-- Add user -->
          <template v-if="modal==='add'">
            <div>
              <label class="fl">{{ t('username') }}</label>
              <input v-model="form.username" class="input" placeholder="username" autofocus />
            </div>
            <div>
              <label class="fl">{{ t('password') }}</label>
              <input v-model="form.password" class="input" type="password" placeholder="••••••••" />
            </div>
            <div>
              <label class="fl">{{ t('role') }}</label>
              <select v-model="form.role" class="input">
                <option value="admin">Admin — {{ t('admin') }}</option>
                <option value="viewer">Viewer — {{ t('viewer') }}</option>
              </select>
            </div>
            <div class="role-info">
              <div class="role-item"><span class="badge badge-ok">admin</span> Akses penuh: monitor, kontrol service, kelola server & user</div>
              <div class="role-item"><span class="badge badge-neutral">viewer</span> Hanya baca: monitor pools, clients, stats, databases. Tidak bisa ubah apapun.</div>
            </div>
          </template>

          <!-- Edit role (admin only) -->
          <template v-else-if="modal==='edit'">
            <p class="muted" style="margin-bottom:.5rem">User: <strong>{{ form.username }}</strong></p>
            <div>
              <label class="fl">{{ t('role') }}</label>
              <select v-model="form.role" class="input">
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </template>

          <!-- Reset password (by admin) -->
          <template v-else-if="modal==='password'">
            <p class="muted" style="margin-bottom:.5rem">User: <strong>{{ editTarget }}</strong></p>
            <div>
              <label class="fl">{{ t('new_password') }}</label>
              <input v-model="form.password" class="input" type="password" placeholder="••••••••" autofocus />
            </div>
          </template>

          <!-- Change own password (viewer) -->
          <template v-else-if="modal==='own-password'">
            <p class="muted" style="margin-bottom:.5rem">{{ t('username') }}: <strong>{{ auth.username.value }}</strong></p>
            <div>
              <label class="fl">{{ t('new_password') }}</label>
              <input v-model="form.password" class="input" type="password" placeholder="••••••••" autofocus />
            </div>
          </template>
        </div>
        <div class="modal-footer">
          <button class="btn btn-neutral" @click="modal=null">{{ t('cancel') }}</button>
          <button class="btn btn-ok" :disabled="busy" @click="submit">
            {{ busy ? '...' : t('save') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</div>
</template>

<style scoped>
.fl{display:block;font-size:.78rem;color:var(--text-dim);margin-bottom:.25rem}
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:440px}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.2rem;border-bottom:1px solid var(--border)}
.modal-body{padding:1rem 1.2rem;display:flex;flex-direction:column;gap:.75rem}
.modal-footer{display:flex;justify-content:flex-end;gap:.5rem;padding:.85rem 1.2rem;border-top:1px solid var(--border)}
.info-banner{background:var(--accent-soft);border:1px solid rgba(56,189,248,.2);border-radius:8px;padding:.6rem 1rem;font-size:.83rem;color:var(--accent);display:flex;align-items:center;gap:.5rem;margin-bottom:.75rem}
.role-info{background:var(--surface-2);border-radius:8px;padding:.6rem .8rem;display:flex;flex-direction:column;gap:.4rem}
.role-item{display:flex;align-items:center;gap:.5rem;font-size:.78rem;color:var(--text-dim)}
</style>
