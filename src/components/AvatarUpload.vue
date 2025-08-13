<template>
  <div class="avatar-upload">
    <!-- Текущая аватарка -->
    <div class="current-avatar">
      <img 
        :src="currentAvatarUrl" 
        :alt="`Аватар ${userName}`"
        class="avatar-preview"
        v-if="currentAvatarUrl"
      />
      <div v-else class="avatar-placeholder">
        <i class="el-icon-user"></i>
      </div>
      <div class="avatar-overlay">
        <el-button 
          type="primary" 
          size="small" 
          @click="showUploadDialog = true"
          class="upload-btn"
        >
          <i class="el-icon-camera"></i>
        </el-button>
      </div>
    </div>

    <!-- Диалог загрузки -->
    <el-dialog 
      v-model="showUploadDialog" 
      title="Загрузка аватарки" 
      width="400px"
      :close-on-click-modal="false"
      class="avatar-dialog"
    >
      <div class="upload-content">
        <!-- Выбор файла -->
        <div class="file-select">
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileSelect"
            accept="image/jpeg,image/png,image/jpg"
            class="upload-area"
            :before-upload="() => false"
          >
            <div class="upload-placeholder">
              <i class="el-icon-upload"></i>
              <div class="upload-text">
                <p>Нажмите для выбора файла</p>
                <p class="upload-hint">JPG, PNG до 10MB</p>
              </div>
            </div>
          </el-upload>
        </div>

        <!-- Предпросмотр выбранного файла -->
        <div v-if="selectedFile" class="file-preview">
          <div class="preview-header">
            <h4>Выбранный файл:</h4>
            <el-button 
              type="danger" 
              size="small" 
              @click="clearSelection"
              class="clear-btn"
            >
              <i class="el-icon-delete"></i>
            </el-button>
          </div>
          <div class="file-info">
            <p><strong>Имя:</strong> {{ selectedFile.name }}</p>
            <p><strong>Размер:</strong> {{ formatFileSize(selectedFile.size) }}</p>
            <p><strong>Тип:</strong> {{ selectedFile.type }}</p>
          </div>
          <div class="image-preview">
            <img 
              :src="previewUrl" 
              :alt="`Предпросмотр ${selectedFile.name}`"
              class="preview-image"
            />
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showUploadDialog = false">Отмена</el-button>
          <el-button 
            type="primary" 
            @click="uploadAvatar" 
            :loading="uploading"
            :disabled="!selectedFile"
          >
            Загрузить
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const props = defineProps({
  currentAvatarUrl: {
    type: String,
    default: ''
  },
  userName: {
    type: String,
    default: 'пользователя'
  },
  userId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['avatar-uploaded'])

const showUploadDialog = ref(false)
const selectedFile = ref(null)
const previewUrl = ref('')
const uploading = ref(false)

const handleFileSelect = (file) => {
  // Проверяем размер файла (10MB)
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('Файл слишком большой. Максимальный размер: 10MB')
    return
  }

  // Проверяем тип файла
  if (!file.type.startsWith('image/')) {
    ElMessage.error('Пожалуйста, выберите изображение')
    return
  }

  selectedFile.value = file.raw
  previewUrl.value = URL.createObjectURL(file.raw)
}

const clearSelection = () => {
  selectedFile.value = null
  previewUrl.value = ''
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadAvatar = async () => {
  if (!selectedFile.value) {
    ElMessage.error('Пожалуйста, выберите файл')
    return
  }

  uploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('avatar', selectedFile.value)

    const response = await axios.post(`/admin/users/${props.userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    ElMessage.success('Аватарка успешно загружена')
    emit('avatar-uploaded', response.data.avatar_url)
    showUploadDialog.value = false
    clearSelection()
  } catch (error) {
    console.error('Ошибка загрузки аватарки:', error)
    ElMessage.error('Ошибка загрузки аватарки')
  } finally {
    uploading.value = false
  }
}

// Очищаем URL при закрытии диалога
const clearPreviewUrl = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
}

onMounted(() => {
  // Очищаем URL при размонтировании компонента
  return () => {
    clearPreviewUrl()
  }
})
</script>

<style scoped>
.avatar-upload {
  display: inline-block;
}

.current-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
}

.current-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48px;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.current-avatar:hover .avatar-overlay {
  opacity: 1;
}

.upload-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #333;
  font-weight: 600;
}

.upload-btn:hover {
  background: white;
  transform: scale(1.1);
}

.avatar-dialog {
  border-radius: 16px;
}

.upload-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.file-select {
  text-align: center;
}

.upload-area {
  width: 100%;
}

.upload-placeholder {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-placeholder:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.upload-placeholder i {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text p {
  margin: 8px 0;
  color: #606266;
}

.upload-hint {
  font-size: 14px;
  color: #909399;
}

.file-preview {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-header h4 {
  margin: 0;
  color: #303133;
}

.clear-btn {
  padding: 6px 12px;
}

.file-info {
  margin-bottom: 16px;
}

.file-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #606266;
}

.image-preview {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .el-button {
  min-width: 80px;
  font-size: 14px;
  padding: 8px 16px;
}

@media (max-width: 768px) {
  .current-avatar {
    width: 100px;
    height: 100px;
  }
  
  .avatar-dialog {
    width: 95vw !important;
    max-width: none !important;
  }
  
  .upload-placeholder {
    padding: 30px 15px;
  }
  
  .upload-placeholder i {
    font-size: 36px;
  }
  
  .dialog-footer {
    justify-content: center;
    gap: 8px;
  }
  
  .dialog-footer .el-button {
    min-width: 70px;
    font-size: 13px;
    padding: 6px 12px;
  }
}
</style>
