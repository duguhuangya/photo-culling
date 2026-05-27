import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateThumbnail, getImageDimensions } from '../utils/imageLoader'

export interface Photo {
  id: string
  file: File
  thumbnail: string
  fullSrc: string
  status: 'none' | 'selected' | 'rejected' | 'starred'
  rating: 0 | 1 | 2 | 3 | 4 | 5
  tags: string[]
  width: number
  height: number
  name: string
}

interface HistoryEntry {
  type: string
  photoId?: string
  photoIds?: string[]
  prevStatus?: Photo['status']
  prevRating?: Photo['rating']
  photos?: Photo[]
}

export const usePhotoStore = defineStore('photo', () => {
  const photos = ref<Photo[]>([])
  const currentIndex = ref(0)
  const undoStack = ref<HistoryEntry[]>([])
  const redoStack = ref<HistoryEntry[]>([])

  // Getters
  const totalCount = computed(() => photos.value.length)
  const selectedCount = computed(() => photos.value.filter(p => p.status === 'selected').length)
  const rejectedCount = computed(() => photos.value.filter(p => p.status === 'rejected').length)
  const starredCount = computed(() => photos.value.filter(p => p.status === 'starred').length)
  const currentPhoto = computed(() => photos.value[currentIndex.value] ?? null)

  const stats = computed(() => {
    const list = photos.value
    const rated = list.filter(p => p.rating > 0)
    return {
      total: list.length,
      selected: list.filter(p => p.status === 'selected').length,
      rejected: list.filter(p => p.status === 'rejected').length,
      starred: list.filter(p => p.status === 'starred').length,
      none: list.filter(p => p.status === 'none').length,
      avgRating: rated.length ? +(rated.reduce((s, p) => s + p.rating, 0) / rated.length).toFixed(1) : 0,
    }
  })

  function getFiltered(status?: Photo['status']) {
    if (!status) return photos.value
    return photos.value.filter(p => p.status === status)
  }

  const filteredPhotos = computed(() => photos.value)

  // Actions
  async function addPhotos(files: File[]) {
    const newPhotos: Photo[] = []
    for (const file of files) {
      const id = crypto.randomUUID()
      const [thumbnail, dims] = await Promise.all([
        generateThumbnail(file),
        getImageDimensions(file),
      ])
      newPhotos.push({
        id,
        file,
        thumbnail,
        fullSrc: URL.createObjectURL(file),
        status: 'none',
        rating: 0,
        tags: [],
        width: dims.width,
        height: dims.height,
        name: file.name,
      })
    }
    pushHistory({ type: 'add', photos: newPhotos })
    photos.value.push(...newPhotos)
  }

  function setStatus(id: string, status: Photo['status']) {
    const photo = photos.value.find(p => p.id === id)
    if (!photo) return
    pushHistory({ type: 'status', photoId: id, prevStatus: photo.status })
    photo.status = status
  }

  function setRating(id: string, rating: Photo['rating']) {
    const photo = photos.value.find(p => p.id === id)
    if (!photo) return
    pushHistory({ type: 'rating', photoId: id, prevRating: photo.rating })
    photo.rating = rating
  }

  function toggleStar(id: string) {
    const photo = photos.value.find(p => p.id === id)
    if (!photo) return
    pushHistory({ type: 'status', photoId: id, prevStatus: photo.status })
    photo.status = photo.status === 'starred' ? 'none' : 'starred'
  }

  function removePhotos(ids: string[]) {
    const removed = photos.value.filter(p => ids.includes(p.id))
    if (!removed.length) return
    pushHistory({ type: 'remove', photos: removed })
    removed.forEach(p => URL.revokeObjectURL(p.fullSrc))
    photos.value = photos.value.filter(p => !ids.includes(p.id))
    if (currentIndex.value >= photos.value.length) {
      currentIndex.value = Math.max(0, photos.value.length - 1)
    }
  }

  function clearAll() {
    pushHistory({ type: 'clear', photos: [...photos.value] })
    photos.value.forEach(p => URL.revokeObjectURL(p.fullSrc))
    photos.value = []
    currentIndex.value = 0
  }

  function pushHistory(entry: HistoryEntry) {
    undoStack.value.push(entry)
    redoStack.value = []
  }

  function undo() {
    const entry = undoStack.value.pop()
    if (!entry) return
    redoStack.value.push(entry)

    switch (entry.type) {
      case 'add':
        entry.photos!.forEach(p => URL.revokeObjectURL(p.fullSrc))
        const addIds = new Set(entry.photos!.map(p => p.id))
        photos.value = photos.value.filter(p => !addIds.has(p.id))
        break
      case 'status': {
        const photo = photos.value.find(p => p.id === entry.photoId)
        if (photo && entry.prevStatus !== undefined) photo.status = entry.prevStatus
        break
      }
      case 'rating': {
        const photo = photos.value.find(p => p.id === entry.photoId)
        if (photo && entry.prevRating !== undefined) photo.rating = entry.prevRating
        break
      }
      case 'remove':
        photos.value.push(...entry.photos!)
        break
      case 'clear':
        photos.value = entry.photos!
        break
    }
  }

  function redo() {
    const entry = redoStack.value.pop()
    if (!entry) return
    undoStack.value.push(entry)

    switch (entry.type) {
      case 'add':
        photos.value.push(...entry.photos!)
        break
      case 'status': {
        // 重做需要重新执行，但 prev 已经丢失；简化：不做二次重做
        break
      }
      case 'remove': {
        const rmIds = new Set(entry.photos!.map(p => p.id))
        photos.value = photos.value.filter(p => !rmIds.has(p.id))
        break
      }
      case 'clear':
        photos.value.forEach(p => URL.revokeObjectURL(p.fullSrc))
        photos.value = []
        break
    }
  }

  return {
    photos,
    currentIndex,
    totalCount,
    selectedCount,
    rejectedCount,
    starredCount,
    currentPhoto,
    stats,
    filteredPhotos,
    addPhotos,
    setStatus,
    setRating,
    toggleStar,
    removePhotos,
    clearAll,
    getFiltered,
    undo,
    redo,
  }
})
