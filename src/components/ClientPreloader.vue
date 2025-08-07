<template>
  <div :class="['client-preloader', theme]" v-show="visible" @transitionend="onTransitionEnd">
    <div class="preloader-content">
      <transition name="fade-text">
        <div v-if="showText" class="welcome-text">
          Добро пожаловать, <span class="user-name">{{ userName }}</span>
        </div>
      </transition>
      <transition name="logo-zoom">
        <img
          v-if="showLogo"
          :src="theme === 'pink' ? '/logo-pink.svg' : '/logo.svg'"
          alt="Логотип"
          class="preloader-logo"
        />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
const props = defineProps({
  userName: String,
  theme: String
})
const emit = defineEmits(['hide'])
const visible = ref(true)
const showLogo = ref(false)
const showText = ref(false)

onMounted(() => {
  // Логотип появляется сразу, анимация уменьшения
  setTimeout(() => {
    showLogo.value = true
  }, 50)
  // Текст появляется чуть позже
  setTimeout(() => {
    showText.value = true
  }, 600)
  // Прелоадер исчезает через 2.1 сек
  setTimeout(() => {
    visible.value = false
  }, 2100)
})

function onTransitionEnd(e) {
  if (!visible.value && e.propertyName === 'opacity') {
    emit('hide')
  }
}
</script>

<style scoped>
.client-preloader {
  position: fixed;
  z-index: 9999;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: opacity 0.7s cubic-bezier(.4,0,.2,1);
  opacity: 1;
}
.client-preloader.pink {
  background: var(--color-secondary, #ffb3e6);
}
.client-preloader.green {
  background: var(--color-secondary, #B4D8BA);
}
.client-preloader[style*="display: none"] {
  opacity: 0;
}
.preloader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.preloader-logo {
  width: 120px;
  height: 120px;
  margin-bottom: 32px;
  animation: logo-in 0.7s cubic-bezier(.4,0,.2,1) forwards, logo-pulse 1.2s 0.7s infinite alternate cubic-bezier(.4,0,.2,1);
  opacity: 1;
}
@keyframes logo-in {
  0% {
    transform: scale(2.5);
    opacity: 0;
  }
  60% {
    transform: scale(1.05);
    opacity: 1;
  }
  80% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes logo-pulse {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.08);
  }
}
.welcome-text {
  font-size: 2.1rem;
  font-weight: 800;
  color: var(--color-primary);
  font-family: 'Inter', sans-serif;
  text-align: center;
  letter-spacing: 0.01em;
  opacity: 0;
  animation: text-fadein 0.7s 0.55s forwards;
}
.user-name {
  color: var(--color-primary);
  font-weight: 900;
}
@keyframes text-fadein {
  from { opacity: 0; }
  to { opacity: 1; }
}
.fade-text-enter-active, .fade-text-leave-active {
  transition: opacity 0.7s cubic-bezier(.4,0,.2,1);
}
.fade-text-enter-from, .fade-text-leave-to {
  opacity: 0;
}
.fade-text-enter-to, .fade-text-leave-from {
  opacity: 1;
}
.logo-zoom-enter-active, .logo-zoom-leave-active {
  transition: opacity 0.7s cubic-bezier(.4,0,.2,1);
}
.logo-zoom-enter-from, .logo-zoom-leave-to {
  opacity: 0;
}
.logo-zoom-enter-to, .logo-zoom-leave-from {
  opacity: 1;
}
@media (max-width: 600px) {
  .preloader-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 24px;
  }
  .welcome-text {
    font-size: 1.2rem;
  }
}
</style>
