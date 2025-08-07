<template>
  <Preloader v-if="showPreloader && isClientRoute" :userName="userName" :theme="theme" @hide="onPreloaderHide" />
  <router-view v-else />
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import Preloader from './components/ClientPreloader.vue'
import { useTheme } from '@/composables/useTheme'
import axios from 'axios'

const route = useRoute()
const { currentTheme } = useTheme()
const showPreloader = ref(false)
const userName = ref('')
const theme = computed(() => currentTheme.value)

const isClientRoute = computed(() => route.path.startsWith('/client'))

function onPreloaderHide() {
  showPreloader.value = false
  localStorage.setItem('preloaderShown', '1')
}

watch(
  () => route.fullPath,
  async () => {
    if (
      isClientRoute.value &&
      !showPreloader.value &&
      localStorage.getItem('preloaderShown') !== '1'
    ) {
      showPreloader.value = true
      try {
        const resp = await axios.get('/me')
        userName.value = resp.data.first_name || ''
      } catch (e) {
        userName.value = ''
      }
    }
  },
  { immediate: true }
)
</script>