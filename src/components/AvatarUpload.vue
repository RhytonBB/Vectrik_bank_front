<template>
  <div class="avatar-upload">
    <div class="avatar-preview">
      <img 
        :src="currentAvatar" 
        :alt="userName"
        class="avatar-image"
        @click="openUploadDialog"
      />
      <div class="avatar-overlay" @click="openUploadDialog">
        <i class="el-icon-camera"></i>
        <span>Изменить</span>
      </div>
    </div>

    <!-- Диалог загрузки -->
    <el-dialog 
      v-model="showUploadDialog" 
      title="Загрузка аватарки" 
      width="90%"
      max-width="500px"
      class="avatar-upload-dialog"
    >
      <div class="upload-content">
        <div class="upload-section">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept="image/jpeg,image/png"
            class="avatar-uploader"
          >
            <div class="upload-trigger">
              <i class="el-icon-plus"></i>
              <span>Выберите изображение</span>
            </div>
          </el-upload>
        </div>

        <!-- Предварительный просмотр и обрезка -->
        <div v-if="selectedFile" class="crop-section">
          <h4>Обрезка изображения</h4>
          <p class="crop-hint">Изображение будет автоматически обрезано до квадрата 200x200 пикселей</p>
          
          <div class="image-preview">
            <img 
              :src="previewUrl" 
              alt="Предварительный просмотр"
              class="preview-image"
            />
          </div>

          <div class="upload-actions">
            <el-button @click="cancelUpload" class="cancel-btn">Отмена</el-button>
            <el-button 
              type="primary" 
              @click="uploadAvatar" 
              :loading="uploading"
              class="upload-btn"
            >
              {{ uploading ? 'Загрузка...' : 'Загрузить' }}
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Уведомления -->
    <el-alert 
      v-if="message" 
      :title="message" 
      type="success" 
      show-icon 
      closable 
      @close="message = ''" 
      class="success-alert"
    />
    <el-alert 
      v-if="error" 
      :title="error" 
      type="error" 
      show-icon 
      closable 
      @close="error = ''" 
      class="error-alert"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
const message = ref('')
const error = ref('')
const uploadRef = ref()

const currentAvatar = computed(() => {
  return props.currentAvatarUrl || '/default-avatar.png'
})

const openUploadDialog = () => {
  showUploadDialog.value = true
  selectedFile.value = null
  previewUrl.value = ''
}

const handleFileChange = (file) => {
  if (!file) return

  // Проверяем тип файла
  if (!['image/jpeg', 'image/png'].includes(file.raw.type)) {
    error.value = 'Поддерживаются только изображения в форматах JPG и PNG'
    return
  }

  // Проверяем размер файла (максимум 10MB)
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'Размер файла не должен превышать 10MB'
    return
  }

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file.raw)
  error.value = ''
}

const cancelUpload = () => {
  selectedFile.value = null
  previewUrl.value = ''
  showUploadDialog.value = false
}

const uploadAvatar = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('avatar', selectedFile.value.raw)
    formData.append('user_id', props.userId.toString())

    const response = await axios.post('/admin/users/avatar/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    message.value = response.data.message
    emit('avatar-updated', response.data.avatar_url)
    
    // Закрываем диалог
    setTimeout(() => {
      showUploadDialog.value = false
      selectedFile.value = null
      previewUrl.value = ''
    }, 1500)

  } catch (err) {
    if (err.response?.data) {
      error.value = err.response.data
    } else {
      error.value = 'Ошибка загрузки аватарки'
    }
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  // Очищаем URL при размонтировании
  return () => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
  }
})
</script>

<style scoped>
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s ease;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid var(--color-primary);
  transition: all 0.3s ease;
}

.avatar-preview:hover .avatar-image {
  transform: scale(1.05);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 50%;
}

.avatar-overlay i {
  font-size: 24px;
  margin-bottom: 8px;
}

.avatar-overlay span {
  font-size: 14px;
  font-weight: 600;
}

.avatar-upload-dialog {
  border-radius: 16px;
}

.upload-content {
  padding: 20px 0;
}

.upload-section {
  margin-bottom: 24px;
}

.avatar-uploader {
  width: 100%;
}

.upload-trigger {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-trigger:hover {
  border-color: var(--color-primary);
  background: #f0f9ff;
}

.upload-trigger i {
  font-size: 32px;
  color: #8c8c8c;
  margin-bottom: 12px;
  display: block;
}

.upload-trigger span {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.crop-section {
  border-top: 1px solid #e8e8e8;
  padding-top: 24px;
}

.crop-section h4 {
  color: var(--color-primary);
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
}

.crop-hint {
  color: #666;
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.5;
}

.image-preview {
  text-align: center;
  margin-bottom: 24px;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  border: 2px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.upload-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.cancel-btn, .upload-btn {
  min-width: 120px;
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17, 87, 64, 0.2);
}

.success-alert, .error-alert {
  margin-top: 16px;
  border-radius: 8px;
}

/* Мобильная адаптация */
@media (max-width: 600px) {
  .avatar-image {
    width: 100px;
    height: 100px;
  }
  
  .avatar-overlay i {
    font-size: 20px;
    margin-bottom: 6px;
  }
  
  .avatar-overlay span {
    font-size: 12px;
  }
  
  .upload-trigger {
    padding: 30px 16px;
  }
  
  .upload-trigger i {
    font-size: 28px;
    margin-bottom: 10px;
  }
  
  .upload-trigger span {
    font-size: 14px;
  }
  
  .crop-section h4 {
    font-size: 16px;
  }
  
  .crop-hint {
    font-size: 13px;
  }
  
  .upload-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .cancel-btn, .upload-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
  }
  
  .cancel-btn:hover, .upload-btn:hover {
    transform: none;
  }
}

@media (max-width: 480px) {
  .avatar-image {
    width: 80px;
    height: 80px;
  }
  
  .avatar-overlay i {
    font-size: 18px;
  }
  
  .avatar-overlay span {
    font-size: 11px;
  }
}
</style>
