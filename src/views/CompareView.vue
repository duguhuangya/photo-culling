<template>
  <div class="compare-view">
    <div v-if="filteredPhotos.length < 2" class="empty-state">
      <div class="empty-icon">⚖️</div>
      <p class="empty-title">至少需要 2 张照片才能对比</p>
      <p class="empty-desc">上传更多照片开始对比选片</p>
      <button class="btn-primary" @click="$router.push('/')">去上传</button>
    </div>

    <template v-else>
      <div class="compare-header">
        <span class="progress">第 {{ currentIndex + 1 }}/{{ totalPairs }} 对</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
        </div>
      </div>

      <div v-if="!finished" class="compare-body">
        <div class="compare-side side-a">
          <img :src="pairA.fullSrc" />
          <span class="label">A</span>
        </div>
        <div class="compare-divider" />
        <div class="compare-side side-b">
          <img :src="pairB.fullSrc" />
          <span class="label">B</span>
        </div>
      </div>

      <div v-if="!finished" class="compare-actions">
        <button class="btn-action btn-a" @click="choose('a')">← A 胜</button>
        <button class="btn-action btn-skip" @click="choose('skip')">不确定</button>
        <button class="btn-action btn-b" @click="choose('b')">B 胜 →</button>
      </div>

      <div v-else class="compare-done">
        <div class="done-icon">✅</div>
        <p class="done-title">对比完成</p>
        <p class="done-desc">已标记 {{ store.selectedCount }} 张选中照片</p>
        <button class="btn-primary" @click="$router.push('/gallery')">查看结果</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePhotoStore } from '@/stores/photoStore'

const router = useRouter()
const store = usePhotoStore()

const currentIndex = ref(0)
const finished = ref(false)

const filteredPhotos = computed(() => store.filteredPhotos)
const totalPairs = computed(() => Math.floor(filteredPhotos.value.length / 2))
const progressPercent = computed(() =>
  totalPairs.value ? ((currentIndex.value) / totalPairs.value) * 100 : 0
)

const pairA = computed(() => {
  const idx = currentIndex.value * 2
  return filteredPhotos.value[idx]
})
const pairB = computed(() => {
  const idx = currentIndex.value * 2 + 1
  return filteredPhotos.value[idx]
})

function choose(result: 'a' | 'b' | 'skip') {
  const a = pairA.value
  const b = pairB.value
  if (!a || !b) return

  if (result === 'a') {
    store.setStatus(a.id, 'selected')
    store.setStatus(b.id, 'rejected')
  } else if (result === 'b') {
    store.setStatus(b.id, 'selected')
    store.setStatus(a.id, 'rejected')
  }

  if (currentIndex.value + 1 >= totalPairs.value) {
    finished.value = true
  } else {
    currentIndex.value++
  }
}
</script>

<style scoped>
.compare-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.compare-header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress {
  font-size: 14px;
  color: #999;
  white-space: nowrap;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #222;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.compare-body {
  flex: 1;
  display: flex;
  gap: 0;
  padding: 0 24px;
  min-height: 0;
}

.compare-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.compare-side img {
  max-width: 100%;
  max-height: calc(100vh - 200px);
  object-fit: contain;
  border-radius: 8px;
}

.compare-divider {
  width: 2px;
  background: #333;
  margin: 0 8px;
  align-self: stretch;
}

.label {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.compare-actions {
  padding: 24px;
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-action {
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #333;
  background: #1a1a1a;
  color: #e5e5e5;
  transition: all 0.2s;
}

.btn-a:hover { background: #166534; border-color: #22c55e; }
.btn-b:hover { background: #1e3a5f; border-color: #3b82f6; }
.btn-skip:hover { background: #333; }

.compare-done,
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.done-icon,
.empty-icon { font-size: 48px; }

.done-title,
.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #e5e5e5;
}

.done-desc,
.empty-desc {
  font-size: 14px;
  color: #777;
}

.btn-primary {
  margin-top: 8px;
  padding: 10px 28px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover { background: #2563eb; }
</style>
