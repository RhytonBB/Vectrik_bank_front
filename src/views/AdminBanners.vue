<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <h2>Баннеры</h2>
    <div v-if="isMobile" class="mobile-banner-list">
      <div v-for="banner in banners" :key="banner.id" class="banner-card">
        <div class="banner-header">
          <div class="banner-title">{{ banner.title }}</div>
          <div class="banner-id">ID: {{ banner.id }}</div>
        </div>
        <div class="banner-image-container">
          <img v-if="banner.image_url" :src="banner.image_url" class="banner-image" />
          <div v-else class="no-image">Нет изображения</div>
        </div>
        <div class="banner-status">
          <el-switch v-model="banner.is_active" @change="() => toggleActive(banner)" />
          <span class="status-text">{{ banner.is_active ? 'Активен' : 'Неактивен' }}</span>
        </div>
        <div class="banner-actions">
          <el-button size="small" @click.stop="openEdit(banner)" class="edit-btn">Редактировать</el-button>
          <el-button type="danger" size="small" @click.stop="deleteBanner(banner)" class="delete-btn">Удалить</el-button>
        </div>
      </div>
    </div>
    <el-table v-else :data="banners" style="width: 100%" class="desktop-table">
      <el-table-column prop="id" label="ID" width="60"/>
      <el-table-column prop="title" label="Заголовок"/>
      <el-table-column prop="image_url" label="Превью" width="120">
        <template #default="scope">
          <img v-if="scope.row.image_url" :src="scope.row.image_url" class="table-image"/>
        </template>
      </el-table-column>
      <el-table-column prop="is_active" label="Активен" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.is_active" @change="() => toggleActive(scope.row)"/>
        </template>
      </el-table-column>
      <el-table-column label="" width="140">
        <template #default="scope">
          <el-button size="small" @click.stop="openEdit(scope.row)">Редактировать</el-button>
          <el-button type="danger" size="small" @click.stop="deleteBanner(scope.row)">Удалить</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="add-banner-section">
      <h3>Добавить новый баннер</h3>
      <el-form :model="newBanner" inline @submit.prevent="addBanner" class="add-form">
        <el-form-item label="Заголовок">
          <el-input v-model="newBanner.title" required placeholder="Введите заголовок баннера"/>
        </el-form-item>
        <el-form-item label="Файл">
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            class="upload-component"
          >
            <el-button>Выбрать файл</el-button>
          </el-upload>
          <span v-if="newBanner.file" class="file-name">{{ newBanner.file.name }}</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addBanner" class="add-btn">Добавить</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-dialog v-model="editDialog" title="Редактировать баннер" width="400px" class="edit-dialog">
      <el-form :model="editBanner" class="edit-form">
        <el-form-item label="Заголовок">
          <el-input v-model="editBanner.title"/>
        </el-form-item>
        <el-form-item label="Новая фотография">
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleEditFileChange"
            class="upload-component"
          >
            <el-button>Выбрать файл</el-button>
          </el-upload>
          <div v-if="editBanner.newFile" class="new-image-preview">
            <img :src="editBanner.newFilePreview" class="preview-image"/>
            <div class="file-info">{{ editBanner.newFile.name }}</div>
          </div>
        </el-form-item>
        <el-form-item label="Текущая фотография" v-if="editBanner.image_url">
          <img :src="editBanner.image_url" class="current-image"/>
        </el-form-item>
        <el-form-item label="Активен">
          <el-switch v-model="editBanner.is_active"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog = false">Отмена</el-button>
        <el-button type="primary" @click="saveEdit">Сохранить</el-button>
      </template>
    </el-dialog>
    <el-alert v-if="error" :title="error" type="error" show-icon closable @close="error = ''" />
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const banners = ref([])
const newBanner = ref({ title: '', file: null })
const error = ref('')
const isMobile = ref(false)

const fetchBanners = async () => {
  try {
    const resp = await axios.get('/admin/banners')
    banners.value = resp.data
  } catch (e) {
    error.value = 'Ошибка загрузки баннеров'
  }
}

const handleFileChange = (file) => {
  newBanner.value.file = file.raw
}

