<template>
  <el-card class="register-card">
    <h1>Регистрация пользователей</h1>
    
    <el-button type="primary" @click="$router.push('/admin/users')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <!-- Переключатель режимов -->
    <el-tabs v-model="activeTab" @tab-click="handleTabChange" class="custom-tabs">
      <el-tab-pane label="Одиночная регистрация" name="single">
        <el-form @submit.prevent="registerUser">
          <el-form-item label="Имя:">
            <el-input v-model="firstName" required />
          </el-form-item>
          <el-form-item label="Фамилия:">
            <el-input v-model="lastName" required />
          </el-form-item>
          <el-form-item label="Telegram username:">
            <el-input v-model="tgUsername" required />
          </el-form-item>
          <el-form-item label="Группа:">
            <el-select v-model="groupId" placeholder="Выберите группу" clearable>
              <el-option v-for="g in groups" :key="g.id" :label="g.name" :value="g.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="Роль:">
            <el-radio-group v-model="isAdmin">
              <el-radio :label="false">Пользователь</el-radio>
              <el-radio :label="true">Админ</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit">Создать пользователя</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <el-tab-pane label="Массовая регистрация" name="bulk">
        <div class="bulk-upload">
          <h3>Загрузите файл с пользователями</h3>
          <p class="help-text">
            Поддерживаемые форматы: CSV, Excel (.xlsx)<br>
            Структура файла: Имя, Фамилия, Telegram Username
          </p>
          
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            accept=".csv,.xlsx,.xls"
            drag
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              Перетащите файл сюда или <em>нажмите для выбора</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                CSV файл должен содержать заголовки: Имя, Фамилия, Telegram Username
              </div>
            </template>
          </el-upload>
          
          <div v-if="previewData.length > 0" class="preview-section">
            <h4>Предварительный просмотр ({{ previewData.length }} пользователей):</h4>
            <el-table :data="previewData" style="width: 100%" max-height="300">
              <el-table-column prop="first_name" label="Имя" />
              <el-table-column prop="last_name" label="Фамилия" />
              <el-table-column prop="telegram_username" label="Telegram Username" />
            </el-table>
            <el-button type="primary" @click="registerBulkUsers" :loading="bulkLoading">
              Зарегистрировать {{ previewData.length }} пользователей
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <el-alert v-if="message" :title="message" type="success" show-icon closable @close="message = ''" />
    <el-alert v-if="error" :title="error" type="error" show-icon closable @close="error = ''" />
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import axios from 'axios'

const activeTab = ref('single')
const firstName = ref('')
const lastName = ref('')
const tgUsername = ref('')
const groupId = ref(null)
const isAdmin = ref(false)
const message = ref('')
const error = ref('')
const previewData = ref([])
const bulkLoading = ref(false)
const uploadRef = ref()
const groups = ref([])

const fetchGroups = async () => {
  const resp = await axios.get('/api/admin/groups')
  groups.value = resp.data
}

onMounted(fetchGroups)

const handleTabChange = () => {
  // Очищаем данные при переключении
  previewData.value = []
  message.value = ''
  error.value = ''
}

const registerUser = async () => {
  try {
    await axios.post('/api/admin/users', {
      first_name: firstName.value,
      last_name: lastName.value,
      tg_username: tgUsername.value,
      group_id: groupId.value,
      is_admin: isAdmin.value
    })
    message.value = 'Пользователь успешно создан!'
    error.value = ''
    firstName.value = ''
    lastName.value = ''
    tgUsername.value = ''
    groupId.value = null
    isAdmin.value = false
  } catch (e) {
    error.value = 'Ошибка регистрации'
  }
}

const beforeUpload = (file) => {
  const isValidType = file.type === 'text/csv' || 
                     file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     file.type === 'application/vnd.ms-excel'
  
  if (!isValidType) {
    error.value = 'Поддерживаются только CSV и Excel файлы'
    return false
  }
  
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    error.value = 'Размер файла не должен превышать 2MB'
    return false
  }
  
  return true
}

const handleFileChange = async (file) => {
  if (!file.raw) return
  
  try {
    const formData = new FormData()
    formData.append('file', file.raw)
    
    const response = await axios.post('/api/admin/users/bulk/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    previewData.value = response.data.users
    message.value = `Файл загружен. Найдено ${response.data.users.length} пользователей`
    error.value = ''
  } catch (e) {
    error.value = 'Ошибка обработки файла: ' + (e.response?.data?.error || e.message)
    previewData.value = []
  }
}

const registerBulkUsers = async () => {
  if (previewData.value.length === 0) {
    error.value = 'Нет данных для регистрации'
    return
  }
  
  bulkLoading.value = true
  try {
    const response = await axios.post('/api/admin/users/bulk', {
      users: previewData.value
    })
    
    message.value = `Успешно зарегистрировано ${response.data.created} пользователей`
    if (response.data.errors && response.data.errors.length > 0) {
      error.value = `Ошибки при регистрации: ${response.data.errors.join(', ')}`
    }
    
    previewData.value = []
    uploadRef.value?.clearFiles()
  } catch (e) {
    error.value = 'Ошибка массовой регистрации: ' + (e.response?.data?.error || e.message)
  } finally {
    bulkLoading.value = false
  }
}
</script>

<style scoped>
.register-card {
  max-width: 800px;
  margin: 40px auto;
  padding: 32px 24px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(17, 87, 64, 0.08);
  border: 2px solid var(--color-primary);
  font-family: 'Inter', sans-serif;
}

h1 {
  color: var(--color-primary);
  font-weight: 800;
  margin-bottom: 24px;
}

.bulk-upload {
  padding: 20px 0;
}

.help-text {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.5;
}

.preview-section {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-section h4 {
  margin-bottom: 15px;
  color: var(--color-primary);
}

.custom-tabs >>> .el-tabs__item.is-active {
  color: #17624A !important;
  font-weight: 700;
}
.custom-tabs >>> .el-tabs__active-bar {
  background-color: #17624A !important;
}
.custom-tabs >>> .el-tabs__item:hover {
  color: #17624A !important;
  background: transparent !important;
}

@media (max-width: 600px) {
  .register-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 12px 2vw !important;
    border-radius: 10px !important;
    box-sizing: border-box;
  }
  h1 {
    font-size: 1.2rem !important;
    margin-bottom: 12px !important;
  }
  .el-form, .el-form-item, .el-button {
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box;
    font-size: 16px !important;
  }
  .bulk-upload, .preview-section {
    padding: 10px 0 !important;
  }
  .el-table {
    font-size: 13px !important;
    min-width: 600px !important;
  }
  .el-table__body-wrapper {
    overflow-x: auto !important;
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