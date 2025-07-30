<template>
  <img :src="logoSrc" alt="Логотип" class="app-logo" />
</template>

<script setup>
import { computed } from 'vue'
import { currentTheme } from '@/composables/useUserTheme.js'
import logoGreen from '@/assets/logo.svg'
import logoPink from '@/assets/logo-pink.svg'

const logoSrc = computed(() => currentTheme.value === 'pink' ? logoPink : logoGreen)
</script>

<style scoped>
.app-logo {
  height: 48px;
  width: auto;
  display: block;
  transition: transform 0.3s ease;
}

.app-logo:hover {
  transform: scale(1.05);
}

@media (max-width: 600px) {
  .app-logo {
    height: 40px !important;
    width: auto !important;
  }
}
</style>