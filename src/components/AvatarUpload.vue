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
          <div class="crop-container">
            <div class="crop-wrapper" ref="cropWrapper">
              <!-- Изображение с масштабированием -->
              <div class="image-container" :style="imageContainerStyle">
                <img 
                  :src="previewUrl" 
                  :alt="`Предпросмотр ${selectedFile.name}`"
                  class="crop-image"
                  ref="cropImage"
                  @load="onImageLoad"
                  draggable="false"
                />
              </div>
              
              <!-- Область обрезки -->
              <div 
                class="crop-frame"
                :style="cropFrameStyle"
                @mousedown="startCropDrag"
                @touchstart="startCropDrag"
              >
                <!-- Маркеры изменения размера -->
                <div class="crop-handle crop-handle-nw" @mousedown="startResize('nw')" @touchstart="startResize('nw')"></div>
                <div class="crop-handle crop-handle-ne" @mousedown="startResize('ne')" @touchstart="startResize('ne')"></div>
                <div class="crop-handle crop-handle-sw" @mousedown="startResize('sw')" @touchstart="startResize('sw')"></div>
                <div class="crop-handle crop-handle-se" @mousedown="startResize('se')" @touchstart="startResize('se')"></div>
                <div class="crop-handle crop-handle-n" @mousedown="startResize('n')" @touchstart="startResize('n')"></div>
                <div class="crop-handle crop-handle-s" @mousedown="startResize('s')" @touchstart="startResize('s')"></div>
                <div class="crop-handle crop-handle-w" @mousedown="startResize('w')" @touchstart="startResize('w')"></div>
                <div class="crop-handle crop-handle-e" @mousedown="startResize('e')" @touchstart="startResize('e')"></div>
              </div>
              
              <!-- Затемнение вокруг области обрезки -->
              <div class="crop-overlay">
                <div class="crop-darken crop-darken-top" :style="darkenTopStyle"></div>
                <div class="crop-darken crop-darken-bottom" :style="darkenBottomStyle"></div>
                <div class="crop-darken crop-darken-left" :style="darkenLeftStyle"></div>
                <div class="crop-darken crop-darken-right" :style="darkenRightStyle"></div>
              </div>
            </div>
          </div>
          
          <!-- Предпросмотр результата -->
          <div class="result-preview">
            <h4>Предпросмотр результата:</h4>
            <div class="preview-avatar">
              <canvas ref="previewCanvas" class="preview-canvas"></canvas>
            </div>
          </div>
          
          <!-- Элементы управления -->
          <div class="crop-controls">
            <div class="control-group">
              <el-button @click="resetCrop" size="small" type="info">
                <i class="el-icon-refresh"></i> Сбросить
              </el-button>
              <el-button @click="centerCrop" size="small" type="info">
                <i class="el-icon-position"></i> По центру
              </el-button>
              <el-button @click="resetZoom" size="small" type="info">
                <i class="el-icon-zoom-in"></i> Масштаб 100%
              </el-button>
            </div>
            
            <div class="control-group">
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
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, computed, watch, onUnmounted } from 'vue'
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
const cropImage = ref(null)
const cropWrapper = ref(null)
const previewCanvas = ref(null)

// Состояние обрезки (в пикселях контейнера)
const cropState = ref({
  x: 0,
  y: 0,
  width: 200,
  height: 200
})

// Состояние масштабирования
const zoomState = ref({
  scale: 1,
  offsetX: 0,
  offsetY: 0
})

// Размеры
const imageSize = ref({ width: 0, height: 0 })
const containerSize = ref({ width: 0, height: 0 })

// Состояние перетаскивания
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const cropStart = ref({ x: 0, y: 0 })

// Состояние изменения размера
const isResizing = ref(false)
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })
const resizeDirection = ref('')

const handleFileSelect = (file) => {
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('Файл слишком большой. Максимальный размер: 10MB')
    return
  }

  const fileType = file.raw?.type || file.type
  if (!fileType || !fileType.startsWith('image/')) {
    ElMessage.error('Пожалуйста, выберите изображение')
    return
  }

  // Дополнительная проверка на минимальный размер изображения
  const img = new Image()
  img.onload = () => {
    if (img.naturalWidth < 100 || img.naturalHeight < 100) {
      ElMessage.error('Изображение слишком маленькое. Минимальный размер: 100x100 пикселей')
      return
    }
    
    selectedFile.value = file.raw || file
    previewUrl.value = URL.createObjectURL(file.raw || file)
    
    // Сбрасываем состояние
    resetCrop()
    resetZoom()
  }
  
  img.onerror = () => {
    ElMessage.error('Ошибка загрузки изображения')
  }
  
  img.src = URL.createObjectURL(file.raw || file)
}

const resetSelection = () => {
  selectedFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  // Сбрасываем состояние
  resetCrop()
  resetZoom()
}

