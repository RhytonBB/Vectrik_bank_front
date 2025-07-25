<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <h2>📢 Рассылка через Telegram-бота</h2>
    
    <!-- Форма отправки сообщения -->
    <el-form :model="messageForm" label-width="200px" style="margin-bottom: 30px;">
      <el-form-item label="Текст сообщения" required>
        <el-input
          v-model="messageForm.text"
          type="textarea"
          :rows="4"
          placeholder="Введите текст сообщения..."
        />
      </el-form-item>
      
      <el-form-item label="Медиа">
        <el-upload
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleMediaChange"
        >
          <el-button>Выбрать файл</el-button>
        </el-upload>
        <div v-if="messageForm.mediaPreview" style="margin-top: 10px;">
          <img v-if="messageForm.mediaType === 'image'" :src="messageForm.mediaPreview" style="max-width:200px;max-height:120px;border:1px solid #ddd;border-radius:4px;"/>
          <video v-else-if="messageForm.mediaType === 'video'" :src="messageForm.mediaPreview" style="max-width:200px;max-height:120px;" controls/>
          <div style="margin-top: 5px; color: #666; font-size: 12px;">{{ messageForm.mediaFile?.name }}</div>
        </div>
      </el-form-item>
      
      <el-form-item label="Целевая аудитория" required>
        <el-radio-group v-model="messageForm.targetType" @change="handleTargetTypeChange">
          <el-radio label="all">Всем пользователям</el-radio>
          <el-radio label="registered">Только зарегистрированным</el-radio>
          <el-radio label="manual">Выбрать вручную</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item v-if="messageForm.targetType === 'manual'" label="Выбор пользователей">
        <el-select
          v-model="messageForm.targetUserIDs"
          multiple
          filterable
          placeholder="Выберите пользователей"
          style="width: 100%"
        >
          <el-option
            v-for="user in availableUsers"
            :key="user.id"
            :label="`${user.first_name} ${user.last_name} (@${user.telegram_username})`"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="sendMessage" :loading="sending">
          Отправить сообщение
        </el-button>
      </el-form-item>
    </el-form>
    
    <!-- История отправленных сообщений -->
    <h3>История сообщений</h3>
    <el-table :data="broadcastHistory" style="width: 100%">
      <el-table-column prop="id" label="ID" width="60"/>
      <el-table-column prop="text" label="Текст" show-overflow-tooltip>
        <template #default="scope">
          <div style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            {{ scope.row.text }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="target_type" label="Аудитория" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.target_type === 'all'" type="success">Все</el-tag>
          <el-tag v-else-if="scope.row.target_type === 'registered'" type="warning">Зарегистрированные</el-tag>
          <el-tag v-else type="info">Вручную</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Статус" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 'pending'" type="info">Ожидает</el-tag>
          <el-tag v-else-if="scope.row.status === 'sending'" type="warning">Отправляется</el-tag>
          <el-tag v-else-if="scope.row.status === 'completed'" type="success">Завершено</el-tag>
          <el-tag v-else type="danger">Ошибка</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sent_count" label="Отправлено" width="100"/>
      <el-table-column prop="failed_count" label="Ошибок" width="100"/>
      <el-table-column prop="created_at" label="Дата" width="150">
        <template #default="scope">
          {{ new Date(scope.row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="" width="100">
        <template #default="scope">
          <el-button size="small" @click="viewHistory(scope.row)">История</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- Диалог с историей отправки -->
    <el-dialog v-model="historyDialog" title="История отправки" width="800px">
      <el-table :data="messageHistory" style="width: 100%">
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
            <el-tag v-if="scope.row.status === 'sent'" type="success">Отправлено</el-tag>
            <el-tag v-else type="danger">Ошибка</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="error_message" label="Ошибка" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.error_message || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="sent_at" label="Время" width="150">
          <template #default="scope">
            {{ new Date(scope.row.sent_at).toLocaleString() }}
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
  
  // Определяем тип медиа
  const fileName = file.raw.name.toLowerCase()
  if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    messageForm.value.mediaType = 'image'
  } else if (fileName.match(/\.(mp4|avi|mov|mkv)$/)) {
    messageForm.value.mediaType = 'video'
  } else {
    messageForm.value.mediaType = 'document'
  }
  
  // Создаем превью
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
    
    // Загружаем медиа если есть
    if (messageForm.value.mediaFile) {
      const formData = new FormData()
      formData.append('file', messageForm.value.mediaFile)
      const uploadRes = await axios.post('/api/admin/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      mediaURL = uploadRes.data.url
      mediaType = messageForm.value.mediaType
    }
    
    // Отправляем сообщение
    await axios.post('/api/admin/broadcast', {
      text: messageForm.value.text,
      media_url: mediaURL,
      media_type: mediaType,
      target_type: messageForm.value.targetType,
      target_user_ids: messageForm.value.targetUserIDs
    })
    
    success.value = 'Сообщение отправлено'
    
    // Очищаем форму
    messageForm.value = {
      text: '',
      mediaFile: null,
      mediaPreview: null,
      mediaType: null,
      targetType: 'all',
      targetUserIDs: []
    }
    
    // Обновляем историю
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
})
</script>

<style scoped>
.broadcast-card {
  max-width: 480px;
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
@media (max-width: 600px) {
  .broadcast-card, .el-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 12px 2vw !important;
    border-radius: 10px !important;
    box-sizing: border-box;
  }
  h2, h3 {
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