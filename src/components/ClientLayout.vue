<template>
  <div class="client-layout">
    <div class="client-content">
      <slot />
    </div>
    
    <nav class="client-navigation">
      <router-link to="/client" class="nav-item" active-class="active">
        <img :src="getNavIcon('bank')" alt="Главная" class="nav-icon">
        <span class="nav-text">Главная</span>
      </router-link>
      
      <router-link to="/client/store" class="nav-item" active-class="active">
        <img :src="getNavIcon('store')" alt="Магазин" class="nav-icon">
        <span class="nav-text">Магазин</span>
      </router-link>
      
      <router-link to="/client/news" class="nav-item" active-class="active">
        <img :src="getNavIcon('news')" alt="Новости" class="nav-icon">
        <span class="nav-text">Новости</span>
      </router-link>
      
      <router-link to="/client/about" class="nav-item" active-class="active">
        <img :src="getNavIcon('about')" alt="О нас" class="nav-icon">
        <span class="nav-text">О нас</span>
      </router-link>
      
      <router-link to="/client/profile" class="nav-item" active-class="active">
        <img :src="getNavIcon('user')" alt="Профиль" class="nav-icon">
        <span class="nav-text">Профиль</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
const getNavIcon = (iconName) => {
  // Проверяем, есть ли класс theme-pink на body
  if (document.body.classList.contains('theme-pink')) {
    return `/pink_${iconName}.png`
  }
  return `/${iconName}.png`
}
</script>

<style scoped>
.client-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
}

.client-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100px; /* Увеличенный отступ для навигации */
}

.client-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: #fff;
  border-top: 2px solid var(--color-primary);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #666;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 8px;
  min-width: 60px;
}

.nav-item:hover {
  color: var(--color-primary);
  background: rgba(23, 98, 74, 0.1);
}

.nav-item.active {
  color: var(--color-primary);
  background: rgba(23, 98, 74, 0.1);
}

/* Розовая тема */
body.theme-pink .nav-item:hover {
  background: rgba(255, 77, 187, 0.1);
}

body.theme-pink .nav-item.active {
  background: rgba(255, 77, 187, 0.1);
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
  filter: brightness(0.7);
  transition: filter 0.3s ease;
}

.nav-item:hover .nav-icon,
.nav-item.active .nav-icon {
  filter: brightness(1);
}

.nav-text {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

@media (max-width: 480px) {
  .nav-text {
    font-size: 11px;
  }
  
  .nav-icon {
    width: 22px;
    height: 22px;
  }
}
</style> 