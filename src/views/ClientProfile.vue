<template>
  <ClientLayout>
    <div class="client-profile">
      <!-- Заголовок -->
      <div class="header">
        <div class="logo-section">
          <img :src="getLogo()" alt="Вектрик Банк" class="logo">
          <h1 class="bank-name">Вектрик Банк</h1>
        </div>
      </div>

      <!-- Заголовок профиля -->
      <h2 class="profile-title">Профиль</h2>

      <!-- Информация о пользователе -->
      <div class="profile-info">
        <div class="info-card">
          <div class="info-item">
            <span class="info-label">Имя:</span>
            <span class="info-value">{{ userInfo.first_name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Фамилия:</span>
            <span class="info-value">{{ userInfo.last_name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Telegram:</span>
            <span class="info-value">@{{ userInfo.telegram_username }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Номер счета:</span>
            <span class="info-value">{{ userInfo.account_number }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Баланс:</span>
            <span class="info-value balance">{{ userInfo.balance }} Вектриков</span>
          </div>
          <div class="info-item">
            <span class="info-label">Статус:</span>
            <span class="info-value status" :class="{ 'active': userInfo.is_active, 'inactive': !userInfo.is_active }">
              {{ userInfo.is_active ? 'Активен' : 'Неактивен' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Кнопка выхода -->
      <div class="logout-section">
        <button @click="logout" class="logout-button">
          Выйти из аккаунта
        </button>
      </div>
    </div>
  </ClientLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ClientLayout from '@/components/ClientLayout.vue'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const { currentTheme } = useTheme()
const userInfo = ref({})

const getLogo = () => {
  if (currentTheme.value === 'pink') {
      return '/logo-pink.svg'
}
return '/logo.svg'
}

const fetchUserInfo = async () => {
  try {
    const response = await axios.get('/me')
    userInfo.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки информации о пользователе:', error)
  }
}

const logout = async () => {
  try {
    await axios.post('/logout')
    localStorage.removeItem('token')
    // НЕ сбрасываем preloaderShown - флаг должен сохраняться до новой авторизации
    router.push('/')
  } catch (error) {
    console.error('Ошибка выхода:', error)
    // В любом случае перенаправляем на главную
    localStorage.removeItem('token')
    // НЕ сбрасываем preloaderShown
    router.push('/')
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.client-profile {
  padding: 16px;
  background: #fff;
  min-height: 100vh;
}

.header {
  margin-bottom: 20px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo {
  width: 40px;
  height: 40px;
}

.bank-name {
  color: var(--color-primary);
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}

.profile-title {
  color: var(--color-primary);
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-align: center;
}

.profile-info {
  margin-bottom: 32px;
}

.info-card {
  background: #e8f5e8;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #d4edda;
}

/* Розовая тема */
body.theme-pink .info-card {
  background: #ffe6f7;
  border: 1px solid #ffb3e6;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #d4edda;
}

.info-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.info-label {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 14px;
}

.info-value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.info-value.balance {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 16px;
}

.info-value.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.info-value.status.active {
  background: #d4edda;
  color: #155724;
}

.info-value.status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.logout-section {
  display: flex;
  justify-content: center;
}

.logout-button {
  padding: 12px 24px;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: #c82333;
}

@media (max-width: 480px) {
  .client-profile {
    padding: 12px;
  }
  
  .bank-name {
    font-size: 20px;
  }
  
  .info-card {
    padding: 16px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .info-label,
  .info-value {
    font-size: 13px;
  }
  
  .info-value.balance {
    font-size: 15px;
  }
}
</style> 