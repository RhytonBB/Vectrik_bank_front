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
             <div class="image-wrapper">
               <img 
                 :src="previewUrl" 
                 :alt="`Предпросмотр ${selectedFile.name}`"
                 class="preview-image"
                 ref="previewImage"
                 :style="{
                   transform: `scale(${imageScale}) translate(${imageTranslateX}px, ${imageTranslateY}px)`,
                   transformOrigin: 'center'
                 }"
                 @mousedown="startScale"
                 @touchstart="startScale"
               />
             </div>
             <div class="crop-overlay" v-if="showCropOverlay">
               <div 
                 class="crop-area" 
                 :style="cropAreaStyle"
                 @mousedown="startDrag"
                 @touchstart="startDrag"
               ></div>
             </div>
           </div>
           
           <div class="scale-controls">
             <el-button @click="resetScale" size="small" type="info">
               <i class="el-icon-refresh"></i> Сбросить масштаб
             </el-button>
             <div class="scale-info">
               Масштаб: {{ Math.round(imageScale * 100) }}%
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
const previewImage = ref(null)
const showCropOverlay = ref(false)
const cropAreaStyle = ref({
  left: '25%',
  top: '25%'
})

// Переменные для перетаскивания
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const cropStart = ref({ x: 0, y: 0 })

// Переменные для масштабирования
const imageScale = ref(1)
const imageTranslateX = ref(0)
const imageTranslateY = ref(0)
const isScaling = ref(false)
const scaleStart = ref({ x: 0, y: 0, scale: 1 })

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
  
  // Сбрасываем масштаб и позицию
  imageScale.value = 1
  imageTranslateX.value = 0
  imageTranslateY.value = 0
  
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
  imageScale.value = 1
  imageTranslateX.value = 0
  imageTranslateY.value = 0
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
}

