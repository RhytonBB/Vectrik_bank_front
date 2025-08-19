<template>
  <ClientLayout>
    <div class="client-store">
      <!-- Заголовок -->
      <div class="header">
        <div class="logo-section">
          <img :src="getLogo()" alt="Вектрик Банк" class="logo">
          <h1 class="bank-name">Вектрик Банк</h1>
        </div>
        <div class="balance-info">
          <span class="balance-label">Баланс:</span>
          <span class="balance-value">{{ userInfo.balance }} Вектриков</span>
        </div>
      </div>

      <!-- Заголовок магазина -->
      <div class="store-header">
        <h2 class="store-title">Магазин</h2>
        <button @click="refreshStore" class="refresh-store-btn" :disabled="isRefreshing">
          <span v-if="!isRefreshing">🔄</span>
          <span v-else class="loading-spinner-small"></span>
          {{ isRefreshing ? 'Обновление...' : 'Обновить' }}
        </button>
      </div>

      <!-- Список обычных товаров -->
      <div v-if="products.length > 0" class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <!-- Изображение товара -->
          <div class="product-image-container">
            <img v-if="product.media_url" :src="product.media_url" :alt="product.name" class="product-image">
            <div v-else class="product-image-placeholder">
              <span>Нет фото</span>
            </div>
          </div>
          
          <!-- Информация о товаре -->
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            
            <div class="product-details">
              <div class="price-info">
                <span class="price-label">Цена:</span>
                <span class="price-value">{{ product.price }} Вектриков</span>
              </div>
              <div class="stock-info">
                <span class="stock-label">Остаток:</span>
                <span class="stock-value">{{ product.stock }} шт</span>
              </div>
            </div>
            
            <!-- Кнопка покупки -->
            <button 
              @click="purchaseProduct(product)"
              :disabled="!canPurchase(product)"
              class="purchase-button"
              :class="{ 'disabled': !canPurchase(product), 'already-purchased': product.is_purchased }"
            >
              {{ getPurchaseButtonText(product) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Список краудфандинг товаров -->
      <div v-if="crowdfundingProducts.length > 0" class="products-grid">
        <div v-for="product in crowdfundingProducts" :key="product.id" class="product-card crowdfunding-card">
          <!-- Изображение товара -->
          <div class="product-image-container">
            <img v-if="product.media_url" :src="product.media_url" :alt="product.name" class="product-image">
            <div v-else class="product-image-placeholder">
              <span>Нет фото</span>
            </div>
          </div>
          
          <!-- Информация о товаре -->
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            
            <div class="product-details">
              <div class="price-info">
                <span class="price-label">Целевая сумма:</span>
                <span class="price-value">{{ product.target_amount }} Вектриков</span>
              </div>
            </div>
            
            <!-- Прогресс краудфандинга -->
            <div class="crowdfunding-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: getCrowdfundingPercentage(product) + '%' }"
                ></div>
              </div>
              <div class="progress-text">
                <span>{{ product.crowdfunding_progress || 0 }} / {{ product.target_amount }} Вектриков</span>
                <span class="percentage">{{ getCrowdfundingPercentage(product) }}%</span>
              </div>
            </div>
            
                         <!-- Кнопка взноса в краудфандинг -->
             <button 
               @click="openCrowdfundingModal(product)"
               :disabled="product.has_contributed || product.is_completed"
               class="purchase-button crowdfunding-button"
               :class="{ 'disabled': product.has_contributed || product.is_completed, 'already-purchased': product.has_contributed || product.is_completed }"
             >
               {{ getCrowdfundingButtonText(product) }}
             </button>
          </div>
        </div>
      </div>

      <!-- Сообщение об отсутствии товаров -->
      <div v-if="products.length === 0 && crowdfundingProducts.length === 0" class="empty-products">
        <div class="empty-icon">🛍️</div>
        <h3>В магазине пока нет товаров</h3>
        <p>Загляните позже, мы готовим для вас новые предложения!</p>
      </div>
    </div>
    
    <!-- Модальное окно краудфандинга -->
    <div v-if="showCrowdfundingModal" class="modal-overlay" @click="closeCrowdfundingModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Внести взнос в общий сбор</h3>
          <button @click="closeCrowdfundingModal" class="close-button">×</button>
        </div>
        <div class="modal-body">
          <div class="product-info-modal">
            <h4>{{ selectedProduct?.name }}</h4>
            <p>{{ selectedProduct?.description }}</p>
            <div class="progress-info">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: getCrowdfundingPercentage(selectedProduct) + '%' }"
                ></div>
              </div>
                          <div class="progress-text">
              <span>{{ selectedProduct?.crowdfunding_progress || 0 }} / {{ selectedProduct?.target_amount }} Вектриков</span>
              <span class="percentage">{{ getCrowdfundingPercentage(selectedProduct) }}%</span>
            </div>
            </div>
          </div>
          <div class="contribution-form">
            <label for="contribution-amount">Сумма взноса (Вектриков):</label>
            <input 
              id="contribution-amount"
              v-model="contributionAmount" 
              type="number" 
              min="1" 
              :max="userInfo.balance"
              placeholder="Введите сумму"
              class="amount-input"
            >
            <div class="balance-info-modal">
              <span>Ваш баланс: {{ userInfo.balance }} Вектриков</span>
            </div>
            <div class="contribution-buttons">
              <button 
                @click="contributeToCrowdfunding"
                :disabled="!canContribute"
                class="contribute-button"
              >
                Внести взнос
              </button>
              <button @click="closeCrowdfundingModal" class="cancel-button">
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import ClientLayout from '@/components/ClientLayout.vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme } = useTheme()
const products = ref([])
const crowdfundingProducts = ref([])
const userInfo = ref({})
const isRefreshing = ref(false)
const showCrowdfundingModal = ref(false)
const selectedProduct = ref(null)
const contributionAmount = ref('')
let updateInterval = null

const getLogo = () => {
  if (currentTheme.value === 'pink') {
      return '/logo-pink.svg'
}
return '/logo.svg'
}

const fetchProducts = async () => {
  try {
    const response = await axios.get('/client/products')
    products.value = response.data || []
    
    // Если товаров нет, показываем соответствующее сообщение
    if (products.value.length === 0) {
      console.log('Нет доступных товаров в магазине')
    } else {
      console.log(`Загружено ${products.value.length} товаров`)
    }
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error)
    // В случае ошибки устанавливаем пустой массив
    products.value = []
    
    // Показываем сообщение об ошибке пользователю
    alert('Ошибка загрузки товаров. Попробуйте обновить страницу.')
  }
}

