import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warn' | 'info'

export interface Toast { id: number; type: ToastType; message: string }

const toasts = ref<Toast[]>([])
let nextId = 1

export function useToast() {
  function push(type: ToastType, message: string, duration = 4000) {
    const id = nextId++
    toasts.value.push({ id, type, message })
    setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, duration)
  }

  return {
    toasts,
    success: (msg: string) => push('success', msg),
    error:   (msg: string) => push('error', msg, 6000),
    warn:    (msg: string) => push('warn', msg),
    info:    (msg: string) => push('info', msg),
    remove:  (id: number) => { toasts.value = toasts.value.filter(t => t.id !== id) },
  }
}
