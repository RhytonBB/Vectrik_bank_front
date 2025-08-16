<template>
  <el-card class="broadcast-page">
    <div class="page-header">
      <el-button 
        type="primary" 
        @click="$router.push('/admin/dashboard')" 
        class="back-button"
        size="large"
      >
        <i class="el-icon-arrow-left"></i>
        <span>Назад</span>
      </el-button>
      <h1 class="page-title">📢 Рассылка через Telegram-бота</h1>
    </div>
    <div class="broadcast-form-section">
      <h3>Отправить сообщение</h3>
      <el-form :model="messageForm" label-width="200px" class="broadcast-form" :inline="!isMobile">
        <el-form-item label="Текст сообщения" required class="message-text-item">
          <el-input
            v-model="messageForm.text"
            type="textarea"
            :rows="4"
            placeholder="Введите текст сообщения..."
            class="message-textarea"
          />
        </el-form-item>
        <el-form-item label="Медиа" class="media-item">
          <el-upload
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleMediaChange"
            :on-remove="handleMediaRemove"
            multiple
            class="media-upload"
          >
            <el-button>Выбрать файлы</el-button>
          </el-upload>
          <div class="media-info">
            <p><strong>Ограничения:</strong></p>
            <ul>
              <li>Фото: до 10MB</li>
              <li>Видео: до 50MB (большие видео отправляются как документы)</li>
              <li>Документы: до 200MB</li>
            </ul>
          </div>
          <div v-if="messageForm.mediaFiles.length > 0" class="media-preview">
            <div v-for="(file, index) in messageForm.mediaFiles" :key="index" class="media-file-preview">
              <img v-if="file.type === 'image'" :src="file.preview" class="preview-image"/>
              <video v-else-if="file.type === 'video'" :src="file.preview" class="preview-video" controls/>
              <div v-else class="file-preview-placeholder">{{ file.raw.name }}</div>
              <div class="file-info">
                <span>{{ file.raw.name }}</span>
                <el-button size="small" type="danger" @click="removeMediaFile(index)" class="remove-file-btn">
                  Удалить
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="Целевая аудитория *" class="target-item">
          <el-radio-group v-model="messageForm.targetType" @change="handleTargetTypeChange" class="target-radio-group">
            <el-radio label="all">Всем пользователям</el-radio>
            <el-radio label="manual">Выбрать вручную</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="messageForm.targetType === 'manual'" label="Выбор пользователей" class="users-select-item">
          <el-select
            v-model="messageForm.targetUserIDs"
            multiple
            filterable
            placeholder="Выберите пользователей"
            class="users-select"
          >
            <el-option
              v-for="user in availableUsers"
              :key="user.id"
              :label="`${user.first_name} ${user.last_name} (@${user.telegram_username})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="send-button-item">
          <el-button type="primary" size="small" @click="sendMessage" :loading="sending" class="send-button">
            Отправить
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="history-section">
      <h3>История сообщений</h3>
      <div v-if="isMobile" class="mobile-broadcast-list">
        <div v-for="item in broadcastHistory" :key="item.id" class="broadcast-card-mobile">
          <div class="broadcast-header">
            <div class="broadcast-id">ID: {{ item.id }}</div>
            <div class="broadcast-status" :class="item.status">
              <el-tag :type="getStatusType(item.status)" size="small">{{ getStatusText(item.status) }}</el-tag>
            </div>
          </div>
          <div class="broadcast-content">
            <div class="broadcast-text">{{ item.text }}</div>
            <div class="broadcast-target">
              <span class="target-label">Аудитория:</span>
              <el-tag :type="getTargetType(item.target_type)" size="small">{{ getTargetText(item.target_type) }}</el-tag>
            </div>
          </div>
          <div class="broadcast-stats">
            <div class="stat-item">
              <span class="stat-label">Отправлено:</span>
              <span class="stat-value success">{{ item.sent_count }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Ошибок:</span>
              <span class="stat-value danger">{{ item.failed_count }}</span>
            </div>
          </div>
          <div class="broadcast-footer">
            <div class="broadcast-date">{{ formatDate(item.created_at) }}</div>
            <el-button size="small" @click="viewHistory(item)" class="history-btn">История</el-button>
          </div>
        </div>
      </div>
      <el-table v-else :data="broadcastHistory" style="width: 100%" class="broadcast-table">
        <el-table-column prop="id" label="ID" width="60"/>
        <el-table-column prop="text" label="Текст" show-overflow-tooltip>
          <template #default="scope">
            <div class="table-text">{{ scope.row.text }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="target_type" label="Аудитория" width="120">
          <template #default="scope">
            <el-tag :type="getTargetType(scope.row.target_type)" size="small">
              {{ getTargetText(scope.row.target_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Статус" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sent_count" label="Отправлено" width="100"/>
        <el-table-column prop="failed_count" label="Ошибок" width="100"/>
        <el-table-column prop="created_at" label="Дата" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="" width="100">
          <template #default="scope">
            <el-button size="small" @click="viewHistory(scope.row)">История</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <el-dialog v-model="historyDialog" title="История отправки" width="800px" class="history-dialog">
      <div v-if="isMobile" class="mobile-history-list">
        <div v-for="msg in messageHistory" :key="msg.id" class="history-card-mobile">
          <div class="history-header">
            <div class="user-name">{{ msg.user?.first_name }} {{ msg.user?.last_name }}</div>
            <div class="user-status" :class="msg.status">
              <el-tag :type="msg.status === 'sent' ? 'success' : 'danger'" size="small">
                {{ msg.status === 'sent' ? 'Отправлено' : 'Ошибка' }}
              </el-tag>
            </div>
          </div>
          <div class="user-info">
            <div class="telegram-username">@{{ msg.user?.telegram_username }}</div>
            <div class="sent-time">{{ formatDate(msg.sent_at) }}</div>
          </div>
          <div v-if="msg.error_message" class="error-message">
            <span class="error-label">Ошибка:</span>
            <span class="error-text">{{ msg.error_message }}</span>
          </div>
        </div>
      </div>
      <el-table v-else :data="messageHistory" style="width: 100%" class="history-table">
        <el-table-column prop="user.first_name" label="Пользователь">
          <template #default="scope">
            {{ scope.row.user?.first_name }} {{ scope.row.user?.last_name }}
          </template>
        </el-table-column>
        <el-table-column prop="user.telegram_username" label="Telegram">
          <template #default="scope">
            @{{ scope.row.user?.telegram_username }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Статус" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'sent' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 'sent' ? 'Отправлено' : 'Ошибка' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="error_message" label="Ошибка" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.error_message || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="sent_at" label="Время" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.sent_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-alert v-if="error" :title="error" type="error" show-icon closable @close="error = ''" />
    <el-alert v-if="success" :title="success" type="success" show-icon closable @close="success = ''" />
  </el-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const messageForm = ref({
  text: '',
  mediaFiles: [],
  targetType: 'all',
  targetUserIDs: []
})
const broadcastHistory = ref([])
const availableUsers = ref([])
const messageHistory = ref([])
const historyDialog = ref(false)
const sending = ref(false)
const error = ref('')
const success = ref('')
const isMobile = ref(false)

// Очистка URL объектов при размонтировании
onUnmounted(() => {
  messageForm.value.mediaFiles.forEach(file => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
  })
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusType = (status) => {
  switch (status) {
    case 'pending': return 'info'
    case 'sending': return 'warning'
    case 'completed': return 'success'
    default: return 'danger'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return 'Ожидает'
    case 'sending': return 'Отправляется'
    case 'completed': return 'Завершено'
    default: return 'Ошибка'
  }
}

const getTargetType = (targetType) => {
  switch (targetType) {
    case 'all': return 'success'
    case 'registered': return 'warning'
    default: return 'info'
  }
}

const getTargetText = (targetType) => {
  switch (targetType) {
    case 'all': return 'Все'
    case 'registered': return 'Зарегистрированные'
    default: return 'Вручную'
  }
}

const fetchBroadcastHistory = async () => {
  try {
    const resp = await axios.get('/admin/broadcast')
    broadcastHistory.value = resp.data
  } catch (e) {
    error.value = 'Ошибка загрузки истории'
  }
}
const fetchAvailableUsers = async () => {
  try {
    const resp = await axios.get('/admin/broadcast/users?type=all')
    availableUsers.value = resp.data
  } catch (e) {
    error.value = 'Ошибка загрузки пользователей'
  }
}
const handleMediaChange = (file) => {
  // Проверяем размер файла в зависимости от типа
  let maxSize
  const fileName = file.raw.name.toLowerCase()
  
  if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    maxSize = 10 * 1024 * 1024 // 10MB для фото
  } else if (fileName.match(/\.(mp4|avi|mov|mkv|webm)$/)) {
    maxSize = 50 * 1024 * 1024 // 50MB для видео (как документ)
  } else {
    maxSize = 200 * 1024 * 1024 // 200MB для документов
  }
  
  if (file.raw.size > maxSize) {
    const sizeText = maxSize >= 1024 * 1024 * 1024 
      ? `${maxSize / (1024 * 1024 * 1024)}GB` 
      : `${maxSize / (1024 * 1024)}MB`
    error.value = `Файл ${file.raw.name} слишком большой. Максимальный размер: ${sizeText}`
    return
  }
  
  const newFile = {
    raw: file.raw,
    preview: URL.createObjectURL(file.raw),
    type: file.raw.type.split('/')[0] // image, video, document
  }
  messageForm.value.mediaFiles.push(newFile)
}
const handleMediaRemove = (file) => {
  const index = messageForm.value.mediaFiles.findIndex(f => f.raw === file.raw)
  if (index !== -1) {
    messageForm.value.mediaFiles.splice(index, 1)
  }
}
const removeMediaFile = (index) => {
  // Очищаем URL объект для предотвращения утечек памяти
  if (messageForm.value.mediaFiles[index].preview) {
    URL.revokeObjectURL(messageForm.value.mediaFiles[index].preview)
  }
  messageForm.value.mediaFiles.splice(index, 1)
}
const handleTargetTypeChange = () => {
  messageForm.value.targetUserIDs = []
}
const sendMessage = async () => {
  if (!messageForm.value.text.trim()) {
    error.value = 'Введите текст сообщения'
    return
  }
  if (messageForm.value.targetType === 'manual' && messageForm.value.targetUserIDs.length === 0) {
    error.value = 'Выберите хотя бы одного пользователя'
    return
  }
  sending.value = true
  error.value = ''
  try {
    // Загружаем все медиафайлы
    const mediaFiles = []
    for (const file of messageForm.value.mediaFiles) {
      const formData = new FormData()
      formData.append('file', file.raw)
      const uploadRes = await axios.post('/admin/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      // Определяем тип файла
      let fileType = 'document'
      const fileName = file.raw.name.toLowerCase()
      if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        fileType = 'image'
      } else if (fileName.match(/\.(mp4|avi|mov|mkv|webm)$/)) {
        fileType = 'video'
      } else if (fileName.match(/\.(gif)$/)) {
        fileType = 'gif'
      }
      
      mediaFiles.push({
        url: uploadRes.data.url,
        type: fileType,
        caption: '',
        position: 0
      })
    }
    
    // Отправляем broadcast сообщение
    await axios.post('/admin/broadcast', {
      text: messageForm.value.text,
      media_files: mediaFiles,
      target_type: messageForm.value.targetType,
      target_user_ids: messageForm.value.targetUserIDs
    })
    
    success.value = 'Сообщение отправлено'
    messageForm.value = {
      text: '',
      mediaFiles: [],
      targetType: 'all',
      targetUserIDs: []
    }
    fetchBroadcastHistory()
  } catch (e) {
    error.value = 'Ошибка отправки сообщения'
  } finally {
    sending.value = false
  }
}
const viewHistory = async (broadcast) => {
  try {
    const resp = await axios.get(`/admin/broadcast/${broadcast.id}/history`)
    messageHistory.value = resp.data
    historyDialog.value = true
  } catch (e) {
    error.value = 'Ошибка загрузки истории'
  }
}
onMounted(() => {
  fetchBroadcastHistory()
  fetchAvailableUsers()
  isMobile.value = window.innerWidth < 600
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 600
  })
})
</script>

<style scoped>
.broadcast-page {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  overflow: hidden;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px 0;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 16px;
  margin: -20px -20px 32px -20px;
  position: relative;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(17, 87, 64, 0.05) 0%, rgba(74, 222, 128, 0.05) 100%);
  border-radius: 16px;
}

.back-button {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, var(--color-primary), #4ade80);
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(17, 87, 64, 0.3);
  transition: all 0.3s ease;
}

.back-button:hover {
  transform: translateY(-50%) translateX(-4px);
  box-shadow: 0 6px 20px rgba(17, 87, 64, 0.4);
}

.back-button i {
  margin-right: 8px;
  font-size: 16px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-primary);
  margin: 0;
  text-shadow: 0 2px 4px rgba(17, 87, 64, 0.1);
  position: relative;
  z-index: 1;
}

.broadcast-form-section {
  margin-bottom: 32px;
  padding: 28px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  border: 1px solid #e8eaed;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.broadcast-form-section:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.broadcast-form-section h3 {
  margin-bottom: 24px;
  color: var(--color-primary);
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  position: relative;
}

.broadcast-form-section h3::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), #4ade80);
  border-radius: 2px;
}

