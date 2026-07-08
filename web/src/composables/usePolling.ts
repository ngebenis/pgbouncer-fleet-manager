import { ref, onMounted, onUnmounted, watch } from 'vue'

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs = 5000,
  autoStart = true,
) {
  const data    = ref<T | null>(null) as { value: T | null }
  const loading = ref(true)
  const error   = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const paused  = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  async function tick() {
    if (document.hidden || paused.value) return
    try {
      data.value = await fetcher()
      error.value = null
      lastUpdated.value = new Date()
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  function start() {
    if (timer) clearInterval(timer)
    tick()
    timer = setInterval(tick, intervalMs)
  }

  function stop() { if (timer) { clearInterval(timer); timer = null } }

  onMounted(() => { if (autoStart) start() })
  onUnmounted(() => stop())

  return { data, loading, error, lastUpdated, paused, refresh: tick, start, stop }
}
