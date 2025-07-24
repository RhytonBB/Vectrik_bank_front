<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <div class="header">
      <h2>Товары/Лоты</h2>
      <el-button type="primary" @click="goToAdd">Добавить товар</el-button>
    </div>
    <el-table :data="products" style="width: 100%" @row-click="goToEdit">
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

onMounted(fetchProducts)
</script>

<style scoped>
@media (max-width: 600px) {
  .header {
    flex-direction: column !important;
    gap: 8px !important;
    align-items: stretch !important;
  }
  .el-table {
    font-size: 13px !important;
    min-width: 600px !important;
  }
  .el-table__body-wrapper {
    overflow-x: auto !important;
  }
}
</style> 