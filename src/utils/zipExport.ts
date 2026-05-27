import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export interface ExportOptions {
  quality: 'original' | 'compressed'
  naming: 'original' | 'index'
}

interface Photo {
  id: string
  file: File
  thumbnail: string
  fullSrc: string
  status: 'none' | 'selected' | 'rejected' | 'starred'
  rating: number
  tags: string[]
  width: number
  height: number
  name: string
}

async function compressImage(file: File, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('压缩失败')),
        'image/jpeg',
        quality,
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export async function exportPhotos(photos: Photo[], options: ExportOptions): Promise<void> {
  const zip = new JSZip()

  const tasks = photos.map(async (photo, index) => {
    const ext = photo.name.split('.').pop() || 'jpg'
    const fileName = options.naming === 'index'
      ? `${String(index + 1).padStart(4, '0')}.${ext}`
      : photo.name

    if (options.quality === 'compressed') {
      const blob = await compressImage(photo.file)
      zip.file(fileName, blob)
    } else {
      const buffer = await photo.file.arrayBuffer()
      zip.file(fileName, buffer)
    }
  })

  await Promise.all(tasks)

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `photos-${Date.now()}.zip`)
}
