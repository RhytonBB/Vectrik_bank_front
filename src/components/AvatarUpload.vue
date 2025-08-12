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
              <el-button @click="updatePreview" size="small" type="warning">
                <i class="el-icon-refresh"></i> Обновить предпросмотр
              </el-button>
              <el-button @click="debugZoom" size="small" type="info">
                <i class="el-icon-info"></i> Отладка
              </el-button>
              <el-button @click="testZoom" size="small" type="warning">
                <i class="el-icon-zoom-in"></i> Тест масштаба
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
const containerSize = ref({ width: 0, height: 0 })

// Состояние перетаскивания
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const cropStart = ref({ x: 0, y: 0 })

// Состояние изменения размера
const isResizing = ref(false)
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })
const resizeDirection = ref('')

// Функция для преобразования координат контейнера в координаты изображения
const containerToImageCoords = (containerX, containerY) => {
  if (!cropImage.value || !containerSize.value.width || !containerSize.value.height) return { x: 0, y: 0 }
  
  const img = cropImage.value
  
  // Проверяем, что изображение загрузилось
  if (img.naturalWidth === 0 || img.naturalHeight === 0) return { x: 0, y: 0 }
  
  // Вычисляем масштаб изображения в контейнере (object-fit: contain)
  const scaleX = containerSize.value.width / img.naturalWidth
  const scaleY = containerSize.value.height / img.naturalHeight
  const scale = Math.min(scaleX, scaleY)
  
  // Проверяем, что масштаб корректен
  if (scale <= 0) return { x: 0, y: 0 }
  
  // Размеры изображения в контейнере
  const imageWidth = img.naturalWidth * scale
  const imageHeight = img.naturalHeight * scale
  
  // Смещение изображения для центрирования
  const offsetX = (containerSize.value.width - imageWidth) / 2
  const offsetY = (containerSize.value.height - imageHeight) / 2
  
  // Преобразуем координаты контейнера в координаты изображения
  // 1. Убираем смещения контейнера (object-fit: contain)
  // 2. Убираем пользовательские смещения (масштабирование относительно центра области обрезки)
  // 3. Делим на пользовательский масштаб
  // 4. Делим на масштаб контейнера
  const imageX = (containerX - offsetX - zoomState.value.offsetX) / zoomState.value.scale / scale
  const imageY = (containerY - offsetY - zoomState.value.offsetY) / zoomState.value.scale / scale
  
  return { x: imageX, y: imageY }
}

// Функция для вычисления размера области обрезки в изображении
const getCropSizeInImage = () => {
  if (!cropImage.value || !containerSize.value.width || !containerSize.value.height) return 0
  
  const img = cropImage.value
  
  // Проверяем, что изображение загрузилось
  if (img.naturalWidth === 0 || img.naturalHeight === 0) return 0
  
  // Масштаб изображения в контейнере (object-fit: contain)
  const scaleX = containerSize.value.width / img.naturalWidth
  const scaleY = containerSize.value.height / img.naturalHeight
  const scale = Math.min(scaleX, scaleY)
  
  // Проверяем, что масштаб корректен
  if (scale <= 0) return 0
  
  // Размер области обрезки в контейнере
  const cropSizeInContainer = cropState.value.width
  
  // Размер в изображении = размер в контейнере / масштаб контейнера
  const cropSizeInImage = cropSizeInContainer / scale
  
  return cropSizeInImage
}

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

  // Очищаем предыдущий URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  
  selectedFile.value = file.raw || file
  previewUrl.value = URL.createObjectURL(file.raw || file)
  
  // Сбрасываем состояние
  resetCrop()
  resetZoom()
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
  
  // Очищаем canvas предпросмотра
  if (previewCanvas.value) {
    const ctx = previewCanvas.value.getContext('2d')
    ctx.clearRect(0, 0, previewCanvas.value.width, previewCanvas.value.height)
  }
}

