<template>
  <ClientLayout>
    <div class="client-store">
      <!-- Заголовок -->
      <div class="header">
        <div class="logo-section">
          <img src="/logo.png" alt="Вектрик Банк" class="logo">
          <h1 class="bank-name">Вектрик Банк</h1>
        </div>
        <div class="balance-info">
          <span class="balance-label">Баланс:</span>
          <span class="balance-value">{{ userInfo.balance }} Вектриков</span>
        </div>
      </div>

      <!-- Заголовок магазина -->
      <h2 class="store-title">Магазин</h2>

      <!-- Список товаров -->
      <div class="products-grid">
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
              :class="{ 'disabled': !canPurchase(product) }"
            >
              {{ getPurchaseButtonText(product) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Сообщение об отсутствии товаров -->
      <div v-if="products.length === 0" class="empty-products">
        <p>В магазине пока нет товаров</p>
      </div>
    </div>
  </ClientLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import ClientLayout from '@/components/ClientLayout.vue'

const products = ref([])
const userInfo = ref({})

const fetchProducts = async () => {
  try {
    const response = await axios.get('/api/client/products')
    products.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error)
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

const canPurchase = (product) => {
  return product.stock > 0 && userInfo.value.balance >= product.price
}

const getPurchaseButtonText = (product) => {
  if (product.stock === 0) return 'Нет в наличии'
  if (userInfo.value.balance < product.price) return 'Недостаточно средств'
  return 'Заказать'
}

const purchaseProduct = async (product) => {
  if (!canPurchase(product)) return
  
  try {
    await axios.post('/api/client/purchase', {
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

onMounted(() => {
  fetchProducts()
  fetchUserInfo()
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
  color: #17624A;
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
  color: #17624A;
  font-weight: 600;
  font-size: 14px;
}

.store-title {
  color: #17624A;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-align: center;
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
  color: #17624A;
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
  color: #17624A;
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
  background: #17624A;
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

.purchase-button.disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
}

.empty-products {
  text-align: center;
  color: #666;
  padding: 40px 20px;
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