const onImageLoad = () => {
  nextTick(() => {
    if (cropImage.value && cropWrapper.value) {
      const img = cropImage.value
      const wrapper = cropWrapper.value
      
      // Размеры оригинального изображения
      imageSize.value = {
        width: img.naturalWidth,
        height: img.naturalHeight
      }
      
      // Размеры контейнера
      containerSize.value = {
        width: wrapper.clientWidth,
        height: wrapper.clientHeight
      }
      
      // Инициализируем область обрезки
      centerCrop()
    }
  })
}

const centerCrop = () => {
  if (!containerSize.value.width || !containerSize.value.height) return
  
  const size = Math.min(containerSize.value.width, containerSize.value.height) * 0.6
  cropState.value = {
    x: (containerSize.value.width - size) / 2,
    y: (containerSize.value.height - size) / 2,
    width: size,
    height: size
  }
  
  // Сбрасываем масштабирование при центрировании
  zoomState.value = {
    scale: 1,
    offsetX: 0,
    offsetY: 0
  }
  
  updatePreview()
}

const resetCrop = () => {
  centerCrop()
}

const resetZoom = () => {
  zoomState.value = {
    scale: 1,
    offsetX: 0,
    offsetY: 0
  }
  updatePreview()
}

// Масштабирование колесиком мыши
const handleWheel = (e) => {
  e.preventDefault()
  
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.max(0.5, Math.min(3, zoomState.value.scale + delta))
  
  // Центр области обрезки в координатах контейнера
  const cropCenterX = cropState.value.x + cropState.value.width / 2
  const cropCenterY = cropState.value.y + cropState.value.height / 2
  
  // Центр контейнера
  const containerCenterX = containerSize.value.width / 2
  const containerCenterY = containerSize.value.height / 2
  
  // Вычисляем новое смещение, чтобы область обрезки оставалась в центре
  const scaleRatio = newScale / zoomState.value.scale
  
  // Новое смещение = текущее смещение + изменение позиции центра области обрезки
  const newOffsetX = zoomState.value.offsetX + (cropCenterX - containerCenterX) * (1 - scaleRatio)
  const newOffsetY = zoomState.value.offsetY + (cropCenterY - containerCenterY) * (1 - scaleRatio)
  
  zoomState.value = {
    scale: newScale,
    offsetX: newOffsetX,
    offsetY: newOffsetY
  }
  
  updatePreview()
}

// Вычисляемые стили
const imageContainerStyle = computed(() => ({
  transform: `translate(${zoomState.value.offsetX}px, ${zoomState.value.offsetY}px) scale(${zoomState.value.scale})`,
  transformOrigin: 'center'
}))

const cropFrameStyle = computed(() => ({
  left: `${cropState.value.x}px`,
  top: `${cropState.value.y}px`,
  width: `${cropState.value.width}px`,
  height: `${cropState.value.height}px`
}))

const darkenTopStyle = computed(() => ({
  height: `${cropState.value.y}px`
}))

const darkenBottomStyle = computed(() => ({
  top: `${cropState.value.y + cropState.value.height}px`,
  height: `${containerSize.value.height - cropState.value.y - cropState.value.height}px`
}))

const darkenLeftStyle = computed(() => ({
  width: `${cropState.value.x}px`,
  top: `${cropState.value.y}px`,
  height: `${cropState.value.height}px`
}))

const darkenRightStyle = computed(() => ({
  left: `${cropState.value.x + cropState.value.width}px`,
  width: `${containerSize.value.width - cropState.value.x - cropState.value.width}px`,
  top: `${cropState.value.y}px`,
  height: `${cropState.value.height}px`
}))

// Обновление предпросмотра
const updatePreview = () => {
  if (!previewCanvas.value || !cropImage.value) return
  
  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  
  // Размер предпросмотра
  const previewSize = 120
  canvas.width = previewSize
  canvas.height = previewSize
  
  // Очищаем canvas
  ctx.clearRect(0, 0, previewSize, previewSize)
  
  // Создаем круглую область обрезки
  ctx.save()
  ctx.beginPath()
  ctx.arc(previewSize / 2, previewSize / 2, previewSize / 2, 0, 2 * Math.PI)
  ctx.clip()
  
  // Вычисляем координаты обрезки в оригинальном изображении
  // Учитываем масштаб и смещение
  const scaledCropX = (cropState.value.x - zoomState.value.offsetX) / zoomState.value.scale
  const scaledCropY = (cropState.value.y - zoomState.value.offsetY) / zoomState.value.scale
  const scaledCropSize = cropState.value.width / zoomState.value.scale
  
  // Рисуем обрезанную часть, масштабируя до размера предпросмотра
  ctx.drawImage(
    cropImage.value,
    scaledCropX, scaledCropY, scaledCropSize, scaledCropSize,
    0, 0, previewSize, previewSize
  )
  
  ctx.restore()
}

