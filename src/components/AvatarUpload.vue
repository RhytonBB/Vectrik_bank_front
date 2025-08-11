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
      width="90%"
      :close-on-click-modal="false"
      class="avatar-dialog"
    >
      <div class="upload-content">
        <!-- Выбор файла -->
        <div v-if="!selectedFile" class="file-select">
                      <el-upload
              ref="uploadRef"
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

        <!-- Предпросмотр и обрезка -->
        <div v-if="selectedFile" class="image-preview">
          <div class="preview-container">
            <img 
              :src="previewUrl" 
              :alt="`Предпросмотр ${selectedFile.name}`"
              class="preview-image"
              ref="previewImage"
            />
            <div class="crop-overlay" v-if="showCropOverlay">
              <div class="crop-area" :style="cropAreaStyle"></div>
            </div>
          </div>
          
          <div class="preview-controls">
            <el-button @click="resetSelection" size="small">
              Выбрать другой файл
            </el-button>
            <el-button 
              type="primary" 
              @click="uploadAvatar" 
              :loading="uploading"
              size="small"
            >
              Загрузить аватарку
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const props = defineProps({
  userId: {
    type: Number,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  currentAvatarUrl: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['avatar-updated'])

const showUploadDialog = ref(false)
const selectedFile = ref(null)
const previewUrl = ref('')
const uploading = ref(false)
const fileInput = ref(null)
const previewImage = ref(null)
const showCropOverlay = ref(false)
const cropAreaStyle = ref({
  left: '25%',
  top: '25%',
  width: '50%',
  height: '50%'
})

const handleFileSelect = (file) => {
  console.log('=== НАЧАЛО handleFileSelect ===')
  console.log('Файл выбран:', file)
  console.log('Размер файла:', file.size)
  console.log('Тип файла:', file.type)
  console.log('Файл.raw:', file.raw)
  console.log('Файл.uid:', file.uid)
  console.log('Файл.raw.type:', file.raw?.type)
  
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('Файл слишком большой. Максимальный размер: 10MB')
    return
  }

  // Проверяем тип файла из raw объекта
  const fileType = file.raw?.type || file.type
  if (!fileType || !fileType.startsWith('image/')) {
    ElMessage.error('Пожалуйста, выберите изображение')
    return
  }

  selectedFile.value = file.raw || file
  previewUrl.value = URL.createObjectURL(file.raw || file)
  
  console.log('Файл установлен:', selectedFile.value)
  console.log('Preview URL:', previewUrl.value)
  
  nextTick(() => {
    showCropOverlay.value = true
    console.log('Crop overlay показан:', showCropOverlay.value)
  })
}

const resetSelection = () => {
  selectedFile.value = null
  previewUrl.value = ''
  showCropOverlay.value = false
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
}

const uploadAvatar = async () => {
  console.log('=== НАЧАЛО uploadAvatar ===')
  console.log('Начинаем загрузку аватарки')
  console.log('Выбранный файл:', selectedFile.value)
  console.log('selectedFile.value.raw:', selectedFile.value?.raw)
  
  if (!selectedFile.value) {
    console.log('Нет выбранного файла')
    return
  }

  uploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('avatar', selectedFile.value)
    formData.append('user_id', props.userId.toString())

    console.log('FormData создан, отправляем запрос...')
    console.log('User ID:', props.userId)

    const response = await axios.post('/admin/users/avatar/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    console.log('Ответ сервера:', response.data)
    ElMessage.success('Аватарка успешно загружена')
    emit('avatar-updated', response.data.avatar_url)
    showUploadDialog.value = false
    resetSelection()
  } catch (error) {
    console.error('Ошибка загрузки аватарки:', error)
    console.error('Детали ошибки:', error.response?.data)
    ElMessage.error('Ошибка загрузки аватарки: ' + (error.response?.data || error.message))
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.current-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--color-primary);
  box-shadow: 0 4px 16px rgba(17, 87, 64, 0.15);
  transition: all 0.3s ease;
}

.current-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(17, 87, 64, 0.2);
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
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
  background: var(--color-primary);
  border: none;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background: #0f4c3a;
  transform: scale(1.1);
}

.avatar-dialog {
  border-radius: 16px;
}

.upload-content {
  padding: 20px 0;
}

.file-select {
  display: flex;
  justify-content: center;
}

.upload-area {
  width: 100%;
}

.upload-placeholder {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-placeholder:hover {
  border-color: var(--color-primary);
  background: #f0f9f6;
}

.upload-placeholder i {
  font-size: 48px;
  color: #999;
  margin-bottom: 16px;
}

.upload-text p {
  margin: 8px 0;
  color: #666;
}

.upload-hint {
  font-size: 14px;
  color: #999;
}

.image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.preview-container {
  position: relative;
  max-width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.preview-image {
  max-width: 100%;
  height: auto;
  display: block;
}

.crop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
}

.crop-area {
  position: absolute;
  border: 2px solid #fff;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
  cursor: move;
}

.preview-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 600px) {
  .current-avatar {
    width: 100px;
    height: 100px;
  }
  
  .avatar-dialog {
    width: 95% !important;
    margin: 20px auto;
  }
  
  .upload-placeholder {
    padding: 30px 16px;
  }
  
  .upload-placeholder i {
    font-size: 36px;
  }
  
  .preview-controls {
    flex-direction: column;
    width: 100%;
  }
  
  .preview-controls .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .current-avatar {
    width: 80px;
    height: 80px;
  }
  
  .upload-btn {
    width: 32px;
    height: 32px;
  }
}
</style>