.broadcast-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.message-text-item {
  width: 100%;
}

.message-textarea {
  width: 100%;
}

.message-textarea :deep(.el-textarea__inner) {
  border-radius: 12px;
  border: 2px solid #e8eaed;
  transition: all 0.3s ease;
  font-size: 16px;
  line-height: 1.6;
  padding: 16px;
}

.message-textarea :deep(.el-textarea__inner:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(17, 87, 64, 0.1);
}

.media-item {
  width: 100%;
}

.media-upload {
  margin-bottom: 16px;
}

.media-upload :deep(.el-upload) {
  width: 100%;
}

.media-upload :deep(.el-button) {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--color-primary), #4ade80);
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.media-upload :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(17, 87, 64, 0.3);
}

.media-info {
  margin-top: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
  font-size: 14px;
  color: #0c4a6e;
  box-shadow: 0 2px 8px rgba(186, 230, 253, 0.3);
}

.media-info p {
  margin: 0 0 10px 0;
  font-weight: 700;
  font-size: 15px;
}

.media-info ul {
  margin: 0;
  padding-left: 24px;
}

.media-info li {
  margin-bottom: 6px;
  line-height: 1.5;
}

.media-preview {
  margin-top: 16px;
  text-align: center;
}

.media-file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #ffffff;
  border: 2px solid #f1f5f9;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.media-file-preview:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(17, 87, 64, 0.15);
}

