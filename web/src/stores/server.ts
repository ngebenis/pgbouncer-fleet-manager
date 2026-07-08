import { ref, computed } from 'vue'
import type { ServerInfo } from '../types/api'
const servers = ref<ServerInfo[]>([])
const activeId = ref<string>('')
export function useServerStore() {
  const activeServer = computed(() => servers.value.find(s => s.id === activeId.value) ?? null)
  function setServers(list: ServerInfo[]) {
    servers.value = list
    if (!activeId.value && list.length > 0) activeId.value = list[0].id
  }
  function setActive(id: string) { activeId.value = id }
  return { servers, activeId, activeServer, setServers, setActive }
}
