<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import type { Photo } from '@/stores/photoStore'

const props = defineProps<{
  photo: Photo
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  next: []
  prev: []
  setStatus: [status: Photo['status']]
  setRating: [rating: 0|1|2|3|4|5]
  toggleStar: []
}>()

function onKey(e: KeyboardEvent) {
  if (!props.visible) return
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowRight') emit('next')
  if (e.key === 'ArrowLeft') emit('prev')
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

const ratingStars = [1, 2, 3, 4, 5] as const
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        @click.self="emit('close')"
      >
        <!-- 左箭头 -->
        <button
          class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white text-2xl flex items-center justify-center hover:bg-white/20 transition"
          @click="emit('prev')"
        >‹</button>

        <!-- 图片 -->
        <div class="max-w-[90vw] max-h-[85vh] flex items-center justify-center">
          <img
            :src="photo.fullSrc"
            :alt="photo.name"
            class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
          />
        </div>

        <!-- 右箭头 -->
        <button
          class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white text-2xl flex items-center justify-center hover:bg-white/20 transition"
          @click="emit('next')"
        >›</button>

        <!-- 底部工具栏 -->
        <div class="absolute bottom-0 inset-x-0 flex items-center justify-center gap-3 py-4 bg-gradient-to-t from-black/80 to-transparent">
          <button
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
            :class="photo.status === 'selected' ? 'bg-[#22c55e] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'"
            @click="emit('setStatus', 'selected')"
          >✓ 选中</button>

          <button
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
            :class="photo.status === 'rejected' ? 'bg-[#ef4444] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'"
            @click="emit('setStatus', 'rejected')"
          >✗ 淘汰</button>

          <button
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
            :class="photo.status === 'starred' ? 'bg-[#eab308] text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'"
            @click="emit('toggleStar')"
          >★ 收藏</button>

          <div class="w-px h-6 bg-white/20 mx-1" />

          <div class="flex gap-1">
            <button
              v-for="n in ratingStars"
              :key="n"
              class="w-8 h-8 rounded-md text-sm flex items-center justify-center transition"
              :class="n <= photo.rating ? 'bg-[#eab308]/30 text-yellow-400' : 'bg-white/5 text-white/30 hover:bg-white/10'"
              @click="emit('setRating', n)"
            >★</button>
          </div>

          <div class="w-px h-6 bg-white/20 mx-1" />

          <span class="text-white/40 text-sm">{{ photo.name }}</span>
        </div>

        <!-- 关闭按钮 -->
        <button
          class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition text-lg"
          @click="emit('close')"
        >✕</button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
