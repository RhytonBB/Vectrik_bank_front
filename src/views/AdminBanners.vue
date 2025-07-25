<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <h2>Баннеры</h2>
    <el-table :data="banners" style="width: 100%">
      <el-table-column prop="id" label="ID" width="60"/>
      <el-table-column prop="title" label="Заголовок"/>
      <el-table-column prop="image_url" label="Превью" width="120">
        <template #default="scope">
          <img v-if="scope.row.image_url" :src="scope.row.image_url" style="max-width:100px;max-height:60px;"/>
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
    <el-form :model="newBanner" inline @submit.prevent="addBanner">
      <el-form-item label="Заголовок">
        <el-input v-model="newBanner.title" required/>
      </el-form-item>
      <el-form-item label="Файл">
        <el-upload
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
        >
          <el-button>Выбрать файл</el-button>
        </el-upload>
        <span v-if="newBanner.file">{{ newBanner.file.name }}</span>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addBanner">Добавить</el-button>
      </el-form-item>
    </el-form>
    <el-alert v-if="error" :title="error" type="error" show-icon closable @close="error = ''" />
  </el-card>
  <el-dialog v-model="editDialog" title="Редактировать баннер" width="400px">
    <el-form :model="editBanner">
      <el-form-item label="Заголовок">
        <el-input v-model="editBanner.title"/>
      </el-form-item>
      <el-form-item label="Новая фотография">
        <el-upload
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleEditFileChange"
        >
          <el-button>Выбрать файл</el-button>
        </el-upload>
        <div v-if="editBanner.newFile" style="margin-top: 10px;">
          <img :src="editBanner.newFilePreview" style="max-width:200px;max-height:120px;border:1px solid #ddd;border-radius:4px;"/>
          <div style="margin-top: 5px; color: #666; font-size: 12px;">{{ editBanner.newFile.name }}</div>
        </div>
      </el-form-item>
      <el-form-item label="Текущая фотография" v-if="editBanner.image_url">
        <img :src="editBanner.image_url" style="max-width:200px;max-height:120px;"/>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const banners = ref([])
const newBanner = ref({ title: '', file: null })
const error = ref('')

const fetchBanners = async () => {
  try {
    const resp = await axios.get('/api/admin/banners')
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
    await axios.post('/api/admin/banners', formData, {
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
    await axios.post(`/api/admin/banners/${banner.id}/activate`, { is_active: banner.is_active })
    fetchBanners()
  } catch (e) {
    error.value = 'Ошибка изменения статуса баннера'
  }
}

const editDialog = ref(false)
const editBanner = ref({ id: null, title: '', image_url: '', is_active: true, newFile: null, newFilePreview: null })

const handleEditFileChange = (file) => {
  editBanner.value.newFile = file.raw
  
  // Создаем превью для новой фотографии
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
    // Загружаем новый файл
    const formData = new FormData()
    formData.append('file', editBanner.value.newFile)
    const uploadRes = await axios.post('/api/admin/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    editBanner.value.image_url = uploadRes.data.url
  }
  
  await axios.put(`/api/admin/banners/${editBanner.value.id}`, {
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
    await axios.delete(`/api/admin/banners/${row.id}`)
    fetchBanners()
  }
}

onMounted(fetchBanners)
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
  .el-table {
    font-size: 13px !important;
    min-width: 600px !important;
  }
  .el-table__body-wrapper {
    overflow-x: auto !important;
  }
  .el-dialog {
    width: 98vw !important;
    min-width: 0 !important;
    padding: 0 !important;
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