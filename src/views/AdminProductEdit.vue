<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/products')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <div class="edit-header">
      <h2>{{ isEdit ? '✏️ Редактировать товар' : '➕ Добавить товар' }}</h2>
    </div>
    
    <!-- Вкладки только при создании товара -->
    <el-tabs v-if="!isEdit" v-model="activeTab" class="product-tabs">
      <!-- Вкладка обычных товаров -->
      <el-tab-pane label="🛍️ Обычный товар" name="regular">
        <el-form :model="product" label-width="120px" class="product-form">
          <div class="form-section">
            <h3>Основная информация</h3>
            <el-form-item label="Название" required>
              <el-input v-model="product.name" placeholder="Введите название товара"/>
            </el-form-item>
            <el-form-item label="Описание">
              <el-input v-model="product.description" type="textarea" :rows="4" placeholder="Введите описание товара"/>
            </el-form-item>
          </div>
          
          <div class="form-section">
            <h3>Цена и тип</h3>
            <el-form-item label="Цена" required>
              <el-input-number v-model="product.price" :min="0" placeholder="0" class="price-input"/>
            </el-form-item>
            <el-form-item label="Тип" required>
              <el-select v-model="product.type" placeholder="Выберите тип" class="type-select">
                <el-option label="Обычный" value="regular"/>
                <el-option label="Мгновенный" value="drop"/>
                <el-option label="Коллективный" value="shared"/>
              </el-select>
            </el-form-item>
          </div>
          
          <div class="form-section">
            <h3>Наличие и статус</h3>
            <el-form-item label="Остаток" required>
              <el-input-number v-model="product.stock" :min="0" placeholder="0" class="stock-input"/>
            </el-form-item>
            <el-form-item label="Активен">
              <el-switch v-model="product.is_active"/>
            </el-form-item>
          </div>
          
          <div class="form-section">
            <h3>Медиа</h3>
            <el-form-item label="Изображение">
              <el-upload
                action="/api/admin/products/upload"
                :on-success="handleUploadSuccess"
                :show-file-list="false"
                class="media-upload"
              >
                <el-button>Загрузить изображение</el-button>
              </el-upload>
              <div v-if="product.media_url" class="media-preview">
                <img :src="product.media_url" class="preview-image"/>
                <div class="media-info">Текущее изображение</div>
              </div>
            </el-form-item>
          </div>
          
          <div class="form-actions">
            <el-button type="primary" @click="saveProduct" class="save-btn">Сохранить</el-button>
          </div>
        </el-form>
      </el-tab-pane>
      
      <!-- Вкладка краудфандинга -->
      <el-tab-pane label="💰 Общий сбор" name="crowdfunding">
        <el-form :model="crowdfundingProduct" label-width="120px" class="product-form">
          <div class="form-section">
            <h3>Основная информация</h3>
            <el-form-item label="Название" required>
              <el-input v-model="crowdfundingProduct.name" placeholder="Введите название товара"/>
            </el-form-item>
            <el-form-item label="Описание">
              <el-input v-model="crowdfundingProduct.description" type="textarea" :rows="4" placeholder="Введите описание товара"/>
            </el-form-item>
          </div>
          
          <div class="form-section">
            <h3>Сбор и статус</h3>
            <el-form-item label="Сумма сбора" required>
              <el-input-number v-model="crowdfundingProduct.target_amount" :min="0" placeholder="0" class="price-input"/>
            </el-form-item>
            <el-form-item label="Активен">
              <el-switch v-model="crowdfundingProduct.is_active"/>
            </el-form-item>
          </div>
          
          <div class="form-section">
            <h3>Медиа</h3>
            <el-form-item label="Изображение">
              <el-upload
                action="/api/admin/products/upload"
                :on-success="handleCrowdfundingUploadSuccess"
                :show-file-list="false"
                class="media-upload"
              >
                <el-button>Загрузить изображение</el-button>
              </el-upload>
              <div v-if="crowdfundingProduct.media_url" class="media-preview">
                <img :src="crowdfundingProduct.media_url" class="preview-image"/>
                <div class="media-info">Текущее изображение</div>
              </div>
            </el-form-item>
          </div>
          
          <div class="form-actions">
            <el-button type="primary" @click="saveCrowdfundingProduct" class="save-btn">Сохранить</el-button>
          </div>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    
    <!-- При редактировании показываем только соответствующие поля -->
    <div v-else>
      <!-- Форма для редактирования обычного товара -->
      <el-form v-if="editingRegularProduct" :model="product" label-width="120px" class="product-form">
        <div class="form-section">
          <h3>Основная информация</h3>
          <el-form-item label="Название" required>
            <el-input v-model="product.name" placeholder="Введите название товара"/>
          </el-form-item>
          <el-form-item label="Описание">
            <el-input v-model="product.description" type="textarea" :rows="4" placeholder="Введите описание товара"/>
          </el-form-item>
        </div>
        
        <div class="form-section">
          <h3>Цена и тип</h3>
          <el-form-item label="Цена" required>
            <el-input-number v-model="product.price" :min="0" placeholder="0" class="price-input"/>
          </el-form-item>
          <el-form-item label="Тип" required>
            <el-select v-model="product.type" placeholder="Выберите тип" class="type-select">
              <el-option label="Обычный" value="regular"/>
              <el-option label="Мгновенный" value="drop"/>
              <el-option label="Коллективный" value="shared"/>
            </el-select>
          </el-form-item>
        </div>
        
        <div class="form-section">
          <h3>Наличие и статус</h3>
          <el-form-item label="Остаток" required>
            <el-input-number v-model="product.stock" :min="0" placeholder="0" class="stock-input"/>
          </el-form-item>
          <el-form-item label="Активен">
            <el-switch v-model="product.is_active"/>
          </el-form-item>
        </div>
        
        <div class="form-section">
          <h3>Медиа</h3>
          <el-form-item label="Изображение">
            <el-upload
              action="/api/admin/products/upload"
              :on-success="handleUploadSuccess"
              :show-file-list="false"
              class="media-upload"
            >
              <el-button>Загрузить изображение</el-button>
            </el-upload>
            <div v-if="product.media_url" class="media-preview">
              <img :src="product.media_url" class="preview-image"/>
              <div class="media-info">Текущее изображение</div>
            </div>
          </el-form-item>
        </div>
        
        <div class="form-actions">
          <el-button type="primary" @click="saveProduct" class="save-btn">Сохранить</el-button>
          <el-button type="danger" @click="deleteProduct" class="delete-btn">Удалить</el-button>
        </div>
      </el-form>
      
      <!-- Форма для редактирования краудфандинг товара -->
      <el-form v-else :model="crowdfundingProduct" label-width="120px" class="product-form">
        <div class="form-section">
          <h3>Основная информация</h3>
          <el-form-item label="Название" required>
            <el-input v-model="crowdfundingProduct.name" placeholder="Введите название товара"/>
          </el-form-item>
          <el-form-item label="Описание">
            <el-input v-model="crowdfundingProduct.description" type="textarea" :rows="4" placeholder="Введите описание товара"/>
          </el-form-item>
        </div>
        
        <div class="form-section">
          <h3>Сбор и статус</h3>
          <el-form-item label="Сумма сбора" required>
            <el-input-number v-model="crowdfundingProduct.target_amount" :min="0" placeholder="0" class="price-input"/>
          </el-form-item>
          <el-form-item label="Активен">
            <el-switch v-model="crowdfundingProduct.is_active"/>
          </el-form-item>
        </div>
        
        <div class="form-section">
          <h3>Медиа</h3>
          <el-form-item label="Изображение">
            <el-upload
              action="/api/admin/products/upload"
              :on-success="handleCrowdfundingUploadSuccess"
              :show-file-list="false"
              class="media-upload"
            >
              <el-button>Загрузить изображение</el-button>
            </el-upload>
            <div v-if="crowdfundingProduct.media_url" class="media-preview">
              <img :src="crowdfundingProduct.media_url" class="preview-image"/>
              <div class="media-info">Текущее изображение</div>
            </div>
          </el-form-item>
        </div>
        
        <div class="form-actions">
          <el-button type="primary" @click="saveCrowdfundingProduct" class="save-btn">Сохранить</el-button>
          <el-button type="danger" @click="deleteCrowdfundingProduct" class="delete-btn">Удалить</el-button>
        </div>
      </el-form>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const activeTab = ref('regular')