const onImageLoad = () => {
  nextTick(() => {
    if (cropImage.value && cropWrapper.value) {
      const wrapper = cropWrapper.value
      
      // Проверяем, что изображение загрузилось корректно
      if (cropImage.value.naturalWidth === 0 || cropImage.value.naturalHeight === 0) {
        console.warn('Изображение не загрузилось корректно')
        return
      }
      
      // Проверяем минимальный размер изображения
      if (cropImage.value.naturalWidth < 100 || cropImage.value.naturalHeight < 100) {
        ElMessage.error('Изображение слишком маленькое. Минимальный размер: 100x100 пикселей')
        resetSelection()
        return
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
  
  // Размер области обрезки - 30% от меньшей стороны контейнера
  const size = Math.min(containerSize.value.width, containerSize.value.height) * 0.3
  
  // Ограничиваем максимальный размер области обрезки
  const maxSize = Math.min(containerSize.value.width, containerSize.value.height) * 0.4
  const finalSize = Math.min(size, maxSize)
  
  // Центрируем область обрезки в контейнере
  cropState.value = {
    x: (containerSize.value.width - finalSize) / 2,
    y: (containerSize.value.height - finalSize) / 2,
    width: finalSize,
    height: finalSize
  }
  
  // Сбрасываем масштабирование при центрировании
  zoomState.value = {
    scale: 1,
    offsetX: 0,
    offsetY: 0
  }
  
  // Обновляем предпросмотр только если изображение загружено
  if (cropImage.value && cropImage.value.naturalWidth > 0) {
    updatePreview()
  }
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
  
  // Обновляем предпросмотр только если изображение загружено
  if (cropImage.value && cropImage.value.naturalWidth > 0) {
    updatePreview()
  }
}

// Масштабирование колесиком мыши
const handleWheel = (e) => {
  e.preventDefault()
  
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.max(0.5, Math.min(3, zoomState.value.scale + delta))
  
  // Проверяем, что новый масштаб не слишком большой
  if (newScale > 2.5) {
    console.warn('Масштаб слишком большой, ограничиваем до 2.5')
    return
  }
  
  // Получаем текущие координаты центра области обрезки в изображении
  const currentImageCoords = containerToImageCoords(
    cropState.value.x + cropState.value.width / 2,
    cropState.value.y + cropState.value.height / 2
  )
  
  // Вычисляем масштаб изображения в контейнере (object-fit: contain)
  const scaleX = containerSize.value.width / cropImage.value.naturalWidth
  const scaleY = containerSize.value.height / cropImage.value.naturalHeight
  const containerScale = Math.min(scaleX, scaleY)
  
  // Вычисляем новое смещение, чтобы центр области обрезки оставался на месте
  const scaleRatio = newScale / zoomState.value.scale
  
  // Новое смещение = текущее смещение + изменение позиции центра области обрезки
  // Формула: чтобы точка currentImageCoords оставалась на месте при изменении масштаба
  const newOffsetX = zoomState.value.offsetX + (currentImageCoords.x * containerScale * (1 - scaleRatio))
  const newOffsetY = zoomState.value.offsetY + (currentImageCoords.y * containerScale * (1 - scaleRatio))
  
  // Ограничиваем смещения, чтобы изображение не уходило слишком далеко
  const maxOffsetX = containerSize.value.width * (newScale - 1) / 2
  const maxOffsetY = containerSize.value.height * (newScale - 1) / 2
  
  const clampedOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, newOffsetX))
  const clampedOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffsetY))
  
  zoomState.value = {
    scale: newScale,
    offsetX: clampedOffsetX,
    offsetY: clampedOffsetY
  }
  
  // Обновляем предпросмотр после изменения масштаба
  nextTick(() => {
    updatePreview()
  })
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
  const imageCoords = containerToImageCoords(cropState.value.x, cropState.value.y)
  
  // Вычисляем размер области обрезки в оригинальном изображении
  const cropSizeInImage = getCropSizeInImage()
  
  // Проверяем валидность координат и размера
  if (imageCoords.x < 0 || imageCoords.y < 0 || cropSizeInImage <= 0) {
    return
  }
  
  // Проверяем, что размер области обрезки не слишком большой
  const maxCropSize = Math.min(cropImage.value.naturalWidth, cropImage.value.naturalHeight)
  if (cropSizeInImage > maxCropSize) {
    return
  }
  
  // Ограничиваем координаты размерами изображения
  const maxX = cropImage.value.naturalWidth - cropSizeInImage
  const maxY = cropImage.value.naturalHeight - cropSizeInImage
  
  const finalCropX = Math.max(0, Math.min(maxX, imageCoords.x))
  const finalCropY = Math.max(0, Math.min(maxY, imageCoords.y))
  
  // Проверяем, что область обрезки не выходит за границы
  if (finalCropX + cropSizeInImage > cropImage.value.naturalWidth || 
      finalCropY + cropSizeInImage > cropImage.value.naturalHeight) {
    return
  }
  
  // Рисуем обрезанную часть, масштабируя до размера предпросмотра
  ctx.drawImage(
    cropImage.value,
    finalCropX, finalCropY, cropSizeInImage, cropSizeInImage,
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
  const minSize = Math.min(containerSize.value.width, containerSize.value.height) * 0.15
  const maxSize = Math.min(containerSize.value.width, containerSize.value.height) * 0.4
  
  // Изменяем размер в зависимости от направления
  if (direction.includes('e')) {
    newWidth = Math.max(minSize, Math.min(maxSize, resizeStart.value.width + deltaX))
  }
  if (direction.includes('w')) {
    const maxDelta = resizeStart.value.width - minSize
    const delta = Math.min(maxDelta, -deltaX)
    newWidth = Math.max(minSize, Math.min(maxSize, resizeStart.value.width - delta))
    newX = resizeStart.value.cropX + delta
  }
  if (direction.includes('s')) {
    newHeight = Math.max(minSize, Math.min(maxSize, resizeStart.value.height + deltaY))
  }
  if (direction.includes('n')) {
    const maxDelta = resizeStart.value.height - minSize
    const delta = Math.min(maxDelta, -deltaY)
    newHeight = Math.max(minSize, Math.min(maxSize, resizeStart.value.height - delta))
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
  if (!selectedFile.value || !cropImage.value) return
  
  uploading.value = true
  
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
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
    const imageCoords = containerToImageCoords(cropState.value.x, cropState.value.y)
    
    // Вычисляем размер области обрезки в оригинальном изображении
    const cropSizeInImage = getCropSizeInImage()
    
    // Проверяем валидность координат
    if (imageCoords.x < 0 || imageCoords.y < 0 || cropSizeInImage <= 0) {
      throw new Error('Некорректные координаты обрезки. Попробуйте изменить область обрезки.')
    }
    
    // Проверяем, что размер области обрезки не слишком большой
    const maxCropSize = Math.min(cropImage.value.naturalWidth, cropImage.value.naturalHeight)
    if (cropSizeInImage > maxCropSize) {
      throw new Error('Размер области обрезки слишком большой. Попробуйте уменьшить область обрезки.')
    }
    
    // Ограничиваем координаты размерами изображения
    const maxX = cropImage.value.naturalWidth - cropSizeInImage
    const maxY = cropImage.value.naturalHeight - cropSizeInImage
    
    const finalCropX = Math.max(0, Math.min(maxX, imageCoords.x))
    const finalCropY = Math.max(0, Math.min(maxY, imageCoords.y))
    
    // Проверяем, что область обрезки не выходит за границы
    if (finalCropX + cropSizeInImage > cropImage.value.naturalWidth || 
        finalCropY + cropSizeInImage > cropImage.value.naturalHeight) {
      throw new Error('Область обрезки выходит за границы изображения. Попробуйте изменить область обрезки.')
    }
    
    // Рисуем обрезанную часть, масштабируя до финального размера
    ctx.drawImage(
      cropImage.value,
      finalCropX, finalCropY, cropSizeInImage, cropSizeInImage,
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
    console.error('Ошибка загрузки аватарки:', error)
    ElMessage.error('Ошибка загрузки аватарки')
    uploading.value = false
  }
}

// Функция для отладки масштабирования
const debugZoom = () => {
  if (!cropImage.value || !containerSize.value.width || !containerSize.value.height) return
  
  const img = cropImage.value
  const cropCenterX = cropState.value.x + cropState.value.width / 2
  const cropCenterY = cropState.value.y + cropState.value.height / 2
  
  // Вычисляем масштаб изображения в контейнере
  const scaleX = containerSize.value.width / img.naturalWidth
  const scaleY = containerSize.value.height / img.naturalHeight
  const containerScale = Math.min(scaleX, scaleY)
  
  // Вычисляем координаты обрезки в изображении
  const imageCoords = containerToImageCoords(cropState.value.x, cropState.value.y)
  const cropSizeInImage = getCropSizeInImage()
  
  // Вычисляем координаты центра области обрезки в изображении
  const centerImageCoords = containerToImageCoords(cropCenterX, cropCenterY)
  
  console.log('=== ОТЛАДКА МАСШТАБИРОВАНИЯ ===')
  console.log('Центр области обрезки в контейнере:', { x: cropCenterX, y: cropCenterY })
  console.log('Центр области обрезки в изображении:', centerImageCoords)
  console.log('Текущий масштаб:', zoomState.value.scale)
  console.log('Текущие смещения:', { x: zoomState.value.offsetX, y: zoomState.value.offsetY })
  console.log('Размеры контейнера:', containerSize.value)
  console.log('Размеры изображения:', { width: img.naturalWidth, height: img.naturalHeight })
  console.log('Масштаб контейнера (object-fit):', containerScale)
  console.log('Область обрезки в контейнере:', cropState.value)
  console.log('Координаты обрезки в изображении:', imageCoords)
  console.log('Размер области обрезки в изображении:', cropSizeInImage)
  
  // Проверяем, что координаты корректны
  if (centerImageCoords.x >= 0 && centerImageCoords.y >= 0 && 
      centerImageCoords.x < img.naturalWidth && centerImageCoords.y < img.naturalHeight) {
    console.log('✅ Координаты центра корректны')
  } else {
    console.log('❌ Координаты центра некорректны!')
  }
  
  console.log('================================')
}

// Функция для тестирования масштабирования
const testZoom = () => {
  console.log('=== ТЕСТ МАСШТАБИРОВАНИЯ ===')
  
  // Текущее состояние
  console.log('До масштабирования:')
  debugZoom()
  
  // Тестируем масштабирование
  const oldScale = zoomState.value.scale
  const newScale = oldScale * 1.2
  
  // Получаем текущие координаты центра области обрезки в изображении
  const currentImageCoords = containerToImageCoords(
    cropState.value.x + cropState.value.width / 2,
    cropState.value.y + cropState.value.height / 2
  )
  
  // Вычисляем масштаб изображения в контейнере (object-fit: contain)
  const scaleX = containerSize.value.width / cropImage.value.naturalWidth
  const scaleY = containerSize.value.height / cropImage.value.naturalHeight
  const containerScale = Math.min(scaleX, scaleY)
  
  // Вычисляем новое смещение
  const scaleRatio = newScale / oldScale
  const newOffsetX = zoomState.value.offsetX + (currentImageCoords.x * containerScale * (1 - scaleRatio))
  const newOffsetY = zoomState.value.offsetY + (currentImageCoords.y * containerScale * (1 - scaleRatio))
  
  console.log('Тестовые значения:')
  console.log('Старый масштаб:', oldScale)
  console.log('Новый масштаб:', newScale)
  console.log('scaleRatio:', scaleRatio)
  console.log('Старые смещения:', { x: zoomState.value.offsetX, y: zoomState.value.offsetY })
  console.log('Новые смещения:', { x: newOffsetX, y: newOffsetY })
  console.log('Центр области обрезки в изображении:', currentImageCoords)
  console.log('Масштаб контейнера:', containerScale)
  
  // Применяем тестовое масштабирование
  zoomState.value = {
    scale: newScale,
    offsetX: newOffsetX,
    offsetY: newOffsetY
  }
  
  // Обновляем предпросмотр
  nextTick(() => {
    console.log('После масштабирования:')
    debugZoom()
    console.log('=== КОНЕЦ ТЕСТА ===')
  })
}

// Обновляем предпросмотр при изменении состояния
watch([cropState, zoomState], () => {
  updatePreview()
  debugZoom() // Добавляем отладку масштабирования
}, { deep: true })

// Добавляем обработчик колесика мыши
const addWheelHandler = () => {
  if (cropWrapper.value) {
    // Удаляем старый обработчик, если он есть
    cropWrapper.value.removeEventListener('wheel', handleWheel)
    // Добавляем новый обработчик
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

// Также добавляем обработчик при изменении cropWrapper
watch(cropWrapper, (newWrapper, oldWrapper) => {
  if (oldWrapper) {
    oldWrapper.removeEventListener('wheel', handleWheel)
  }
  if (newWrapper) {
    addWheelHandler()
  }
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
