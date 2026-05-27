<script setup lang="ts">
defineProps<{
  stats: { total: number; selected: number; rejected: number; starred: number; none: number }
}>()

const items = [
  { key: 'selected' as const, label: '已选', color: '#22c55e' },
  { key: 'rejected' as const, label: '淘汰', color: '#ef4444' },
  { key: 'starred' as const, label: '收藏', color: '#eab308' },
  { key: 'none' as const, label: '未标记', color: '#6b7280' },
]
</script>

<template>
  <div class="shrink-0 border-t border-[#2a2a2a] bg-[#0a0a0a] px-4 py-2.5">
    <div class="flex items-center gap-4 text-sm">
      <span class="text-white/60">共 <span class="text-white font-medium">{{ stats.total }}</span> 张</span>

      <div v-for="item in items" :key="item.key" class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full" :style="{ background: item.color }" />
        <span class="text-white/50">{{ item.label }}</span>
        <span class="text-white/80 font-medium">{{ stats[item.key] }}</span>
      </div>

      <div class="flex-1" />

      <!-- 进度条 -->
      <div v-if="stats.total > 0" class="w-40 h-2 rounded-full bg-white/10 overflow-hidden flex">
        <div class="h-full" :style="{ width: (stats.selected / stats.total * 100) + '%', background: '#22c55e' }" />
        <div class="h-full" :style="{ width: (stats.rejected / stats.total * 100) + '%', background: '#ef4444' }" />
        <div class="h-full" :style="{ width: (stats.starred / stats.total * 100) + '%', background: '#eab308' }" />
      </div>
    </div>
  </div>
</template>
