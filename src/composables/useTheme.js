import { ref, onMounted } from 'vue'
import axios from 'axios'

const currentTheme = ref('green')

export function useTheme() {
  const fetchTheme = async () => {
    try {
      const response = await axios.get('/api/client/theme')
      currentTheme.value = response.data.theme
      applyTheme(response.data.theme)
    } catch (error) {
      console.error('Failed to fetch theme:', error)
      applyTheme('green') // fallback to green theme
    }
  }

  const applyTheme = (theme) => {
    const body = document.body
    body.classList.remove('theme-green', 'theme-pink')
    body.classList.add(`theme-${theme}`)
    currentTheme.value = theme
  }

  onMounted(() => {
    fetchTheme()
  })

  return {
    currentTheme,
    fetchTheme,
    applyTheme
  }
} 