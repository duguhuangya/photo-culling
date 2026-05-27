<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePhotoStore } from '@/stores/photoStore'

const router = useRouter()
const store = usePhotoStore()
const isDragging = ref(false)
const loading = ref(false)
const loadingCount = ref(0)

const ACCEPT = ['.jpg', '.jpeg', '.png', '.webp']
const MAX_COUNT = 500

function isAcceptable(file: File) {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  return ACCEPT.includes(ext)
}

async function handleFiles(rawFiles: File[]) {
  const valid = rawFiles.filter(isAcceptable)
  if (!valid.length) return
  if (store.photos.length + valid.length > MAX_COUNT) {
    alert(`最多支持 ${MAX_COUNT} 张照片`)
    return
  }
  loading.value = true
  loadingCount.value = 0
  for (const file of valid) {
    loadingCount.value++
  }
  await store.addPhotos(valid)
  loading.value = false
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? [])
  handleFiles(files)
}

function onInput(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  handleFiles(files)
}

function startCulling() {
  router.push('/gallery')
}
</script>

<template>
  <div class="h-screen flex flex-col items-center justify-center p-8 bg-[#0a0a0a]">
    <div
      class="w-full max-w-2xl h-72 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
      :class="isDragging ? 'border-[#3b82f6] bg-[#3b82f6]/10 scale-[1.02]' : 'border-white/30 hover:border-white/50 hover:bg-white/5'"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
      @click="($refs.input as HTMLInputElement).click()"
    >
      <input ref="input" type="file" multiple accept=".jpg,.jpeg,.png,.webp" class="hidden" @change="onInput" />
      <div class="text-5xl mb-4 opacity-60">📷</div>
      <div class="text-white/80 text-lg mb-2">{{ isDragging ? '松开以上传' : '拖拽照片到此处，或点击选择' }}</div>
      <div class="text-white/40 text-sm">支持 JPG / PNG / WEBP，最多 500 张</div>
    </div>

    <div v-if="loading" class="mt-6 text-white/60">
      正在加载中...
    </div>

    <div v-if="store.photos.length > 0" class="mt-8 flex items-center gap-6">
      <span class="text-white/50">已加载 <span class="text-white font-bold">{{ store.photos.length }}</span> 张照片</span>
      <button
        class="px-6 py-2.5 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#3b82f6]/80 transition disabled:opacity-40"
        :disabled="loading"
        @click="startCulling"
      >
        {{ loading ? '加载中...' : '开始选片' }}
      </button>
    </div>
  </div>
</template>