.file-preview-placeholder {
  font-style: italic;
  color: #64748b;
  margin-bottom: 12px;
  font-size: 14px;
}

.preview-image, .preview-video {
  max-width: 220px;
  max-height: 140px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.preview-image:hover, .preview-video:hover {
  border-color: var(--color-primary);
  transform: scale(1.02);
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 12px;
  font-size: 13px;
  color: #475569;
}

.remove-file-btn {
  margin-left: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.remove-file-btn:hover {
  transform: scale(1.05);
}

.target-item {
  width: 100%;
}

.target-item :deep(.el-form-item__label) {
  font-weight: 700;
  color: #1e293b;
  font-size: 16px;
  text-align: left;
  margin-bottom: 12px;
}

.target-radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.target-radio-group :deep(.el-radio) {
  margin-right: 0;
  margin-bottom: 0;
  padding: 12px 16px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  background: #ffffff;
  cursor: pointer;
}

.target-radio-group :deep(.el-radio:hover) {
  background: #f8fafc;
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.target-radio-group :deep(.el-radio.is-checked) {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: var(--color-primary);
  box-shadow: 0 4px 15px rgba(17, 87, 64, 0.15);
}

.target-radio-group :deep(.el-radio__input) {
  margin-right: 16px;
}

.target-radio-group :deep(.el-radio__label) {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.users-select-item {
  width: 100%;
}

.users-select {
  width: 100%;
}

.users-select :deep(.el-select) {
  width: 100%;
}

.users-select :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.users-select :deep(.el-input__wrapper:hover) {
  border-color: var(--color-primary);
}

.users-select :deep(.el-input__wrapper.is-focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(17, 87, 64, 0.1);
}

.send-button-item {
  margin-top: 28px;
  text-align: center;
}

.send-button {
  min-width: 160px;
  font-size: 16px;
  font-weight: 700;
  padding: 18px 36px;
  height: auto;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--color-primary), #4ade80);
  border: none;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(17, 87, 64, 0.3);
}

.send-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(17, 87, 64, 0.4);
}

.send-button:active {
  transform: translateY(-1px);
}

.send-button:disabled {
  opacity: 0.7;
  transform: none;
  box-shadow: 0 4px 15px rgba(17, 87, 64, 0.2);
}

@media (min-width: 601px) {
  .send-button {
    width: auto;
    min-width: 220px;
    max-width: 320px;
  }
}

.history-section {
  margin-top: 40px;
}

.history-section h3 {
  margin-bottom: 24px;
  color: var(--color-primary);
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  position: relative;
}

.history-section h3::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), #4ade80);
  border-radius: 2px;
}

