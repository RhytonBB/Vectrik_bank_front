<template>
  <el-card class="register-card">
    <div class="register-header">
      <h1>👥 Регистрация пользователей</h1>
    </div>
    
    <el-button type="primary" @click="$router.push('/admin/users')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    
    <el-tabs v-model="activeTab" @tab-click="handleTabChange" class="register-tabs">
      <el-tab-pane label="Одиночная регистрация" name="single">
        <div class="single-register-section">
          <h3>Добавить одного пользователя</h3>
          <el-form @submit.prevent="registerUser" class="single-form">
            <div class="form-section">
              <h4>Основная информация</h4>
              <el-form-item label="Имя:" required>
                <el-input v-model="firstName" placeholder="Введите имя" />
              </el-form-item>
              <el-form-item label="Фамилия:" required>
                <el-input v-model="lastName" placeholder="Введите фамилию" />
              </el-form-item>
              <el-form-item label="Telegram username:" required>
                <el-input v-model="tgUsername" placeholder="Введите username без @" />
              </el-form-item>
            </div>
            
            <div class="form-section">
              <h4>Дополнительные настройки</h4>
              <el-form-item label="Группа:">
                <el-select v-model="groupId" placeholder="Выберите группу" clearable class="group-select">
                  <el-option v-for="g in groups" :key="g.id" :label="g.name" :value="g.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="Роль:">
                <el-radio-group v-model="isAdmin" class="role-radio-group">
                  <el-radio :label="false" class="role-radio">Пользователь</el-radio>
                  <el-radio :label="true" class="role-radio">Администратор</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
            
            <el-form-item class="submit-item">
              <el-button type="primary" native-type="submit" class="submit-btn">Создать пользователя</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="Массовая регистрация" name="bulk">
        <div class="bulk-register-section">
          <h3>Загрузить файл с пользователями</h3>
          <div class="upload-info">
            <div class="info-card">
              <div class="info-icon">📋</div>
              <div class="info-content">
                <div class="info-title">Поддерживаемые форматы</div>
                <div class="info-text">CSV, Excel (.xlsx, .xls)</div>
              </div>
            </div>
            <div class="info-card">
              <div class="info-icon">📊</div>
              <div class="info-content">
                <div class="info-title">Структура файла</div>
                <div class="info-text">Имя, Фамилия, Telegram Username</div>
              </div>
            </div>
          </div>
          
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            accept=".csv,.xlsx,.xls"
            drag
            class="file-upload"
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
            <h4>Предварительный просмотр ({{ previewData.length }} пользователей)</h4>
            <div class="preview-table-container">
              <el-table :data="previewData" style="width: 100%" max-height="300" class="preview-table">
                <el-table-column prop="first_name" label="Имя" />
                <el-table-column prop="last_name" label="Фамилия" />
                <el-table-column prop="telegram_username" label="Telegram Username" />
              </el-table>
            </div>
            <el-button type="primary" @click="registerBulkUsers" :loading="bulkLoading" class="bulk-submit-btn">
              Зарегистрировать {{ previewData.length }} пользователей
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <el-alert v-if="message" :title="message" type="success" show-icon closable @close="message = ''" class="success-alert" />
    <el-alert v-if="error" :title="error" type="error" show-icon closable @close="error = ''" class="error-alert" />
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

.register-header {
  margin-bottom: 24px;
}

.register-header h1 {
  color: var(--color-primary);
  font-weight: 800;
  margin: 0;
  text-align: center;
}

.register-tabs :deep(.el-tabs__item.is-active) {
  color: #17624A !important;
  font-weight: 700;
}

.register-tabs :deep(.el-tabs__active-bar) {
  background-color: #17624A !important;
}

.register-tabs :deep(.el-tabs__item:hover) {
  color: #17624A !important;
  background: transparent !important;
}

.single-register-section, .bulk-register-section {
  padding: 24px 0;
}

.single-register-section h3, .bulk-register-section h3 {
  color: var(--color-primary);
  margin-bottom: 24px;
  font-size: 1.2rem;
}

.form-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

.form-section h4 {
  color: var(--color-primary);
  margin-bottom: 16px;
  font-size: 1rem;
}

.single-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.group-select {
  width: 100%;
}

.role-radio-group {
  display: flex;
  gap: 20px;
}

.role-radio {
  margin-right: 0;
}

.submit-item {
  margin-top: 20px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 18px;
  font-weight: 600;
}

.upload-info {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.info-icon {
  font-size: 24px;
}

.info-content {
  flex: 1;
}

.info-title {
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.info-text {
  font-size: 14px;
  color: #666;
}

.file-upload {
  margin-bottom: 24px;
}

.preview-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.preview-section h4 {
  color: var(--color-primary);
  margin-bottom: 16px;
  font-size: 1rem;
}

.preview-table-container {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.preview-table {
  border-radius: 8px;
  overflow: hidden;
}

.preview-table :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.bulk-submit-btn {
  width: 100%;
  height: 48px;
  font-size: 18px;
  font-weight: 600;
}

.success-alert, .error-alert {
  margin-top: 16px;
  border-radius: 8px;
}

@media (max-width: 600px) {
  .register-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 16px 4vw !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    box-sizing: border-box;
  }
  
  .register-header h1 {
    font-size: 1.4rem !important;
  }
  
  .single-register-section, .bulk-register-section {
    padding: 16px 0;
  }
  
  .single-register-section h3, .bulk-register-section h3 {
    font-size: 1.2rem !important;
    margin-bottom: 20px !important;
  }
  
  .form-section {
    padding: 16px;
    border-radius: 10px;
  }
  
  .form-section h4 {
    font-size: 1rem !important;
    margin-bottom: 12px !important;
  }
  
  .el-form-item {
    width: 100% !important;
    margin-bottom: 16px !important;
  }
  
  .el-input, .el-button, .el-select {
    width: 100% !important;
    font-size: 16px !important;
  }
  
  .role-radio-group {
    flex-direction: column !important;
    gap: 12px !important;
  }
  
  .submit-btn {
    height: 52px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .upload-info {
    flex-direction: column !important;
    gap: 12px !important;
  }
  
  .info-card {
    padding: 14px;
  }
  
  .info-icon {
    font-size: 20px !important;
  }
  
  .file-upload {
    margin-bottom: 20px;
  }
  
  .preview-section {
    padding: 16px;
    border-radius: 10px;
  }
  
  .preview-section h4 {
    font-size: 1rem !important;
    margin-bottom: 12px !important;
  }
  
  .preview-table {
    font-size: 14px !important;
    min-width: 600px !important;
  }
  
  .preview-table-container {
    overflow-x: auto !important;
  }
  
  .bulk-submit-btn {
    height: 52px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .success-alert, .error-alert {
    font-size: 16px !important;
    margin-top: 16px !important;
    border-radius: 8px !important;
  }
}
</style> 