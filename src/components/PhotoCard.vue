<script setup lang="ts">
import type { Photo } from '@/stores/photoStore'

const props = defineProps<{
  photo: Photo
  active: boolean
}>()

const emit = defineEmits<{
  click: []
  setStatus: [status: Photo['status']]
  setRating: [rating: 0|1|2|3|4|5]
  toggleStar: []
  delete: []
}>()

const statusIcon: Record<Photo['status'], string> = {
  none: '',
  selected: '✅',
  rejected: '❌',
  starred: '⭐',
}

const statusColor: Record<Photo['status'], string> = {
  none: '',
  selected: '#22c55e',
  rejected: '#ef4444',
  starred: '#eab308',
}
</script>

<template>
  <div
    class="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 bg-[#141414] border-2"
    :class="active ? 'border-[#3b82f6]' : 'border-transparent hover:border-white/20'"
    :style="photo.status !== 'none' ? { borderColor: statusColor[photo.status] + '80' } : {}"
    @click="emit('click')"
  >
    <!-- 缩略图 -->
    <div class="aspect-square overflow-hidden">
      <img :src="photo.thumbnail" :alt="photo.name" class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
    </div>

    <!-- 状态角标 -->
    <div v-if="photo.status !== 'none'" class="absolute top-2 left-2 text-lg drop-shadow-lg">
      {{ statusIcon[photo.status] }}
    </div>

    <!-- 评分 -->
    <div v-if="photo.rating > 0" class="absolute top-2 right-2 flex gap-0.5">
      <span v-for="i in photo.rating" :key="i" class="text-yellow-400 text-xs">★</span>
    </div>

    <!-- 底部信息 -->
    <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
      <div class="text-white/80 text-xs truncate">{{ photo.name }}</div>
    </div>

    <!-- Hover 操作按钮 -->
    <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" :class="{ 'right-10': photo.rating > 0 }">
      <button
        class="w-7 h-7 rounded-md bg-black/60 text-xs flex items-center justify-center hover:bg-[#22c55e]/80"
        title="选中"
        @click.stop="emit('setStatus', 'selected')"
      >✓</button>
      <button
        class="w-7 h-7 rounded-md bg-black/60 text-xs flex items-center justify-center hover:bg-[#ef4444]/80"
        title="淘汰"
        @click.stop="emit('setStatus', 'rejected')"
      >✗</button>
      <button
        class="w-7 h-7 rounded-md bg-black/60 text-xs flex items-center justify-center hover:bg-[#eab308]/80"
        title="收藏"
        @click.stop="emit('toggleStar')"
      >★</button>
      <button
        class="w-7 h-7 rounded-md bg-black/60 text-xs flex items-center justify-center hover:bg-white/30"
        title="删除"
        @click.stop="emit('delete')"
      >🗑</button>
    </div>
  </div>
</template>