const fetchCrowdfundingProducts = async () => {
  try {
    const response = await axios.get('/client/crowdfunding')
    crowdfundingProducts.value = response.data || []
  } catch (error) {
    console.error('Ошибка загрузки краудфандинг товаров:', error)
    crowdfundingProducts.value = []
  }
}

const fetchUserInfo = async () => {
  try {
    const response = await axios.get('/me')
    userInfo.value = response.data || {}
  } catch (error) {
    console.error('Ошибка загрузки информации о пользователе:', error)
    // В случае ошибки устанавливаем пустой объект
    userInfo.value = {}
  }
}

const canPurchase = (product) => {
  return product.stock > 0 && userInfo.value.balance >= product.price && !product.is_purchased
}

const getPurchaseButtonText = (product) => {
  if (product.is_purchased) return 'Вы уже приобрели товар'
  if (product.stock === 0) return 'Нет в наличии'
  if (userInfo.value.balance < product.price) return 'Недостаточно средств'
  return 'Заказать'
}

const getCrowdfundingButtonText = (product) => {
  if (product.is_completed) return 'Сбор завершен!'
  if (product.has_contributed) return 'Вы уже внесли взнос'
  return 'Внести взнос'
}

const getCrowdfundingPercentage = (product) => {
  if (!product || !product.target_amount) return 0
  const progress = product.crowdfunding_progress || 0
  return Math.min(Math.round((progress / product.target_amount) * 100), 100)
}

const canContribute = computed(() => {
  const amount = parseInt(contributionAmount.value)
  return amount > 0 && amount <= userInfo.value.balance
})

const purchaseProduct = async (product) => {
  if (!canPurchase(product)) return
  
  // Дополнительная проверка на случай, если товар уже куплен
  if (product.is_purchased) {
    alert('Вы уже приобрели этот товар!')
    return
  }
  
  try {
    await axios.post('/client/purchase', {
      product_id: product.id,
      quantity: 1
    })
    
    // Обновляем информацию о пользователе и товарах
    await fetchUserInfo()
    await fetchProducts()
    
    alert('Покупка успешно совершена!')
  } catch (error) {
    console.error('Ошибка покупки:', error)
    if (error.response?.data?.error) {
      alert(error.response.data.error)
    } else {
      alert('Произошла ошибка при покупке')
    }
  }
}

const refreshStore = async () => {
  isRefreshing.value = true
  try {
    await fetchProducts()
    await fetchCrowdfundingProducts()
    await fetchUserInfo()
    alert('Магазин успешно обновлен!')
  } catch (error) {
    console.error('Ошибка обновления магазина:', error)
    alert('Произошла ошибка при обновлении магазина. Попробуйте позже.')
  } finally {
    isRefreshing.value = false
  }
}

const openCrowdfundingModal = (product) => {
  selectedProduct.value = product
  contributionAmount.value = ''
  showCrowdfundingModal.value = true
}

const closeCrowdfundingModal = () => {
  showCrowdfundingModal.value = false
  selectedProduct.value = null
  contributionAmount.value = ''
}

