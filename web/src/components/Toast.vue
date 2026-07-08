<script setup lang="ts">
import { useToast } from '../composables/useToast'
const { toasts, remove } = useToast()
</script>
<template>
  <div class="toast-wrap">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        :class="`toast-${t.type}`"
        @click="remove(t.id)"
      >
        <span class="toast-icon">
          {{ t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warn' ? '⚠' : 'ℹ' }}
        </span>
        {{ t.message }}
      </div>
    </TransitionGroup>
  </div>
</template>
<style scoped>
.toast-wrap{position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;min-width:280px;max-width:400px}
.toast{display:flex;align-items:flex-start;gap:.6rem;padding:.65rem 1rem;border-radius:9px;font-size:.83rem;cursor:pointer;border:1px solid transparent;backdrop-filter:blur(4px)}
.toast-success{background:rgba(15,30,20,.92);border-color:rgba(34,197,94,.3);color:#4ade80}
.toast-error{background:rgba(30,15,15,.92);border-color:rgba(239,68,68,.3);color:#f87171}
.toast-warn{background:rgba(30,25,10,.92);border-color:rgba(245,158,11,.3);color:#fbbf24}
.toast-info{background:rgba(10,20,35,.92);border-color:rgba(56,189,248,.3);color:#38bdf8}
.toast-icon{font-weight:700;flex-shrink:0}
.toast-enter-active,.toast-leave-active{transition:all .25s ease}
.toast-enter-from{opacity:0;transform:translateX(40px)}
.toast-leave-to{opacity:0;transform:translateX(40px)}
</style>