const addBanner = async () => {
  if (!newBanner.value.title || !newBanner.value.file) {
    error.value = 'Заполните все поля и выберите файл'
    return
  }
  const formData = new FormData()
  formData.append('title', newBanner.value.title)
  formData.append('file', newBanner.value.file)
  try {
    await axios.post('/admin/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    newBanner.value.title = ''
    newBanner.value.file = null
    fetchBanners()
  } catch (e) {
    error.value = 'Ошибка добавления баннера'
  }
}

const toggleActive = async (banner) => {
  try {
    await axios.post(`/admin/banners/${banner.id}/activate`, { is_active: banner.is_active })
    fetchBanners()
  } catch (e) {
    error.value = 'Ошибка изменения статуса баннера'
  }
}

const editDialog = ref(false)
const editBanner = ref({ id: null, title: '', image_url: '', is_active: true, newFile: null, newFilePreview: null })

const handleEditFileChange = (file) => {
  editBanner.value.newFile = file.raw
  const reader = new FileReader()
  reader.onload = (e) => {
    editBanner.value.newFilePreview = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const openEdit = (row) => {
  editBanner.value = { ...row, newFile: null, newFilePreview: null }
  editDialog.value = true
}

const saveEdit = async () => {
  if (editBanner.value.newFile) {
    const formData = new FormData()
    formData.append('file', editBanner.value.newFile)
    const uploadRes = await axios.post('/admin/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    editBanner.value.image_url = uploadRes.data.url
  }
  await axios.put(`/admin/banners/${editBanner.value.id}`, {
    title: editBanner.value.title,
    image_url: editBanner.value.image_url,
    is_active: editBanner.value.is_active
  })
  editBanner.value.newFile = null
  editBanner.value.newFilePreview = null
  editDialog.value = false
  fetchBanners()
}

const deleteBanner = async (row) => {
  if (confirm('Удалить баннер?')) {
    await axios.delete(`/admin/banners/${row.id}`)
    fetchBanners()
  }
}

onMounted(() => {
  fetchBanners()
  isMobile.value = window.innerWidth < 600
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 600
  })
})
</script>

<style scoped>
.desktop-table {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.desktop-table :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.desktop-table :deep(.el-table__row:hover) {
  background-color: #e0f0e7 !important;
}

.table-image {
  max-width: 100px;
  max-height: 60px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.add-banner-section {
  margin-top: 32px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.add-banner-section h3 {
  margin-bottom: 16px;
  color: var(--color-primary);
}

.add-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.upload-component {
  margin-bottom: 8px;
}

.file-name {
  display: block;
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.add-btn {
  height: 40px;
  font-weight: 600;
}

.edit-dialog {
  border-radius: 12px;
}

.edit-form {
  padding: 16px 0;
}

.new-image-preview {
  margin-top: 12px;
  text-align: center;
}

.preview-image {
  max-width: 200px;
  max-height: 120px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 8px;
}

.current-image {
  max-width: 200px;
  max-height: 120px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.file-info {
  font-size: 12px;
  color: #666;
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
  
  h2 {
    font-size: 1.4rem !important;
    margin-bottom: 20px !important;
    color: var(--color-primary);
  }
  
  .mobile-banner-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .banner-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(17,87,64,0.08);
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
  }
  
  .banner-card:hover {
    box-shadow: 0 4px 20px rgba(17,87,64,0.12);
    transform: translateY(-2px);
  }
  
  .banner-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .banner-title {
    font-weight: 700;
    font-size: 18px;
    color: var(--color-primary);
  }
  
  .banner-id {
    font-size: 14px;
    color: #666;
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 6px;
  }
  
  .banner-image-container {
    margin-bottom: 16px;
    text-align: center;
  }
  
  .banner-image {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .no-image {
    padding: 40px 20px;
    background: #f8f9fa;
    border: 2px dashed #ddd;
    border-radius: 8px;
    color: #666;
    font-style: italic;
  }
  
  .banner-status {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .status-text {
    font-weight: 600;
    color: var(--color-primary);
  }
  
  .banner-actions {
    display: flex;
    gap: 12px;
  }
  
  .edit-btn, .delete-btn {
    flex: 1;
    height: 44px;
    font-size: 16px;
    border-radius: 8px;
  }
  
  .add-banner-section {
    margin-top: 24px;
    padding: 20px;
    border-radius: 10px;
  }
  
  .add-banner-section h3 {
    font-size: 1.2rem !important;
    margin-bottom: 16px !important;
  }
  
  .add-form {
    flex-direction: column !important;
    gap: 16px !important;
  }
  
  .el-form-item {
    width: 100% !important;
    margin-bottom: 16px !important;
  }
  
  .el-input, .el-button {
    width: 100% !important;
    font-size: 16px !important;
  }
  
  .add-btn {
    height: 48px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .upload-component {
    width: 100% !important;
  }
  
  .file-name {
    margin-top: 8px !important;
    font-size: 14px !important;
  }
  
  .edit-dialog {
    width: 95vw !important;
    max-width: none !important;
    border-radius: 12px !important;
  }
  
  .edit-form {
    padding: 0 !important;
  }
  
  .preview-image, .current-image {
    max-width: 100% !important;
    max-height: 150px !important;
  }
  
  .el-alert {
    font-size: 16px !important;
    margin-top: 16px !important;
    border-radius: 8px !important;
  }
}
</style> 