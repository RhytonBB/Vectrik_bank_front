import { onMounted, onUnmounted, ref } from 'vue'
import axios from 'axios'

let intervalId = null
export const currentTheme = ref('green')

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'pink') {
    root.style.setProperty('--color-primary', '#ff4dbb')
    root.style.setProperty('--color-secondary', '#fff0fa')
  } else {
    root.style.setProperty('--color-primary', '#115740')
    root.style.setProperty('--color-secondary', '#e6f4ee')
  }
  currentTheme.value = theme
}

async function fetchAndApplyTheme() {
  try {
    const resp = await axios.get(`${process.env.VUE_APP_API_URL}/api/admin/theme`)
    applyTheme(resp.data.theme)
  } catch (e) {/* ignore */}
}

export function useUserTheme() {
  onMounted(() => {
    fetchAndApplyTheme()
    intervalId = setInterval(fetchAndApplyTheme, 10000)
  })
  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })
} 