.broadcast-table {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaed;
}

.broadcast-table :deep(.el-table__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.broadcast-table :deep(.el-table__header th) {
  background: transparent !important;
  color: #1e293b;
  font-weight: 700;
  font-size: 14px;
  padding: 16px 12px;
}

.broadcast-table :deep(.el-table__row) {
  transition: all 0.3s ease;
}

.broadcast-table :deep(.el-table__row:hover) {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
  transform: scale(1.01);
}

.broadcast-table :deep(.el-table__row td) {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
}

.table-text {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  color: #475569;
}

.history-dialog {
  border-radius: 16px;
}

.history-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, var(--color-primary), #4ade80);
  color: white;
  border-radius: 16px 16px 0 0;
  padding: 20px 24px;
}

.history-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.history-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.history-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
}

.history-table :deep(.el-table__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.history-table :deep(.el-table__header th) {
  background: transparent !important;
  color: #1e293b;
  font-weight: 700;
  font-size: 14px;
  padding: 16px 12px;
}

.history-table :deep(.el-table__row) {
  transition: all 0.3s ease;
}

.history-table :deep(.el-table__row:hover) {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
}

.history-table :deep(.el-table__row td) {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
}

/* Промежуточные брейкпоинты для планшетов */
@media (max-width: 1024px) {
  .page-header {
    padding: 20px 0;
    margin: -16px -16px 28px -16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .back-button {
    left: 20px;
    padding: 10px 16px;
    font-size: 14px;
  }
  
  .broadcast-form-section {
    padding: 24px;
  }
  
  .broadcast-form-section h3 {
    font-size: 20px;
  }
  
  .send-button {
    min-width: 140px;
    padding: 16px 28px;
    font-size: 15px;
  }
  
  .preview-image, .preview-video {
    max-width: 180px;
    max-height: 110px;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 16px 0;
    margin: -16px -16px 24px -16px;
  }
  
  .page-title {
    font-size: 20px;
    padding: 0 60px;
  }
  
  .back-button {
    left: 16px;
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .back-button i {
    margin-right: 6px;
    font-size: 14px;
  }
  
  .broadcast-form {
    padding: 16px;
  }
  
  .broadcast-form .el-form-item {
    margin-bottom: 20px;
  }
  
  .message-text-item {
    margin-bottom: 24px;
  }
  
  .media-item {
    margin-bottom: 24px;
  }
  
  .target-item {
    margin-bottom: 24px;
  }
  
  .users-select-item {
    margin-bottom: 24px;
  }
  
  .send-button-item {
    text-align: center;
    margin-top: 24px;
  }
  
  .send-button {
    width: 100%;
    max-width: 200px;
    min-width: auto;
    font-size: 14px;
    padding: 14px 20px;
    height: auto;
    min-height: 44px;
  }
  
  .broadcast-form-section {
    padding: 20px;
    margin-bottom: 32px;
  }
  
  .broadcast-form-section h3 {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .broadcast-form-section h3::after {
    width: 50px;
    height: 2px;
  }
  
  .message-textarea :deep(.el-textarea__inner) {
    font-size: 16px;
    padding: 14px;
  }
  
  .target-radio-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .target-radio-group :deep(.el-radio) {
    padding: 10px 14px;
  }
  
  .users-select {
    width: 100%;
  }
  
  .media-upload {
    width: 100%;
  }
  
  .media-upload :deep(.el-button) {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }
  
  .media-info {
    padding: 14px 18px;
    font-size: 13px;
  }
  
  .media-preview {
    margin-top: 12px;
  }
  
  .media-file-preview {
    margin-bottom: 15px;
    padding: 12px;
  }
  
  .preview-image,
  .preview-video {
    max-width: 100%;
    max-height: 120px;
    border-radius: 10px;
  }
  
  .file-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .remove-file-btn {
    margin-left: 0;
    width: 100%;
  }
  
  .broadcast-table {
    display: none;
  }
  
  .mobile-broadcast-list {
    display: block;
  }
  
  .broadcast-card-mobile {
    margin-bottom: 16px;
    padding: 16px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    border: 1px solid #e8eaed;
    transition: all 0.3s ease;
  }
  
  .broadcast-card-mobile:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }
  
  .broadcast-header {
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .broadcast-id {
    font-size: 14px;
    color: #64748b;
    font-weight: 600;
  }
  
  .broadcast-content {
    margin-bottom: 16px;
  }
  
  .broadcast-text {
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 12px;
    color: #1e293b;
    font-weight: 500;
  }
  
  .broadcast-target {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .target-label {
    font-size: 14px;
    color: #64748b;
    font-weight: 600;
  }
  
  .broadcast-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
  
  .stat-label {
    font-size: 12px;
    color: #64748b;
    font-weight: 600;
  }
  
  .stat-value {
    font-size: 18px;
    font-weight: 700;
  }
  
  .stat-value.success {
    color: #059669;
  }
  
  .stat-value.danger {
    color: #dc2626;
  }
  
  .broadcast-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
  }
  
  .broadcast-date {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }
  
  .history-btn {
    height: 36px;
    font-size: 14px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--color-primary), #4ade80);
    border: none;
    color: white;
    transition: all 0.3s ease;
  }
  
  .history-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(17, 87, 64, 0.3);
  }
  
  .mobile-history-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .history-card-mobile {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    border: 1px solid #e8eaed;
    transition: all 0.3s ease;
  }
  
  .history-card-mobile:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }
  
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .user-name {
    font-weight: 700;
    font-size: 16px;
    color: var(--color-primary);
  }
  
  .user-info {
    margin-bottom: 12px;
  }
  
  .telegram-username {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 4px;
    font-weight: 600;
  }
  
  .sent-time {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 500;
  }
  
  .error-message {
    padding: 10px 14px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    margin-top: 8px;
  }
  
  .error-label {
    font-size: 12px;
    color: #dc2626;
    font-weight: 700;
  }
  
  .error-text {
    font-size: 14px;
    color: #dc2626;
    font-weight: 500;
  }
  
  .history-dialog {
    width: 95vw !important;
    max-width: none !important;
    border-radius: 16px !important;
  }
  
  .history-dialog :deep(.el-dialog__header) {
    padding: 16px 20px;
  }
  
  .history-dialog :deep(.el-dialog__body) {
    padding: 20px;
  }
  
  .el-alert {
    font-size: 16px !important;
    margin-top: 16px !important;
    border-radius: 12px !important;
  }
}

/* Дополнительные стили для очень маленьких экранов */
@media (max-width: 480px) {
  .page-header {
    padding: 12px 0;
    margin: -12px -12px 20px -12px;
  }
  
  .page-title {
    font-size: 18px;
    padding: 0 50px;
  }
  
  .back-button {
    left: 12px;
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .back-button i {
    margin-right: 4px;
    font-size: 12px;
  }
  
  .broadcast-form-section {
    padding: 16px;
    margin-bottom: 24px;
  }
  
  .broadcast-form-section h3 {
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .broadcast-form-section h3::after {
    width: 40px;
    height: 2px;
  }
  
  .broadcast-form {
    gap: 20px;
  }
  
  .send-button {
    max-width: 160px;
    font-size: 13px;
    padding: 12px 16px;
    min-height: 40px;
  }
  
  .send-button-item {
    margin-top: 20px;
  }
  
  .media-info {
    padding: 12px 16px;
    font-size: 12px;
  }
  
  .media-info p {
    font-size: 14px;
  }
  
  .media-file-preview {
    padding: 12px;
  }
  
  .preview-image,
  .preview-video {
    max-height: 100px;
  }
  
  .broadcast-card-mobile {
    padding: 14px;
    margin-bottom: 14px;
  }
  
  .broadcast-text {
    font-size: 15px;
  }
  
  .broadcast-stats {
    padding: 10px;
    gap: 12px;
  }
  
  .stat-value {
    font-size: 16px;
  }
  
  .history-card-mobile {
    padding: 14px;
  }
  
  .user-name {
    font-size: 15px;
  }
  
  .telegram-username {
    font-size: 13px;
  }
  
  .sent-time {
    font-size: 11px;
  }
}

/* Плавные переходы для всех элементов */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Улучшенные стили для кнопок и интерактивных элементов */
.el-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.el-radio {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.el-input__wrapper {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Анимации для загрузки */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.broadcast-form-section,
.history-section {
  animation: fadeInUp 0.6s ease-out;
}

/* Улучшенные стили для статусов */
.el-tag {
  border-radius: 8px !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
}

.el-tag:hover {
  transform: scale(1.05) !important;
}

/* Стили для скроллбара */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--color-primary), #4ade80);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #0f766e, #059669);
}
</style> 