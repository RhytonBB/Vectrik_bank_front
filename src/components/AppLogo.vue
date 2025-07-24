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
}
</style>