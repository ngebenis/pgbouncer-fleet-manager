<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  sub?: string
  color?: 'ok' | 'warn' | 'danger' | 'accent' | 'purple' | 'neutral'
}>()
</script>
<template>
  <div class="metric-card" :class="`mc-${color ?? 'neutral'}`">
    <div class="mc-label">{{ label }}</div>
    <div class="mc-value">{{ value }}</div>
    <div v-if="sub" class="mc-sub">{{ sub }}</div>
  </div>
</template>
<style scoped>
.metric-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1rem 1.2rem;display:flex;flex-direction:column;gap:.25rem;min-width:130px}
.mc-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-dim);font-weight:600}
.mc-value{font-size:1.8rem;font-weight:700;line-height:1.1}
.mc-sub{font-size:.75rem;color:var(--text-dim)}
.mc-ok   .mc-value{color:var(--ok)}
.mc-warn .mc-value{color:var(--warn)}
.mc-danger .mc-value{color:var(--danger)}
.mc-accent .mc-value{color:var(--accent)}
.mc-purple .mc-value{color:var(--purple)}
.mc-neutral .mc-value{color:var(--text)}
.mc-ok{border-color:rgba(34,197,94,.2)}
.mc-warn{border-color:rgba(245,158,11,.2)}
.mc-danger{border-color:rgba(239,68,68,.2)}
.mc-accent{border-color:rgba(56,189,248,.2)}
</style>
