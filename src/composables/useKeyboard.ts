import { onMounted, onUnmounted } from 'vue'

type KeyCallback = () => void

interface KeyMap {
  onSelect?: KeyCallback
  onReject?: KeyCallback
  onStar?: KeyCallback
  onRating?: (n: 1 | 2 | 3 | 4 | 5) => void
  onZoom?: KeyCallback
  onCompare?: KeyCallback
  onNext?: KeyCallback
  onPrev?: KeyCallback
  onUndo?: KeyCallback
  onRedo?: KeyCallback
  onExport?: KeyCallback
  onDelete?: KeyCallback
}

function matchKey(e: KeyboardEvent, key: string): boolean {
  const parts = key.split('+')
  const keyPart = parts.pop()!
  const needShift = parts.includes('shift')
  const needCtrl = parts.includes('ctrl')
  return e.key.toLowerCase() === keyPart.toLowerCase()
    && e.shiftKey === needShift
    && (needCtrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey)
}

const KEY_MAP: Record<string, (cbs: KeyMap, e: KeyboardEvent) => void> = {
  'a':       (c) => c.onSelect?.(),
  'arrowleft': (c) => c.onSelect?.(),
  'd':       (c) => c.onReject?.(),
  'arrowright': (c) => c.onReject?.(),
  's':       (c) => c.onStar?.(),
  '1':       (c) => c.onRating?.(1),
  '2':       (c) => c.onRating?.(2),
  '3':       (c) => c.onRating?.(3),
  '4':       (c) => c.onRating?.(4),
  '5':       (c) => c.onRating?.(5),
  ' ':       (c) => c.onZoom?.(),
  'c':       (c) => c.onCompare?.(),
  'tab':     (c) => c.onNext?.(),
  'shift+tab': (c) => c.onPrev?.(),
  'z':       (c, e) => e.shiftKey ? c.onRedo?.() : c.onUndo?.(),
  'e':       (c) => c.onExport?.(),
  'delete':  (c) => c.onDelete?.(),
  'backspace': (c) => c.onDelete?.(),
}

export function useKeyboard() {
  let activeCallbacks: KeyMap | null = null

  function handler(e: KeyboardEvent) {
    if (!activeCallbacks) return
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

    // 优先匹配 shift+tab
    if (e.shiftKey && e.key === 'Tab') {
      e.preventDefault()
      activeCallbacks.onPrev?.()
      return
    }

    const key = e.key.toLowerCase()
    const mapper = KEY_MAP[key]
    if (mapper) {
      e.preventDefault()
      mapper(activeCallbacks, e)
    }
  }

  function onKeyMap(callbacks: KeyMap) {
    activeCallbacks = callbacks
  }

  function offKeyMap() {
    activeCallbacks = null
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => window.removeEventListener('keydown', handler))

  return { onKeyMap, offKeyMap }
}
