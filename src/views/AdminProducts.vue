<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <div class="header">
      <el-button type="primary" @click="goToAdd">Добавить товар</el-button>
    </div>
    <div v-if="isMobile" class="mobile-product-list">
      <div v-for="product in products" :key="product.id" class="product-card" @click="goToEdit(product)">
        <div class="product-row"><b>ID:</b> {{ product.id }}</div>
        <div class="product-row"><b>Название:</b> {{ product.name }}</div>
        <div class="product-row"><b>Тип:</b> {{ product.type }}</div>
        <div class="product-row"><b>Цена:</b> {{ product.price }}</div>
        <div class="product-row"><b>Остаток:</b> {{ product.stock }}</div>
        <div class="product-row"><b>Активен:</b> <el-tag :type="product.is_active ? 'success' : 'danger'">{{ product.is_active ? 'Да' : 'Нет' }}</el-tag></div>
      </div>
    </div>
    <el-table v-else :data="products" style="width: 100%" @row-click="goToEdit">
      <el-table-column prop="id" label="ID" width="60"/>
      <el-table-column prop="name" label="Название"/>
      <el-table-column prop="type" label="Тип"/>
      <el-table-column prop="price" label="Цена"/>
      <el-table-column prop="stock" label="Остаток"/>
      <el-table-column prop="is_active" label="Активен" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.is_active ? 'success' : 'danger'">
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
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const products = ref([])
const router = useRouter()
const isMobile = ref(false)

const fetchProducts = async () => {
  const resp = await axios.get('/api/admin/products')
  products.value = resp.data
}

const goToEdit = (row) => {
  router.push(`/admin/products/edit/${row.id}`)
}

const goToAdd = () => {
  router.push('/admin/products/edit')
}

const deleteProduct = async (row) => {
  if (confirm('Удалить товар?')) {
    await axios.delete(`/api/admin/products/${row.id}`)
    fetchProducts()
  }
}

onMounted(() => {
  fetchProducts()
  isMobile.value = window.innerWidth < 600
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 600
  })
})
</script>

<style scoped>
@media (max-width: 600px) {
  .el-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 12px 2vw !important;
    border-radius: 10px !important;
    box-shadow: none !important;
    box-sizing: border-box;
  }
  .header {
    flex-direction: column !important;
    gap: 14px !important;
    align-items: stretch !important;
    margin-bottom: 16px !important;
  }
  .el-button {
    width: 100% !important;
    min-width: 0 !important;
    font-size: 18px !important;
    margin-bottom: 8px !important;
    border-radius: 8px !important;
    height: 48px !important;
  }
  .mobile-product-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 10px;
  }
  .product-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px 12px;
    box-shadow: 0 2px 8px rgba(17,87,64,0.04);
    font-size: 16px;
    cursor: pointer;
    transition: box-shadow 0.2s;
  }
  .product-card:active {
    box-shadow: 0 4px 16px rgba(17,87,64,0.10);
  }
  .product-row {
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style> 