<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <div class="header">
      <h2>🛍️ Управление лотами и товарами</h2>
      <el-button type="primary" @click="goToAdd" class="add-button">➕ Добавить товар</el-button>
    </div>
    <div v-if="isMobile" class="mobile-product-list">
      <div v-for="product in products" :key="product.id" class="product-card" @click="goToEdit(product)">
        <div class="product-header">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-id">ID: {{ product.id }}</div>
        </div>
        <div class="product-details">
          <div class="product-row">
            <span class="detail-label">Тип:</span>
            <el-tag :type="getTypeColor(product.type)" size="small">{{ getTypeText(product.type) }}</el-tag>
          </div>
          <div class="product-row">
            <span class="detail-label">Цена:</span>
            <span class="product-price">{{ product.price }} Вектриков</span>
          </div>
          <div class="product-row">
            <span class="detail-label">Остаток:</span>
            <span class="product-stock" :class="product.stock < 10 ? 'low-stock' : ''">{{ product.stock }}</span>
          </div>
        </div>
        <div class="product-status">
          <el-tag :type="product.is_active ? 'success' : 'danger'" size="small">
            {{ product.is_active ? 'Активен' : 'Неактивен' }}
          </el-tag>
        </div>
        <div class="product-actions">
          <el-button type="danger" size="small" @click.stop="deleteProduct(product)" class="delete-btn">
            Удалить
          </el-button>
        </div>
      </div>
    </div>
    <el-table v-else :data="products" style="width: 100%" @row-click="goToEdit" class="desktop-table">
      <el-table-column prop="id" label="ID" width="60"/>
      <el-table-column prop="name" label="Название"/>
      <el-table-column prop="type" label="Тип" width="120">
        <template #default="scope">
          <el-tag :type="getTypeColor(scope.row.type)" size="small">
            {{ getTypeText(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="Цена" width="120">
        <template #default="scope">
          {{ scope.row.price }} Вектриков
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="Остаток" width="100">
        <template #default="scope">
          <span :class="scope.row.stock < 10 ? 'low-stock' : ''">{{ scope.row.stock }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="is_active" label="Активен" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.is_active ? 'success' : 'danger'" size="small">
            {{ scope.row.is_active ? 'Да' : 'Нет' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="" width="100">
        <template #default="scope">
          <el-button type="danger" size="small" @click.stop="deleteProduct(scope.row)">Удалить</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- Таблица покупок пользователей -->
    <div class="purchases-section">
      <h3>📊 История покупок пользователей</h3>
      <div v-if="isMobile" class="mobile-purchases-list">
        <div v-for="purchase in purchases" :key="purchase.id" class="purchase-card">
          <div class="purchase-header">
            <div class="purchase-user">{{ purchase.first_name }} {{ purchase.last_name }}</div>
            <div class="purchase-id">ID: {{ purchase.id }}</div>
          </div>
          <div class="purchase-details">
            <div class="purchase-row">
              <span class="purchase-detail-label">Товар:</span>
              <span class="purchase-detail-value">{{ purchase.product_name }}</span>
            </div>
            <div class="purchase-row">
              <span class="purchase-detail-label">Telegram:</span>
              <span class="purchase-detail-value">@{{ purchase.telegram_username }}</span>
            </div>
            <div class="purchase-row">
              <span class="purchase-detail-label">Дата:</span>
              <span class="purchase-detail-value">{{ formatDate(purchase.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
      <el-table v-else :data="purchases" style="width: 100%" class="purchases-table">
        <el-table-column prop="first_name" label="Имя" width="120" />
        <el-table-column prop="last_name" label="Фамилия" width="120" />
        <el-table-column prop="telegram_username" label="Telegram" width="150">
          <template #default="scope">
            @{{ scope.row.telegram_username }}
          </template>
        </el-table-column>
        <el-table-column prop="product_name" label="Название товара" min-width="200" />
        <el-table-column prop="created_at" label="Дата покупки" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const products = ref([])
const purchases = ref([])
const router = useRouter()
const isMobile = ref(false)

const getTypeColor = (type) => {
  switch (type) {
    case 'regular': return 'primary'
    case 'drop': return 'warning'
    case 'shared': return 'success'
    default: return 'info'
  }
}

const getTypeText = (type) => {
  switch (type) {
    case 'regular': return 'Обычный'
    case 'drop': return 'Мгновенный'
    case 'shared': return 'Коллективный'
    default: return 'Неизвестно'
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const fetchProducts = async () => {
  const resp = await axios.get('/admin/products')
  products.value = resp.data
}

const fetchPurchases = async () => {
  const resp = await axios.get('/admin/purchases')
  purchases.value = resp.data
}

const goToEdit = (row) => {
  router.push(`/admin/products/edit/${row.id}`)
}

const goToAdd = () => {
  router.push('/admin/products/edit')
}

const deleteProduct = async (row) => {
  if (confirm('Удалить товар?')) {
    await axios.delete(`/admin/products/${row.id}`)
    fetchProducts()
  }
}

onMounted(() => {
  fetchProducts()
  fetchPurchases()
  isMobile.value = window.innerWidth < 600
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 600
  })
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  color: var(--color-primary);
}

.add-button {
  height: 40px;
  font-weight: 600;
}

.desktop-table {
  border-radius: 8px;
  overflow: hidden;
}

.desktop-table :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.desktop-table :deep(.el-table__row:hover) {
  background-color: #e0f0e7 !important;
  cursor: pointer;
}

.low-stock {
  color: #e74c3c;
  font-weight: 600;
}

@media (max-width: 600px) {
  .el-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 16px 4vw !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    box-sizing: border-box;
    border: 1px solid var(--color-primary) !important;
  }
  
  .header {
    flex-direction: column !important;
    gap: 16px !important;
    align-items: stretch !important;
    margin-bottom: 20px !important;
  }
  
  .header h2 {
    font-size: 1.4rem !important;
    text-align: center !important;
  }
  
  .add-button {
    width: 100% !important;
    height: 48px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .mobile-product-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .product-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(17,87,64,0.08);
    border: 1px solid #e0e0e0;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .product-card:hover {
    box-shadow: 0 4px 20px rgba(17,87,64,0.12);
    transform: translateY(-2px);
  }
  
  .product-card:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(17,87,64,0.15);
  }
  
  .product-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .product-name {
    font-weight: 700;
    font-size: 18px;
    color: var(--color-primary);
  }
  
  .product-id {
    font-size: 14px;
    color: #666;
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 6px;
  }
  
  .product-details {
    margin-bottom: 16px;
  }
  
  .product-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 8px 0;
  }
  
  .detail-label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
  
  .product-price {
    font-weight: 700;
    font-size: 16px;
    color: #27ae60;
  }
  
  .product-stock {
    font-weight: 600;
    font-size: 16px;
    color: #333;
  }
  
  .product-stock.low-stock {
    color: #e74c3c;
  }
  
  .product-status {
    margin-bottom: 16px;
    text-align: center;
  }
  
  .product-actions {
    display: flex;
    justify-content: center;
  }
  
  .delete-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    border-radius: 8px !important;
  }
  
  .purchases-section {
    margin-top: 40px;
    padding-top: 30px;
    border-top: 2px solid #f0f0f0;
  }
  
  .purchases-section h3 {
    margin: 0 0 20px 0;
    color: var(--color-primary);
    font-size: 20px;
    font-weight: 600;
  }
  
  .purchases-table {
    margin-top: 20px;
  }
  
  .mobile-purchases-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .purchase-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(17,87,64,0.06);
    border: 1px solid #e0e0e0;
  }
  
  .purchase-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .purchase-user {
    font-weight: 600;
    font-size: 16px;
    color: var(--color-primary);
  }
  
  .purchase-id {
    font-size: 12px;
    color: #666;
    background: #f8f9fa;
    padding: 2px 6px;
    border-radius: 4px;
  }
  
  .purchase-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .purchase-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
  }
  
  .purchase-detail-label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
  
  .purchase-detail-value {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }
  
  @media (max-width: 600px) {
    .purchases-section {
      margin-top: 30px;
      padding-top: 20px;
    }
    
    .purchases-section h3 {
      font-size: 18px;
      margin-bottom: 16px;
    }
    
    .purchase-card {
      padding: 12px;
    }
    
    .purchase-header {
      margin-bottom: 10px;
      padding-bottom: 6px;
    }
    
    .purchase-user {
      font-size: 15px;
    }
    
    .purchase-details {
      gap: 6px;
    }
    
    .purchase-row {
      padding: 3px 0;
    }
    
    .purchase-detail-label,
    .purchase-detail-value {
      font-size: 13px;
    }
  }
}
</style> 