const editingRegularProduct = ref(true) // Флаг для определения типа редактируемого товара

const product = ref({
  name: '',
  description: '',
  price: 0,
  type: 'regular',
  stock: 0,
  is_active: true,
  media_url: ''
})

const crowdfundingProduct = ref({
  name: '',
  description: '',
  target_amount: 0,
  is_active: true,
  media_url: ''
})

const isEdit = computed(() => !!route.params.id)

const fetchProduct = async () => {
  if (isEdit.value) {
    try {
      // Пробуем загрузить как обычный товар
      const resp = await axios.get(`/admin/products/${route.params.id}`)
      Object.assign(product.value, resp.data)
      editingRegularProduct.value = true
    } catch (e) {
      // Если не найден, пробуем как краудфандинг товар
      try {
        const resp = await axios.get(`/admin/crowdfunding/${route.params.id}`)
        Object.assign(crowdfundingProduct.value, resp.data)
        editingRegularProduct.value = false
      } catch (e2) {
        alert('Товар не найден')
        router.push('/admin/products')
      }
    }
  }
}

const saveProduct = async () => {
  if (!product.value.name || !product.value.price || !product.value.type || !product.value.stock) {
    alert('Заполните все обязательные поля!')
    return
  }
  try {
    if (isEdit.value) {
      await axios.put(`/admin/products/${route.params.id}`, product.value)
    } else {
      await axios.post('/admin/products', product.value)
    }
    router.push('/admin/products')
  } catch (e) {
    alert('Ошибка сохранения товара: ' + (e.response?.data || e.message))
  }
}

