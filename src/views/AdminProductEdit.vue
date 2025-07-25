<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/products')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <h2>{{ isEdit ? 'Редактировать товар' : 'Добавить товар' }}</h2>
    <el-form :model="product" label-width="120px">
      <el-form-item label="Название">
        <el-input v-model="product.name"/>
      </el-form-item>
      <el-form-item label="Описание">
        <el-input v-model="product.description" type="textarea"/>
      </el-form-item>
      <el-form-item label="Цена">
        <el-input-number v-model="product.price" :min="0"/>
      </el-form-item>
      <el-form-item label="Тип">
        <el-select v-model="product.type" placeholder="Выберите тип">
          <el-option label="Обычный" value="regular"/>
          <el-option label="Мгновенный" value="drop"/>
          <el-option label="Коллективный" value="shared"/>
        </el-select>
      </el-form-item>
      <el-form-item label="Остаток">
        <el-input-number v-model="product.stock" :min="0"/>
      </el-form-item>
      <el-form-item label="Активен">
        <el-switch v-model="product.is_active"/>
      </el-form-item>
      <el-form-item label="Медиа">
        <el-upload
          action="/api/admin/products/upload"
          :on-success="handleUploadSuccess"
          :show-file-list="false"
        >
          <el-button>Загрузить</el-button>
        </el-upload>
        <div v-if="product.media_url">
          <img :src="product.media_url" style="max-width: 200px; margin-top: 10px"/>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveProduct">Сохранить</el-button>
        <el-button v-if="isEdit" type="danger" @click="deleteProduct">Удалить</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const product = ref({
  name: '',
  description: '',
  price: 0,
  type: 'regular',
  stock: 0,
  is_active: true,
  media_url: ''
})

const isEdit = computed(() => !!route.params.id)

const fetchProduct = async () => {
  if (isEdit.value) {
    const resp = await axios.get(`/api/admin/products/${route.params.id}`)
    Object.assign(product.value, resp.data)
  }
}

const saveProduct = async () => {
  if (!product.value.name || !product.value.price || !product.value.type || !product.value.stock) {
    alert('Заполните все обязательные поля!')
    return
  }
  try {
    if (isEdit.value) {
      await axios.put(`/api/admin/products/${route.params.id}`, product.value)
    } else {
      await axios.post('/api/admin/products', product.value)
    }
    router.push('/admin/products')
  } catch (e) {
    alert('Ошибка сохранения товара: ' + (e.response?.data || e.message))
  }
}

const handleUploadSuccess = (res) => {
  product.value.media_url = res.url
}

const deleteProduct = async () => {
  if (confirm('Удалить товар?')) {
    await axios.delete(`/api/admin/products/${route.params.id}`)
    router.push('/admin/products')
  }
}

onMounted(fetchProduct)
</script>

<style scoped>
@media (max-width: 600px) {
  .el-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 12px 2vw !important;
    border-radius: 10px !important;
    box-sizing: border-box;
  }
  h2 {
    font-size: 1.2rem !important;
    margin-bottom: 12px !important;
  }
  .el-form, .el-form-item, .el-button {
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box;
    font-size: 16px !important;
  }
  .el-upload {
    width: 100% !important;
    min-width: 0 !important;
  }
  .el-upload__text {
    font-size: 15px !important;
  }
  .el-upload__tip {
    font-size: 13px !important;
  }
}
</style> 