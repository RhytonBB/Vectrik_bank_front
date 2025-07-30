<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <h2>📢 Рассылка через Telegram-бота</h2>
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
            :show-file-list="false"
            :on-change="handleMediaChange"
            class="media-upload"
          >
            <el-button>Выбрать файл</el-button>
          </el-upload>
          <div v-if="messageForm.mediaPreview" class="media-preview">
            <img v-if="messageForm.mediaType === 'image'" :src="messageForm.mediaPreview" class="preview-image"/>
            <video v-else-if="messageForm.mediaType === 'video'" :src="messageForm.mediaPreview" class="preview-video" controls/>
            <div class="file-info">{{ messageForm.mediaFile?.name }}</div>
          </div>
        </el-form-item>
        <el-form-item label="Целевая аудитория" required class="target-item">
          <el-radio-group v-model="messageForm.targetType" @change="handleTargetTypeChange" class="target-radio-group">
            <el-radio label="all">Всем пользователям</el-radio>
            <el-radio label="registered">Только зарегистрированным</el-radio>
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
          <el-button type="primary" @click="sendMessage" :loading="sending" class="send-button">
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
import { ref, onMounted } from 'vue'
import axios from 'axios'

const messageForm = ref({
  text: '',
  mediaFile: null,
  mediaPreview: null,
  mediaType: null,
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
    const resp = await axios.get('/api/admin/broadcast')
    broadcastHistory.value = resp.data
  } catch (e) {
    error.value = 'Ошибка загрузки истории'
  }
}
const fetchAvailableUsers = async () => {
  try {
    const resp = await axios.get('/api/admin/broadcast/users?type=all')
    availableUsers.value = resp.data
  } catch (e) {
    error.value = 'Ошибка загрузки пользователей'
  }
}
const handleMediaChange = (file) => {
  messageForm.value.mediaFile = file.raw
  const fileName = file.raw.name.toLowerCase()
  if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    messageForm.value.mediaType = 'image'
  } else if (fileName.match(/\.(mp4|avi|mov|mkv)$/)) {
    messageForm.value.mediaType = 'video'
  } else {
    messageForm.value.mediaType = 'document'
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    messageForm.value.mediaPreview = e.target.result
  }
  reader.readAsDataURL(file.raw)
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
    let mediaURL = null
    let mediaType = null
    if (messageForm.value.mediaFile) {
      const formData = new FormData()
      formData.append('file', messageForm.value.mediaFile)
      const uploadRes = await axios.post('/api/admin/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      mediaURL = uploadRes.data.url
      mediaType = messageForm.value.mediaType
    }
    await axios.post('/api/admin/broadcast', {
      text: messageForm.value.text,
      media_url: mediaURL,
      media_type: mediaType,
      target_type: messageForm.value.targetType,
      target_user_ids: messageForm.value.targetUserIDs
    })
    success.value = 'Сообщение отправлено'
    messageForm.value = {
      text: '',
      mediaFile: null,
      mediaPreview: null,
      mediaType: null,
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
    const resp = await axios.get(`/api/admin/broadcast/${broadcast.id}/history`)
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
.broadcast-form-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.broadcast-form-section h3 {
  margin-bottom: 20px;
  color: var(--color-primary);
}

.broadcast-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-text-item {
  width: 100%;
}

.message-textarea {
  width: 100%;
}

.media-item {
  width: 100%;
}

.media-upload {
  margin-bottom: 12px;
}

.media-preview {
  margin-top: 12px;
  text-align: center;
}

.preview-image, .preview-video {
  max-width: 200px;
  max-height: 120px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 8px;
}

.file-info {
  font-size: 12px;
  color: #666;
}

.target-item {
  width: 100%;
}

.target-radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.target-radio-group :deep(.el-radio) {
  margin-right: 0;
  margin-bottom: 8px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.target-radio-group :deep(.el-radio:hover) {
  background: #f8f9fa;
  border-color: var(--color-primary);
}

.target-radio-group :deep(.el-radio.is-checked) {
  background: #e0f0e7;
  border-color: var(--color-primary);
}

.target-radio-group :deep(.el-radio__label) {
  font-size: 16px;
  font-weight: 500;
}

.users-select-item {
  width: 100%;
}

.users-select {
  width: 100%;
}

.send-button-item {
  width: 100%;
  margin-top: 20px;
}

.send-button {
  width: 100%;
  height: 48px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.send-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17,87,64,0.15);
}

.history-section {
  margin-top: 32px;
}

.history-section h3 {
  margin-bottom: 20px;
  color: var(--color-primary);
}

.broadcast-table {
  border-radius: 8px;
  overflow: hidden;
}

.broadcast-table :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.broadcast-table :deep(.el-table__row:hover) {
  background-color: #e0f0e7 !important;
}

.table-text {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-dialog {
  border-radius: 12px;
}

.history-table {
  border-radius: 8px;
  overflow: hidden;
}

.history-table :deep(.el-table__header) {
  background-color: #f8f9fa;
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
  
  h2, h3 {
    font-size: 1.4rem !important;
    margin-bottom: 16px !important;
    color: var(--color-primary);
  }
  
  .broadcast-form-section {
    margin-bottom: 24px;
    padding: 20px;
    border-radius: 10px;
  }
  
  .broadcast-form {
    gap: 16px;
  }
  
  .el-form-item {
    width: 100% !important;
    margin-bottom: 16px !important;
  }
  
  .el-input, .el-button, .el-select {
    width: 100% !important;
    font-size: 16px !important;
  }
  
  .target-radio-group {
    flex-direction: column !important;
    gap: 12px !important;
  }
  
  .send-button {
    height: 52px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .mobile-broadcast-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .broadcast-card-mobile {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(17,87,64,0.08);
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
  }
  
  .broadcast-card-mobile:hover {
    box-shadow: 0 4px 20px rgba(17,87,64,0.12);
    transform: translateY(-2px);
  }
  
  .broadcast-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .broadcast-id {
    font-weight: 600;
    color: #666;
  }
  
  .broadcast-content {
    margin-bottom: 16px;
  }
  
  .broadcast-text {
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 12px;
    color: #333;
  }
  
  .broadcast-target {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .target-label {
    font-size: 14px;
    color: #666;
  }
  
  .broadcast-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 16px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  
  .stat-label {
    font-size: 12px;
    color: #666;
  }
  
  .stat-value {
    font-weight: 700;
    font-size: 18px;
  }
  
  .stat-value.success {
    color: #27ae60;
  }
  
  .stat-value.danger {
    color: #e74c3c;
  }
  
  .broadcast-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .broadcast-date {
    font-size: 14px;
    color: #666;
  }
  
  .history-btn {
    height: 36px;
    font-size: 14px;
  }
  
  .mobile-history-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .history-card-mobile {
    background: #ffffff;
    border-radius: 10px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(17,87,64,0.06);
    border: 1px solid #f0f0f0;
  }
  
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .user-name {
    font-weight: 600;
    font-size: 16px;
    color: var(--color-primary);
  }
  
  .user-info {
    margin-bottom: 12px;
  }
  
  .telegram-username {
    font-size: 14px;
    color: #666;
    margin-bottom: 4px;
  }
  
  .sent-time {
    font-size: 12px;
    color: #999;
  }
  
  .error-message {
    padding: 8px 12px;
    background: #fef5f5;
    border: 1px solid #fde8e8;
    border-radius: 6px;
  }
  
  .error-label {
    font-size: 12px;
    color: #e74c3c;
    font-weight: 600;
  }
  
  .error-text {
    font-size: 14px;
    color: #e74c3c;
  }
  
  .history-dialog {
    width: 95vw !important;
    max-width: none !important;
    border-radius: 12px !important;
  }
  
  .el-alert {
    font-size: 16px !important;
    margin-top: 16px !important;
    border-radius: 8px !important;
  }
}
</style> 