const saveCrowdfundingProduct = async () => {
  if (!crowdfundingProduct.value.name || !crowdfundingProduct.value.target_amount) {
    alert('Заполните все обязательные поля!')
    return
  }
  try {
    if (isEdit.value) {
      await axios.put(`/admin/crowdfunding/${route.params.id}`, crowdfundingProduct.value)
    } else {
      await axios.post('/admin/crowdfunding', crowdfundingProduct.value)
    }
    router.push('/admin/products')
  } catch (e) {
    alert('Ошибка сохранения товара: ' + (e.response?.data || e.message))
  }
}

const handleUploadSuccess = (res) => {
  product.value.media_url = res.url
}

const handleCrowdfundingUploadSuccess = (res) => {
  crowdfundingProduct.value.media_url = res.url
}

const deleteProduct = async () => {
  if (confirm('Удалить товар?')) {
    await axios.delete(`/admin/products/${route.params.id}`)
    router.push('/admin/products')
  }
}

const deleteCrowdfundingProduct = async () => {
  if (confirm('Удалить товар?')) {
    await axios.delete(`/admin/crowdfunding/${route.params.id}`)
    router.push('/admin/products')
  }
}

onMounted(fetchProduct)
</script>

<style scoped>
.edit-header {
  margin-bottom: 24px;
}

.edit-header h2 {
  color: var(--color-primary);
  margin: 0;
}

.product-tabs :deep(.el-tabs__item.is-active) {
  color: #17624A !important;
  font-weight: 700;
}

.product-tabs :deep(.el-tabs__active-bar) {
  background-color: #17624A !important;
}

.product-tabs :deep(.el-tabs__item:hover) {
  color: #17624A !important;
  background: transparent !important;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e0e0e0;
}

.form-section h3 {
  margin-bottom: 20px;
  color: var(--color-primary);
  font-size: 1.1rem;
}

.price-input, .stock-input, .type-select {
  width: 100%;
}

.media-upload {
  margin-bottom: 16px;
}

.media-preview {
  margin-top: 16px;
  text-align: center;
}

.preview-image {
  max-width: 200px;
  max-height: 120px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.media-info {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.save-btn, .delete-btn {
  min-width: 120px;
  height: 44px;
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
  
  .edit-header h2 {
    font-size: 1.4rem !important;
    text-align: center !important;
  }
  
  .product-form {
    gap: 20px;
  }
  
  .form-section {
    padding: 20px;
    border-radius: 10px;
  }
  
  .form-section h3 {
    font-size: 1.1rem !important;
    margin-bottom: 16px !important;
  }
  
  .el-form-item {
    width: 100% !important;
    margin-bottom: 16px !important;
  }
  
  .el-input, .el-button, .el-select, .el-input-number {
    width: 100% !important;
    font-size: 16px !important;
  }
  
  .el-textarea {
    font-size: 16px !important;
  }
  
  .media-upload {
    width: 100% !important;
  }
  
  .preview-image {
    max-width: 100% !important;
    max-height: 150px !important;
  }
  
  .form-actions {
    flex-direction: column !important;
    gap: 12px !important;
    padding: 20px !important;
  }
  
  .save-btn, .delete-btn {
    width: 100% !important;
    height: 48px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
}
</style> 