// Перетаскивание области обрезки
const startCropDrag = (e) => {
  e.preventDefault()
  isDragging.value = true
  dragStart.value = { x: e.clientX || e.touches[0].clientX, y: e.clientY || e.touches[0].clientY }
  cropStart.value = { x: cropState.value.x, y: cropState.value.y }
  
  document.addEventListener('mousemove', onCropDrag)
  document.addEventListener('mouseup', stopCropDrag)
  document.addEventListener('touchmove', onCropDrag)
  document.addEventListener('touchend', stopCropDrag)
}

const onCropDrag = (e) => {
  if (!isDragging.value) return
  
  const clientX = e.clientX || e.touches[0].clientX
  const clientY = e.clientY || e.touches[0].clientY
  
  const deltaX = clientX - dragStart.value.x
  const deltaY = clientY - dragStart.value.y
  
  let newX = cropStart.value.x + deltaX
  let newY = cropStart.value.y + deltaY
  
  // Ограничиваем границы с учетом размера области обрезки
  newX = Math.max(0, Math.min(containerSize.value.width - cropState.value.width, newX))
  newY = Math.max(0, Math.min(containerSize.value.height - cropState.value.height, newY))
  
  cropState.value.x = newX
  cropState.value.y = newY
  
  updatePreview()
}

const stopCropDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onCropDrag)
  document.removeEventListener('mouseup', stopCropDrag)
  document.removeEventListener('touchmove', onCropDrag)
  document.removeEventListener('touchend', stopCropDrag)
}

// Изменение размера области обрезки
const startResize = (direction) => (e) => {
  e.preventDefault()
  e.stopPropagation()
  
  isResizing.value = true
  resizeDirection.value = direction
  resizeStart.value = {
    x: e.clientX || e.touches[0].clientX,
    y: e.clientY || e.touches[0].clientY,
    width: cropState.value.width,
    height: cropState.value.height,
    cropX: cropState.value.x,
    cropY: cropState.value.y
  }
  
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchmove', onResize)
  document.addEventListener('touchend', stopResize)
}

const onResize = (e) => {
  if (!isResizing.value) return
  
  const clientX = e.clientX || e.touches[0].clientX
  const clientY = e.clientY || e.touches[0].clientY
  
  const deltaX = clientX - resizeStart.value.x
  const deltaY = clientY - resizeStart.value.y
  
  let newWidth = resizeStart.value.width
  let newHeight = resizeStart.value.height
  let newX = resizeStart.value.cropX
  let newY = resizeStart.value.cropY
  
  const direction = resizeDirection.value
  const minSize = Math.min(containerSize.value.width, containerSize.value.height) * 0.2
  const maxSize = Math.min(containerSize.value.width, containerSize.value.height) * 0.9
  
  // Изменяем размер в зависимости от направления
  if (direction.includes('e')) {
    newWidth = Math.max(minSize, Math.min(maxSize, resizeStart.value.width + deltaX))
  }
  if (direction.includes('w')) {
    const maxDelta = resizeStart.value.width - minSize
    const delta = Math.min(maxDelta, -deltaX)
    newWidth = resizeStart.value.width - delta
    newX = resizeStart.value.cropX + delta
  }
  if (direction.includes('s')) {
    newHeight = Math.max(minSize, Math.min(maxSize, resizeStart.value.height + deltaY))
  }
  if (direction.includes('n')) {
    const maxDelta = resizeStart.value.height - minSize
    const delta = Math.min(maxDelta, -deltaY)
    newHeight = resizeStart.value.height - delta
    newY = resizeStart.value.cropY + delta
  }
  
  // Ограничиваем границы с учетом нового размера
  newX = Math.max(0, Math.min(containerSize.value.width - newWidth, newX))
  newY = Math.max(0, Math.min(containerSize.value.height - newHeight, newY))
  
  cropState.value = {
    ...cropState.value,
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight
  }
  
  updatePreview()
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', onResize)
  document.removeEventListener('touchend', stopResize)
}