const contributeToCrowdfunding = async () => {
  if (!canContribute.value || !selectedProduct.value) return
  
  try {
    await axios.post('/client/crowdfunding/contribute', {
      product_id: selectedProduct.value.id,
      amount: parseInt(contributionAmount.value)
    })
    
    // Обновляем информацию о пользователе и товарах
    await fetchUserInfo()
    await fetchProducts()
    await fetchCrowdfundingProducts()
    
    closeCrowdfundingModal()
    alert('Взнос успешно внесен!')
  } catch (error) {
    console.error('Ошибка взноса:', error)
    if (error.response?.data?.error) {
      alert(error.response.data.error)
    } else {
      alert('Произошла ошибка при внесении взноса')
    }
  }
}

onMounted(() => {
  fetchProducts()
  fetchCrowdfundingProducts()
  fetchUserInfo()
  
  // Запускаем автоматическое обновление каждые 5 секунд для быстрой реакции на изменения
  updateInterval = setInterval(() => {
    fetchProducts()
    fetchCrowdfundingProducts()
    fetchUserInfo()
  }, 5000)
  
  // Добавляем обработчик видимости страницы для обновления при возвращении пользователя
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      console.log('Страница магазина стала видимой, обновляем товары')
      fetchProducts()
      fetchCrowdfundingProducts()
      fetchUserInfo()
    }
  }
  
  // Добавляем обработчик фокуса для обновления при возвращении на страницу
  const handleFocus = () => {
    console.log('Страница магазина получила фокус, обновляем товары')
    fetchProducts()
    fetchCrowdfundingProducts()
    fetchUserInfo()
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleFocus)
  
  // Очищаем обработчики при размонтировании
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('focus', handleFocus)
  })
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.client-store {
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
  margin-bottom: 12px;
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

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.balance-label {
  color: #666;
  font-size: 14px;
}

.balance-value {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 14px;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.store-title {
  color: var(--color-primary);
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.refresh-store-btn {
  background: #e9ecef;
  color: #333;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.refresh-store-btn:hover:not(:disabled) {
  background: #dee2e6;
}

.refresh-store-btn:disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.products-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
}

.product-info {
  padding: 16px;
}

.product-name {
  color: var(--color-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.product-description {
  color: #666;
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.product-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.price-info,
.stock-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-label,
.stock-label {
  color: #666;
  font-size: 12px;
}

.price-value {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 14px;
}

.stock-value {
  color: #666;
  font-size: 14px;
}

.purchase-button {
  width: 100%;
  padding: 12px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.purchase-button:hover:not(.disabled) {
  background: #0f4a3a;
}

/* Розовая тема */
body.theme-pink .purchase-button:hover:not(.disabled) {
  background: #e6399b;
}

.purchase-button.disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
}

.purchase-button.already-purchased {
  background: #28a745;
  color: #fff;
  cursor: not-allowed;
}

.purchase-button.already-purchased:hover {
  background: #28a745;
  transform: none;
}

.empty-products {
  text-align: center;
  color: #666;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 20px 0;
  border: 1px dashed #dee2e6;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-products h3 {
  color: var(--color-primary);
  margin: 0 0 15px 0;
  font-size: 20px;
  font-weight: 600;
}

.empty-products p {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  opacity: 0.8;
}

/* Стили для краудфандинга */
.crowdfunding-progress {
  margin-bottom: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.percentage {
  font-weight: 600;
  color: var(--color-primary);
}

.crowdfunding-card {
  border: 2px solid #dc3545;
}

.crowdfunding-button {
  background: #dc3545;
}

.crowdfunding-button:hover:not(.disabled) {
  background: #c82333;
}

/* Розовая тема */
body.theme-pink .crowdfunding-button {
  background: #e6399b;
}

body.theme-pink .crowdfunding-button:hover:not(.disabled) {
  background: #d63384;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  color: var(--color-primary);
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-button:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 20px;
}

.product-info-modal h4 {
  margin: 0 0 8px 0;
  color: var(--color-primary);
  font-size: 16px;
  font-weight: 600;
}

.product-info-modal p {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.progress-info {
  margin-bottom: 20px;
}

.contribution-form label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.amount-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 8px;
  box-sizing: border-box;
}

.amount-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(17, 87, 64, 0.1);
}

.balance-info-modal {
  margin-bottom: 20px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
}

.contribution-buttons {
  display: flex;
  gap: 12px;
}

.contribute-button {
  flex: 1;
  padding: 12px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contribute-button:hover:not(:disabled) {
  background: #0f4a3a;
}

.contribute-button:disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
}

.cancel-button {
  flex: 1;
  padding: 12px;
  background: #6c757d;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: #5a6268;
}

/* Розовая тема */
body.theme-pink .contribute-button:hover:not(:disabled) {
  background: #e6399b;
}

body.theme-pink .amount-input:focus {
  border-color: #e6399b;
  box-shadow: 0 0 0 2px rgba(230, 57, 155, 0.1);
}

@media (max-width: 480px) {
  .client-store {
    padding: 12px;
  }
  
  .bank-name {
    font-size: 20px;
  }
  
  .product-image-container {
    height: 160px;
  }
  
  .product-info {
    padding: 12px;
  }
  
  .product-name {
    font-size: 16px;
  }
  
  .product-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style> 