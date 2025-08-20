<template>
  <ClientLayout>
    <div class="client-home">
      <!-- Заголовок -->
      <div class="header">
        <div class="logo-section">
          <img :src="getLogo()" alt="Вектрик Банк" class="logo">
          <h1 class="bank-name">Вектрик Банк</h1>
        </div>
      </div>

      <!-- Баннер-слайдер -->
      <div v-if="banners.length > 0" class="banner-section">
        <div class="banner-slider">
          <div class="banner-container" :style="{ transform: `translateX(-${currentBannerIndex * 100}%)` }">
            <div v-for="banner in banners" :key="banner.id" class="banner">
              <img :src="banner.image_url" :alt="banner.title" class="banner-image">
            </div>
          </div>
          
          <!-- Кнопки навигации -->
          <div v-if="banners.length > 1" class="banner-nav">
            <button 
              @click="prevBanner" 
              class="nav-btn prev-btn"
              :disabled="currentBannerIndex === 0"
            >
              ‹
            </button>
            <button 
              @click="nextBanner" 
              class="nav-btn next-btn"
              :disabled="currentBannerIndex === banners.length - 1"
            >
              ›
            </button>
          </div>
          
          <!-- Индикаторы -->
          <div v-if="banners.length > 1" class="banner-indicators">
            <button 
              v-for="(banner, index) in banners" 
              :key="banner.id"
              @click="goToBanner(index)"
              class="indicator"
              :class="{ active: index === currentBannerIndex }"
            ></button>
          </div>
        </div>
      </div>

      <!-- Заглушка для баннеров -->
      <div v-else class="banner-placeholder">
        <div class="placeholder-icon">🎨</div>
        <h3>Добро пожаловать в Вектрик Банк!</h3>
        <p>Мы рады приветствовать вас в нашем банке</p>
      </div>

      <!-- Информация о счете -->
      <div class="account-info">
        <div class="info-row">
          <span class="info-label">Счет:</span>
          <span class="info-value">{{ userInfo.account_number }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Баланс:</span>
          <span class="info-value">{{ userInfo.balance }} Вектриков</span>
        </div>
      </div>

      <!-- Мои покупки -->
      <div class="purchases-section">
        <h2 class="section-title">Мои покупки</h2>
        <div v-if="purchases.length > 0" class="purchases-list">
          <div v-for="purchase in purchases" :key="purchase.id" class="purchase-card">
            <div class="purchase-info">
              <h3 class="purchase-name">{{ purchase.product.name }}</h3>
              <p class="purchase-description">{{ purchase.product.description }}</p>
              <div class="purchase-details">
                <span class="quantity">Количество: {{ purchase.quantity }}</span>
                <span class="date">{{ formatDate(purchase.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-purchases">
          <div class="empty-icon">🛒</div>
          <h3>У вас пока нет покупок</h3>
          <p>Посетите наш магазин и выберите интересующие вас товары</p>
        </div>
      </div>

      <!-- История транзакций -->
      <div class="history-section">
        <h2 class="section-title">История</h2>
        <div v-if="transactions.length > 0" class="history-table">
          <div class="table-header">
            <div class="header-cell">Дата</div>
            <div class="header-cell">Операция</div>
            <div class="header-cell">Сумма</div>
          </div>
          <div v-for="transaction in transactions" :key="transaction.id" class="table-row">
            <div class="table-cell">{{ formatDate(transaction.created_at) }}</div>
            <div class="table-cell">{{ transaction.reason }}</div>
            <div class="table-cell" :class="{ 'positive': transaction.amount > 0, 'negative': transaction.amount < 0 }">
              {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }} Вектриков
            </div>
          </div>
        </div>
        <div v-else class="empty-transactions">
          <div class="empty-icon">📊</div>
          <h3>История транзакций пуста</h3>
          <p>Здесь будут отображаться все ваши операции</p>
        </div>
      </div>
    </div>
  </ClientLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import ClientLayout from '@/components/ClientLayout.vue'
import { useTheme } from '@/composables/useTheme'

const { applyTheme } = useTheme()

const banners = ref([])
const userInfo = ref({})
const purchases = ref([])
const transactions = ref([])
const currentBannerIndex = ref(0)
let autoSlideInterval = null
let manualSlideTimeout = null

const fetchBanners = async () => {
  try {
    const response = await axios.get('/api/client/banners')
    banners.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки баннеров:', error)
  }
}

const fetchUserInfo = async () => {
  try {
    const response = await axios.get('/api/me')
    userInfo.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки информации о пользователе:', error)
  }
}

const fetchPurchases = async () => {
  try {
    const response = await axios.get('/api/client/purchases')
    purchases.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки покупок:', error)
  }
}

const fetchTransactions = async () => {
  try {
    const response = await axios.get('/api/client/transactions')
    transactions.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки транзакций:', error)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Функции слайдера
const nextBanner = () => {
  if (currentBannerIndex.value < banners.value.length - 1) {
    currentBannerIndex.value++
  } else {
    currentBannerIndex.value = 0
  }
  // Останавливаем автослайд при ручном переключении
  stopAutoSlide()
  // Возобновляем через 3 секунды
  if (manualSlideTimeout) {
    clearTimeout(manualSlideTimeout)
  }
  manualSlideTimeout = setTimeout(() => {
    startAutoSlide()
  }, 3000)
}

const prevBanner = () => {
  if (currentBannerIndex.value > 0) {
    currentBannerIndex.value--
  } else {
    currentBannerIndex.value = banners.value.length - 1
  }
  // Останавливаем автослайд при ручном переключении
  stopAutoSlide()
  // Возобновляем через 3 секунды
  if (manualSlideTimeout) {
    clearTimeout(manualSlideTimeout)
  }
  manualSlideTimeout = setTimeout(() => {
    startAutoSlide()
  }, 3000)
}

const goToBanner = (index) => {
  currentBannerIndex.value = index
  // Останавливаем автослайд при ручном переключении
  stopAutoSlide()
  // Возобновляем через 3 секунды
  if (manualSlideTimeout) {
    clearTimeout(manualSlideTimeout)
  }
  manualSlideTimeout = setTimeout(() => {
    startAutoSlide()
  }, 3000)
}

const startAutoSlide = () => {
  if (banners.value.length > 1) {
    autoSlideInterval = setInterval(() => {
      nextBanner()
    }, 5000) // Переключение каждые 5 секунд
  }
}

const stopAutoSlide = () => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval)
    autoSlideInterval = null
  }
}

const getLogo = () => {
  // Проверяем, есть ли класс theme-pink на body
  if (document.body.classList.contains('theme-pink')) {
    return '/logo-pink.svg'
  }
  return '/logo.svg'
}

onMounted(async () => {
  // Применяем тему
  await applyTheme()
  
  fetchBanners()
  fetchUserInfo()
  fetchPurchases()
  fetchTransactions()
  startAutoSlide()
})

onUnmounted(() => {
  stopAutoSlide()
  if (manualSlideTimeout) {
    clearTimeout(manualSlideTimeout)
  }
})
</script>

<style scoped>
.client-home {
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

.banner-section {
  margin-bottom: 20px;
}

.banner-slider {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: #000;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.banner-container {
  display: flex;
  transition: transform 0.5s ease;
  width: 100%;
}

.banner {
  min-width: 100%;
  position: relative;
}

.banner-image {
  width: 100%;
  height: 120px;
  object-fit: contain;
  object-position: center;
  display: block;
  vertical-align: top;
  background: #000;
}

.banner-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

.banner-title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* Кнопки навигации */
.banner-nav {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 8px;
  pointer-events: none;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-primary);
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Индикаторы */
.banner-indicators {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.indicator {
  width: 8px;
  height: 8px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.2);
}

.banner-placeholder {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px dashed #dee2e6;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.7;
}

.banner-placeholder h3 {
  color: var(--color-primary);
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
}

.banner-placeholder p {
  margin: 0;
  color: #666;
  font-size: 14px;
  opacity: 0.8;
}

.account-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #666;
  font-size: 14px;
}

.info-value {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 14px;
}

.section-title {
  color: var(--color-primary);
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-align: center;
}

.purchases-section {
  margin-bottom: 20px;
}

.purchases-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.purchase-card {
  background: #e8f5e8;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #d4edda;
}

/* Розовая тема */
body.theme-pink .purchase-card {
  background: #ffe6f7;
  border: 1px solid #ffb3e6;
}

.purchase-name {
  color: var(--color-primary);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.purchase-description {
  color: #666;
  font-size: 14px;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.purchase-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #888;
}

.empty-purchases {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.7;
}

.empty-purchases h3 {
  color: var(--color-primary);
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.empty-purchases p {
  margin: 0;
  color: #666;
  font-size: 14px;
  opacity: 0.8;
}

.history-section {
  margin-bottom: 20px;
}

.history-table {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

.header-cell {
  padding: 12px 8px;
  text-align: center;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  border-bottom: 1px solid #e9ecef;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 12px 8px;
  text-align: center;
  font-size: 14px;
  color: #333;
}

.table-cell.positive {
  color: #28a745;
  font-weight: 600;
}

.table-cell.negative {
  color: #dc3545;
  font-weight: 600;
}

.empty-transactions {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
}

.empty-transactions .empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.7;
}

.empty-transactions h3 {
  color: var(--color-primary);
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.empty-transactions p {
  margin: 0;
  color: #666;
  font-size: 14px;
  opacity: 0.8;
}

@media (max-width: 480px) {
  .client-home {
    padding: 12px;
  }
  
  .bank-name {
    font-size: 20px;
  }
  
  .banner-image {
    height: 120px !important;
    object-fit: contain !important;
    object-position: center !important;
    background: #000 !important;
  }
  
  .nav-btn {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
  
  .indicator {
    width: 6px;
    height: 6px;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1.5fr 1fr;
  }
  
  .header-cell,
  .table-cell {
    padding: 8px 4px;
    font-size: 12px;
  }
}
</style> 