// Загрузка аватарки
const uploadAvatar = async () => {
  if (!selectedFile.value) return
  
  uploading.value = true
  
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    const img = new Image()
    img.onload = async () => {
      try {
        // РАЗМЕР ФИНАЛЬНОГО ИЗОБРАЖЕНИЯ (200x200 как на бэкенде)
        const finalSize = 200
        
        // Устанавливаем размер canvas равным финальному размеру
        canvas.width = finalSize
        canvas.height = finalSize
        
        // Создаем круглую область обрезки
        ctx.save()
        ctx.beginPath()
        ctx.arc(finalSize / 2, finalSize / 2, finalSize / 2, 0, 2 * Math.PI)
        ctx.clip()
        
        // Вычисляем координаты обрезки в оригинальном изображении
        // Учитываем масштаб и смещение
        const scaledCropX = (cropState.value.x - zoomState.value.offsetX) / zoomState.value.scale
        const scaledCropY = (cropState.value.y - zoomState.value.offsetY) / zoomState.value.scale
        const scaledCropSize = cropState.value.width / zoomState.value.scale
        
        // Рисуем обрезанную часть, масштабируя до финального размера
        ctx.drawImage(
          img,
          scaledCropX, scaledCropY, scaledCropSize, scaledCropSize,
          0, 0, finalSize, finalSize
        )
        
        ctx.restore()
        
        // Конвертируем в blob и загружаем
        canvas.toBlob(async (blob) => {
          try {
            if (!blob) {
              throw new Error('Ошибка создания изображения')
            }
            
            const formData = new FormData()
            formData.append('avatar', blob, 'avatar.jpg')
            formData.append('user_id', props.userId.toString())
            
            const response = await axios.post('/admin/users/avatar/upload', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              timeout: 30000 // 30 секунд таймаут
            })
            
            if (response.data && response.data.avatar_url) {
              ElMessage.success('Аватарка успешно загружена')
              emit('avatar-updated', response.data.avatar_url)
              showUploadDialog.value = false
              resetSelection()
            } else {
              throw new Error('Неверный ответ сервера')
            }
          } catch (error) {
            console.error('Ошибка загрузки аватарки:', error)
            let errorMessage = 'Ошибка загрузки аватарки'
            
            if (error.response?.status === 413) {
              errorMessage = 'Файл слишком большой'
            } else if (error.response?.status === 415) {
              errorMessage = 'Неподдерживаемый формат файла'
            } else if (error.response?.status === 400) {
              errorMessage = error.response.data || 'Неверные данные'
            } else if (error.code === 'ECONNABORTED') {
              errorMessage = 'Превышено время ожидания'
            } else if (error.response?.data) {
              errorMessage = error.response.data
            } else if (error.message) {
              errorMessage += ': ' + error.message
            }
            
            ElMessage.error(errorMessage)
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

// Обновляем предпросмотр при изменении состояния
watch([cropState, zoomState], updatePreview, { deep: true })

// Добавляем обработчик колесика мыши
const addWheelHandler = () => {
  if (cropWrapper.value) {
    cropWrapper.value.addEventListener('wheel', handleWheel, { passive: false })
  }
}

// Удаляем обработчик колесика мыши
const removeWheelHandler = () => {
  if (cropWrapper.value) {
    cropWrapper.value.removeEventListener('wheel', handleWheel)
  }
}

// Добавляем обработчик при монтировании
nextTick(() => {
  addWheelHandler()
})

// Очистка ресурсов при размонтировании
onUnmounted(() => {
  removeWheelHandler()
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
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
  gap: 24px;
}

.crop-container {
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  background: #000;
}

.crop-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease;
}

.crop-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

.crop-frame {
  position: absolute;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
  cursor: move;
  user-select: none;
  touch-action: none;
  z-index: 10;
}

.crop-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #fff;
  border: 2px solid #007bff;
  border-radius: 50%;
  cursor: pointer;
  z-index: 11;
}

.crop-handle-nw { top: -6px; left: -6px; cursor: nw-resize; }
.crop-handle-ne { top: -6px; right: -6px; cursor: ne-resize; }
.crop-handle-sw { bottom: -6px; left: -6px; cursor: sw-resize; }
.crop-handle-se { bottom: -6px; right: -6px; cursor: se-resize; }
.crop-handle-n { top: -6px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
.crop-handle-s { bottom: -6px; left: 50%; transform: translateY(-50%); cursor: s-resize; }
.crop-handle-w { left: -6px; top: 50%; transform: translateY(-50%); cursor: w-resize; }
.crop-handle-e { right: -6px; top: 50%; transform: translateY(-50%); cursor: e-resize; }

.crop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 5;
}

.crop-darken {
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
}

.crop-darken-top {
  top: 0;
  left: 0;
  right: 0;
}

.crop-darken-bottom {
  left: 0;
  right: 0;
}

.crop-darken-left {
  left: 0;
}

.crop-darken-right {
  right: 0;
}

.result-preview {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.result-preview h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
}

.preview-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
  border: 3px solid var(--color-primary);
  box-shadow: 0 4px 16px rgba(17, 87, 64, 0.15);
  background: #fff;
}

.preview-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.crop-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 500px;
}

.control-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
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
  
  .crop-wrapper {
    height: 300px;
  }
  
  .crop-controls {
    gap: 12px;
  }
  
  .control-group {
    flex-direction: column;
    width: 100%;
  }
  
  .control-group .el-button {
    width: 100%;
  }
  
  .preview-avatar {
    width: 100px;
    height: 100px;
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
  
  .crop-wrapper {
    height: 250px;
  }
}
</style>
