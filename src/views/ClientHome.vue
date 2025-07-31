<template>
  <ClientLayout>
    <div class="client-home">
      <!-- Заголовок -->
      <div class="header">
        <div class="logo-section">
          <img src="/logo.png" alt="Вектрик Банк" class="logo">
          <h1 class="bank-name">Вектрик Банк</h1>
        </div>
      </div>

      <!-- Баннер -->
      <div v-if="banners.length > 0" class="banner-section">
        <div class="banner">
          <img :src="banners[0].image_url" :alt="banners[0].title" class="banner-image">
          <div class="banner-content">
            <h3 class="banner-title">{{ banners[0].title }}</h3>
          </div>
        </div>
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
          <p>У вас пока нет покупок</p>
        </div>
      </div>

      <!-- История транзакций -->
      <div class="history-section">
        <h2 class="section-title">История</h2>
        <div class="history-table">
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
      </div>
    </div>
  </ClientLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import ClientLayout from '@/components/ClientLayout.vue'

const banners = ref([])
const userInfo = ref({})
const purchases = ref([])
const transactions = ref([])

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

onMounted(() => {
  fetchBanners()
  fetchUserInfo()
  fetchPurchases()
  fetchTransactions()
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
  color: #17624A;
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}

.banner-section {
  margin-bottom: 20px;
}

.banner {
  background: #e8f5e8;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.banner-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.banner-content {
  padding: 12px;
}

.banner-title {
  color: #17624A;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
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
  color: #17624A;
  font-weight: 600;
  font-size: 14px;
}

.section-title {
  color: #17624A;
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

.purchase-name {
  color: #17624A;
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
  color: #666;
  padding: 20px;
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
  background: #17624A;
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

@media (max-width: 480px) {
  .client-home {
    padding: 12px;
  }
  
  .bank-name {
    font-size: 20px;
  }
  
  .banner-image {
    height: 100px;
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