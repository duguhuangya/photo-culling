<template>
  <div class="export-view">
    <div v-if="exportPhotos.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <p class="empty-title">还没有标记照片，去选片吧</p>
      <button class="btn-primary" @click="$router.push('/gallery')">去选片</button>
    </div>

    <template v-else>
      <div class="export-header">
        <h2>导出预览</h2>
        <span class="badge">{{ exportPhotos.length }} 张</span>
      </div>

      <div class="photo-grid">
        <div v-for="photo in exportPhotos" :key="photo.id" class="photo-card">
          <img :src="photo.thumbnail" />
          <div v-if="photo.status === 'starred'" class="star-badge">⭐</div>
        </div>
      </div>

      <div class="export-options">
        <h3>导出选项</h3>

        <div class="option-group">
          <label>导出内容</label>
          <div class="option-btns">
            <button
              v-for="opt in contentOpts" :key="opt.value"
              :class="['opt-btn', { active: options.content === opt.value }]"
              @click="options.content = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>

        <div class="option-group">
          <label>图片质量</label>
          <div class="option-btns">
            <button
              v-for="opt in qualityOpts" :key="opt.value"
              :class="['opt-btn', { active: options.quality === opt.value }]"
              @click="options.quality = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>

        <div class="option-group">
          <label>文件命名</label>
          <div class="option-btns">
            <button
              v-for="opt in namingOpts" :key="opt.value"
              :class="['opt-btn', { active: options.naming === opt.value }]"
              @click="options.naming = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>
      </div>

      <div class="export-footer">
        <span class="stats">{{ exportPhotos.length }} 张照片，预计大小 ~{{ estimatedSize }}</span>
        <button class="btn-export" :disabled="exporting" @click="handleExport">
          {{ exporting ? '打包中...' : '导出 ZIP' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { usePhotoStore } from '@/stores/photoStore'
import { exportPhotos as zipExport } from '@/utils/zipExport'
import type { Photo } from '@/stores/photoStore'

const store = usePhotoStore()
const exporting = ref(false)

const options = reactive({
  content: 'selected' as 'selected' | 'starred' | 'all',
  quality: 'original' as 'original' | 'compressed',
  naming: 'original' as 'original' | 'index',
})

const contentOpts = [
  { label: '仅选中', value: 'selected' as const },
  { label: '选中+收藏', value: 'starred' as const },
  { label: '全部', value: 'all' as const },
]
const qualityOpts = [
  { label: '原图', value: 'original' as const },
  { label: '压缩', value: 'compressed' as const },
]
const namingOpts = [
  { label: '原名', value: 'original' as const },
  { label: '序号命名', value: 'index' as const },
]

const exportPhotos = computed<Photo[]>(() => {
  const photos = store.filteredPhotos
  if (options.content === 'selected') return photos.filter(p => p.status === 'selected')
  if (options.content === 'starred') return photos.filter(p => p.status === 'selected' || p.status === 'starred')
  return [...photos].sort((a, b) => b.rating - a.rating)
})

const estimatedSize = computed(() => {
  const avgMB = options.quality === 'compressed' ? 0.5 : 3
  const total = exportPhotos.value.length * avgMB
  return total > 1024 ? (total / 1024).toFixed(1) + ' GB' : total.toFixed(0) + ' MB'
})

async function handleExport() {
  if (exporting.value || exportPhotos.value.length === 0) return
  exporting.value = true
  try {
    await zipExport(exportPhotos.value, {
      quality: options.quality,
      naming: options.naming,
    })
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.export-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.export-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.export-header h2 { font-size: 20px; font-weight: 600; }

.badge {
  background: #3b82f6;
  color: #fff;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  margin-bottom: 32px;
}

.photo-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  background: #1a1a1a;
}

.photo-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.star-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
}

.export-options {
  background: #141414;
  border: 1px solid #222;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.export-options h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}

.option-group {
  margin-bottom: 16px;
}

.option-group label {
  display: block;
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}

.option-btns {
  display: flex;
  gap: 8px;
}

.opt-btn {
  padding: 8px 16px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #aaa;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.opt-btn.active {
  background: #1e3a5f;
  border-color: #3b82f6;
  color: #fff;
}

.opt-btn:hover:not(.active) {
  border-color: #555;
}

.export-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-top: 1px solid #222;
}

.stats { font-size: 14px; color: #777; }

.btn-export {
  padding: 10px 32px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-export:hover:not(:disabled) { background: #2563eb; }
.btn-export:disabled { opacity: 0.5; cursor: not-allowed; }

.empty-state {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.empty-icon { font-size: 48px; }
.empty-title { font-size: 20px; font-weight: 600; }

.btn-primary {
  margin-top: 8px;
  padding: 10px 28px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.btn-primary:hover { background: #2563eb; }
</style>
