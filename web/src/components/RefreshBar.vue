<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../i18n'

const { t } = useI18n()
const props = defineProps<{ lastUpdated: Date|null; paused: boolean; intervalMs: number }>()
const emit = defineEmits<{
  (e:'refresh'):void
  (e:'toggle-pause'):void
  (e:'change-interval', ms:number):void
}>()
const intervals = [{label:'3s',ms:3000},{label:'5s',ms:5000},{label:'10s',ms:10000},{label:'30s',ms:30000}]
const ago = computed(() => {
  if (!props.lastUpdated) return '—'
  const secs = Math.floor((Date.now()-props.lastUpdated.getTime())/1000)
  return secs<5 ? t('just_now') : `${secs}s ${t('updated').toLowerCase()}`
})
</script>
<template>
  <div class="refresh-bar">
    <span class="muted" style="font-size:.75rem">{{ t('updated') }}: {{ ago }}</span>
    <div class="flex gap-2 items-center">
      <select class="input" style="width:auto;padding:.25rem .5rem;font-size:.75rem"
        :value="intervalMs" @change="e => emit('change-interval', Number((e.target as HTMLSelectElement).value))">
        <option v-for="i in intervals" :key="i.ms" :value="i.ms">{{ i.label }}</option>
      </select>
      <button class="btn btn-xs" :class="paused?'btn-warn':'btn-neutral'" @click="emit('toggle-pause')">
        {{ paused?'▶ '+t('resume'):'⏸ Pause' }}
      </button>
      <button class="btn btn-xs btn-accent" @click="emit('refresh')">↻ {{ t('refresh') }}</button>
    </div>
  </div>
</template>
<style scoped>
.refresh-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;flex-wrap:wrap;gap:.5rem}
</style>
