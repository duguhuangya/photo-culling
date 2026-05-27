import { defineConfig, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({ scale: 1.2, warn: true })
  ],
  theme: {
    colors: {
      dark: { bg: '#0a0a0a', card: '#141414', border: '#2a2a2a', hover: '#1e1e1e' },
      accent: { DEFAULT: '#3b82f6', light: '#60a5fa', dim: '#1e40af' },
      ok: '#22c55e',
      no: '#ef4444',
      star: '#eab308'
    }
  }
})
