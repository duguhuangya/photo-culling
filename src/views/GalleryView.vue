<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePhotoStore } from '@/stores/photoStore'
import type { Photo } from '@/stores/photoStore'
import { useKeyboard } from '@/composables/useKeyboard'
import PhotoCard from '@/components/PhotoCard.vue'
import PhotoViewer from '@/components/PhotoViewer.vue'
import StatusBar from '@/components/StatusBar.vue'

const router = useRouter()
const store = usePhotoStore()
const activeIndex = ref(-1)
const viewerVisible = ref(false)
const filter = ref<'all' | 'selected' | 'rejected' | 'starred' | 'none'>('all')

const filters: { key: typeof filter.value; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'none', label: '未标记' },
  { key: 'selected', label: '选中' },
  { key: 'rejected', label: '淘汰' },
  { key: 'starred', label: '收藏' },
]

const filtered = computed(() => {
  if (filter.value === 'all') return store.photos
  return store.photos.filter(p => p.status === filter.value)
})

const stats = computed(() => {
  const all = store.photos
  return {
    total: all.length,
    selected: all.filter(p => p.status === 'selected').length,
    rejected: all.filter(p => p.status === 'rejected').length,
    starred: all.filter(p => p.status === 'starred').length,
    none: all.filter(p => p.status === 'none').length,
  }
})

const activePhoto = computed(() => activeIndex.value >= 0 ? filtered.value[activeIndex.value] : null)

function openViewer(index: number) {
  activeIndex.value = index
  viewerVisible.value = true
}

function closeViewer() {
  viewerVisible.value = false
}

function next() {
  if (activeIndex.value < filtered.value.length - 1) activeIndex.value++
}

function prev() {
  if (activeIndex.value > 0) activeIndex.value--
}

function onDrop(e: DragEvent) {
  // 空状态拖拽上传占位，如需支持可引入 imageLoader
}

const { onKeyMap } = useKeyboard()
onKeyMap({
  onPrev: prev,
  onNext: next,
  onSelect: () => activePhoto.value && store.setStatus(activePhoto.value.id, 'selected'),
  onReject: () => activePhoto.value && store.setStatus(activePhoto.value.id, 'rejected'),
  onStar: () => activePhoto.value && store.toggleStar(activePhoto.value.id),
  onRating: (n: 0|1|2|3|4|5) => activePhoto.value && store.setRating(activePhoto.value.id, n),
  onUndo: () => store.undo(),
  onRedo: () => store.redo(),
  onDelete: () => activePhoto.value && store.removePhotos([activePhoto.value.id]),
  onExport: () => router.push('/export'),
})
</script>

<template>
  <div class="h-screen flex flex-col bg-[#0a0a0a]">
    <!-- 工具栏 -->
    <div class="flex items-center gap-1 px-4 py-3 border-b border-[#2a2a2a] shrink-0">
      <button
        v-for="f in filters"
        :key="f.key"
        class="px-3 py-1.5 rounded-lg text-sm transition"
        :class="filter === f.key ? 'bg-[#3b82f6] text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'"
        @click="filter = f.key"
      >
        {{ f.label }}
        <span class="ml-1 text-xs opacity-60">
          {{ f.key === 'all' ? stats.total : stats[f.key as keyof typeof stats] }}
        </span>
      </button>
    </div>

    <!-- 照片网格 -->
    <div class="flex-1 overflow-y-auto p-4">
      <div
        v-if="filtered.length"
        class="grid gap-3"
        style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))"
      >
        <PhotoCard
          v-for="(photo, i) in filtered"
          :key="photo.id"
          :photo="photo"
          :active="activeIndex === i && viewerVisible"
          @click="openViewer(i)"
          @set-status="(s: Photo['status']) => store.setStatus(photo.id, s)"
          @set-rating="(r: 0|1|2|3|4|5) => store.setRating(photo.id, r)"
          @toggle-star="store.toggleStar(photo.id)"
          @delete="store.removePhotos([photo.id])"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="h-full flex flex-col items-center justify-center text-white/30">
        <div class="text-5xl mb-4">📷</div>
        <div class="text-lg">{{ filter === 'all' ? '拖拽照片到此处上传' : '暂无该分类照片' }}</div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <StatusBar :stats="stats" />

    <!-- 全屏查看器 -->
    <PhotoViewer
      v-if="activePhoto"
      :photo="activePhoto"
      :visible="viewerVisible"
      @close="closeViewer"
      @next="next"
      @prev="prev"
      @set-status="(s: Photo['status']) => store.setStatus(activePhoto!.id, s)"
      @set-rating="(r: 0|1|2|3|4|5) => store.setRating(activePhoto!.id, r)"
      @toggle-star="store.toggleStar(activePhoto!.id)"
    />
  </div>
</template>