// Функции для перетаскивания области обрезки
const startDrag = (e) => {
  isDragging.value = true
  dragStart.value = { x: e.clientX, y: e.clientY }
  cropStart.value = { 
    x: parseFloat(cropAreaStyle.value.left), 
    y: parseFloat(cropAreaStyle.value.top) 
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
}

const onDrag = (e) => {
  if (!isDragging.value) return
  
  const clientX = e.clientX || e.touches[0].clientX
  const clientY = e.clientY || e.touches[0].clientY
  
  const deltaX = clientX - dragStart.value.x
  const deltaY = clientY - dragStart.value.y
  
  const container = previewImage.value?.parentElement
  if (!container) return
  
  const containerRect = container.getBoundingClientRect()
  const containerWidth = containerRect.width
  const containerHeight = containerRect.height
  
  const cropSize = 50 // 50% от размера контейнера
  const maxX = 100 - cropSize
  const maxY = 100 - cropSize
  
  let newX = cropStart.value.x + (deltaX / containerWidth) * 100
  let newY = cropStart.value.y + (deltaY / containerHeight) * 100
  
  // Ограничиваем границы
  newX = Math.max(0, Math.min(maxX, newX))
  newY = Math.max(0, Math.min(maxY, newY))
  
  cropAreaStyle.value = {
    left: `${newX}%`,
    top: `${newY}%`
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

// Функции для масштабирования изображения
const startScale = (e) => {
  e.preventDefault()
  isScaling.value = true
  scaleStart.value = { 
    x: e.clientX || e.touches[0].clientX, 
    y: e.clientY || e.touches[0].clientY, 
    scale: imageScale.value 
  }
  document.addEventListener('mousemove', onScale)
  document.addEventListener('mouseup', stopScale)
  document.addEventListener('touchmove', onScale)
  document.addEventListener('touchend', stopScale)
}

const onScale = (e) => {
  if (!isScaling.value) return
  
  const clientY = e.clientY || e.touches[0].clientY
  
  const deltaY = clientY - scaleStart.value.y
  
  // Масштабирование по вертикальному движению
  const scaleDelta = deltaY * -0.01 // Отрицательное значение для интуитивного управления
  const newScale = Math.max(0.5, Math.min(3, scaleStart.value.scale + scaleDelta))
  
  imageScale.value = newScale
}

const stopScale = () => {
  isScaling.value = false
  document.removeEventListener('mousemove', onScale)
  document.removeEventListener('mouseup', stopScale)
  document.removeEventListener('touchmove', onScale)
  document.removeEventListener('touchend', stopScale)
}

// Функция для сброса масштаба
const resetScale = () => {
  imageScale.value = 1
  imageTranslateX.value = 0
  imageTranslateY.value = 0
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
    // Создаем canvas для обрезки изображения
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Загружаем изображение
    const img = new Image()
    img.onload = async () => {
      try {
        // Получаем размеры контейнера и области обрезки
        const container = previewImage.value?.parentElement
        if (!container) {
          throw new Error('Контейнер не найден')
        }
        
        const containerRect = container.getBoundingClientRect()
        const containerWidth = containerRect.width
        const containerHeight = containerRect.height
        
        // Вычисляем размер области обрезки в пикселях
        const cropSizePercent = 50 // 50% от размера контейнера
        const cropSizePx = (containerWidth * cropSizePercent) / 100
        
        // Вычисляем позицию области обрезки в пикселях
        const cropLeftPercent = parseFloat(cropAreaStyle.value.left)
        const cropTopPercent = parseFloat(cropAreaStyle.value.top)
        const cropLeftPx = (containerWidth * cropLeftPercent) / 100
        const cropTopPx = (containerHeight * cropTopPercent) / 100
        
                 // Вычисляем масштаб между отображаемым изображением и оригиналом
         const scaleX = img.naturalWidth / containerWidth
         const scaleY = img.naturalHeight / containerHeight
         
         // Учитываем масштаб изображения
         const scaledWidth = containerWidth * imageScale.value
         const scaledHeight = containerHeight * imageScale.value
         
         // Вычисляем смещение из-за масштабирования
         const offsetX = (scaledWidth - containerWidth) / 2
         const offsetY = (scaledHeight - containerHeight) / 2
         
         // Вычисляем координаты обрезки в оригинальном изображении с учетом масштаба
         const adjustedCropLeftPx = cropLeftPx + offsetX / imageScale.value
         const adjustedCropTopPx = cropTopPx + offsetY / imageScale.value
         
         const sourceX = adjustedCropLeftPx * scaleX
         const sourceY = adjustedCropTopPx * scaleY
         const sourceSize = cropSizePx * scaleX
        
        // Устанавливаем размер canvas равным размеру области обрезки
        canvas.width = sourceSize
        canvas.height = sourceSize
        
        // Обрезаем изображение по кругу
        ctx.save()
        ctx.beginPath()
        ctx.arc(sourceSize / 2, sourceSize / 2, sourceSize / 2, 0, 2 * Math.PI)
        ctx.clip()
        
        // Рисуем обрезанную часть изображения
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize, // источник
          0, 0, sourceSize, sourceSize // назначение
        )
        
        ctx.restore()
        
        // Конвертируем canvas в blob
        canvas.toBlob(async (blob) => {
          try {
            const formData = new FormData()
            formData.append('avatar', blob, 'avatar.jpg')
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
        }, 'image/jpeg', 0.9)
        
      } catch (error) {
        console.error('Ошибка обработки изображения:', error)
        ElMessage.error('Ошибка обработки изображения')
        uploading.value = false
      }
    }
    
    img.onerror = () => {
      ElMessage.error('Ошибка загрузки изображения')
      uploading.value = false
    }
    
    img.src = previewUrl.value
    
  } catch (error) {
    console.error('Ошибка загрузки аватарки:', error)
    ElMessage.error('Ошибка загрузки аватарки')
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

.image-wrapper {
  position: relative;
  overflow: hidden;
  cursor: grab;
}

.image-wrapper:active {
  cursor: grabbing;
}

.preview-image {
  max-width: 100%;
  height: auto;
  display: block;
  width: 100%;
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
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
  cursor: move;
  user-select: none;
  touch-action: none;
  /* Гарантируем, что область будет круглой */
  aspect-ratio: 1;
  width: 50%;
  height: 50%;
}

.scale-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.scale-info {
  font-size: 14px;
  color: #666;
  font-weight: 500;
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
  
  .scale-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .scale-info {
    font-size: 16px;
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
