<template>
  <div class="admin-news">
    <el-card class="news-card">
      <div class="header">
        <div class="header-left">
          <h2>📰 Управление новостями</h2>
          <p class="subtitle">Создавайте и управляйте новостями банка</p>
        </div>
        <el-button type="primary" size="large" @click="showCreateDialog = true" class="create-btn">
          <el-icon><Plus /></el-icon>
          Создать новость
        </el-button>
      </div>

      <!-- Статистика -->
      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">{{ totalNews }}</div>
          <div class="stat-label">Всего новостей</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ publishedNews }}</div>
          <div class="stat-label">Опубликовано</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ featuredNews }}</div>
          <div class="stat-label">Важных</div>
        </div>
      </div>

      <!-- Таблица новостей -->
      <el-table :data="news" v-loading="loading" class="news-table">
        <el-table-column prop="title" label="Заголовок" min-width="200">
          <template #default="scope">
            <div class="news-title-cell">
              <span class="title-text">{{ scope.row.title }}</span>
              <div class="news-badges">
                <el-tag v-if="scope.row.is_featured" type="danger" size="small">Важная</el-tag>
                <el-tag v-if="scope.row.views > 0" type="info" size="small">{{ scope.row.views }} просмотров</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="summary" label="Краткое описание" min-width="150">
          <template #default="scope">
            <div class="summary-text">{{ scope.row.summary || 'Нет описания' }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="isPublished" label="Статус" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.is_published ? 'success' : 'warning'" size="small">
              {{ scope.row.is_published ? 'Опубликована' : 'Черновик' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="Дата создания" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="Действия" width="200" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" @click="editNews(scope.row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button 
                :type="scope.row.is_published ? 'warning' : 'success'"
                size="small"
                @click="togglePublish(scope.row.id)"
              >
                <el-icon><View v-if="scope.row.is_published" /><Hide v-else /></el-icon>
                {{ scope.row.is_published ? 'Снять' : 'Опубликовать' }}
              </el-button>
              <el-button type="danger" size="small" @click="deleteNews(scope.row.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Диалог создания/редактирования -->
    <el-dialog 
      v-model="showCreateDialog" 
      :title="editingNews ? 'Редактировать новость' : 'Создать новость'"
      width="800px"
      class="news-dialog"
    >
      <el-form :model="newsForm" label-width="120px" :rules="rules" ref="newsFormRef">
        <el-form-item label="Заголовок" prop="title">
          <el-input v-model="newsForm.title" placeholder="Введите заголовок новости" />
        </el-form-item>
        
        <el-form-item label="Краткое описание" prop="summary">
          <el-input 
            v-model="newsForm.summary" 
            type="textarea" 
            :rows="3"
            placeholder="Краткое описание для превью (необязательно)"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="Содержание" prop="content">
          <el-input 
            v-model="newsForm.content" 
            type="textarea" 
            :rows="8"
            placeholder="Полное содержание новости"
          />
        </el-form-item>
        
        <el-form-item label="Изображения">
          <div class="images-section">
            <div class="images-list">
              <div 
                v-for="(image, index) in newsForm.images" 
                :key="index" 
                class="image-item"
              >
                <img :src="image" :alt="`Изображение ${index + 1}`" />
                <div class="image-actions">
                  <el-button size="small" type="danger" @click="removeImage(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
            <el-input 
              v-model="newImageUrl" 
              placeholder="URL изображения"
              @keyup.enter="addImage"
            >
              <template #append>
                <el-button @click="addImage">Добавить</el-button>
              </template>
            </el-input>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="newsForm.is_featured">Важная новость</el-checkbox>
          <el-checkbox v-model="newsForm.is_published">Опубликовать сразу</el-checkbox>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">Отмена</el-button>
        <el-button type="primary" @click="saveNews" :loading="saving">
          {{ editingNews ? 'Сохранить' : 'Создать' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, View, Hide } from '@element-plus/icons-vue'
import axios from 'axios'

const news = ref([])
const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const editingNews = ref(null)
const newsFormRef = ref()
const newImageUrl = ref('')

const newsForm = ref({
  title: '',
  content: '',
  summary: '',
  images: [],
  is_published: false,
  is_featured: false
})

const rules = {
  title: [
    { required: true, message: 'Введите заголовок', trigger: 'blur' },
    { min: 3, max: 100, message: 'Заголовок должен быть от 3 до 100 символов', trigger: 'blur' }
  ],
  content: [
    { required: true, message: 'Введите содержание', trigger: 'blur' },
    { min: 10, message: 'Содержание должно быть не менее 10 символов', trigger: 'blur' }
  ]
}

const totalNews = computed(() => news.value.length)
const publishedNews = computed(() => news.value.filter(n => n.is_published).length)
const featuredNews = computed(() => news.value.filter(n => n.is_featured).length)

const fetchNews = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/admin/news', { withCredentials: true })
    news.value = response.data
  } catch (error) {
    ElMessage.error('Ошибка загрузки новостей')
    console.error('Failed to fetch news:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  newsForm.value = {
    title: '',
    content: '',
    summary: '',
    images: [],
    is_published: false,
    is_featured: false
  }
  editingNews.value = null
  newImageUrl.value = ''
}

const addImage = () => {
  if (newImageUrl.value.trim()) {
    newsForm.value.images.push(newImageUrl.value.trim())
    newImageUrl.value = ''
  }
}

const removeImage = (index) => {
  newsForm.value.images.splice(index, 1)
}

const editNews = (item) => {
  editingNews.value = item
  newsForm.value = {
    title: item.title,
    content: item.content,
    summary: item.summary || '',
    images: item.images ? JSON.parse(item.images) : [],
    is_published: item.is_published,
    is_featured: item.is_featured
  }
  showCreateDialog.value = true
}

const saveNews = async () => {
  if (!newsFormRef.value) return
  
  try {
    await newsFormRef.value.validate()
    saving.value = true
    
    const data = {
      ...newsForm.value,
      images: newsForm.value.images
    }
    
    if (editingNews.value) {
      await axios.put(`/api/admin/news/${editingNews.value.id}`, data, { withCredentials: true })
      ElMessage.success('Новость обновлена')
    } else {
      await axios.post('/api/admin/news', data, { withCredentials: true })
      ElMessage.success('Новость создана')
    }
    
    showCreateDialog.value = false
    resetForm()
    await fetchNews()
  } catch (error) {
    if (error.response) {
      ElMessage.error('Ошибка: ' + (error.response.data?.error || error.response.status))
    } else {
      ElMessage.error('Ошибка сохранения')
    }
  } finally {
    saving.value = false
  }
}

const togglePublish = async (id) => {
  try {
    await axios.post(`/api/admin/news/${id}/publish`, {}, { withCredentials: true })
    ElMessage.success('Статус новости изменен')
    await fetchNews()
  } catch (error) {
    ElMessage.error('Ошибка изменения статуса')
  }
}

const deleteNews = async (id) => {
  try {
    await ElMessageBox.confirm(
      'Вы уверены, что хотите удалить эту новость?',
      'Подтверждение удаления',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning',
      }
    )
    
    await axios.delete(`/api/admin/news/${id}`, { withCredentials: true })
    ElMessage.success('Новость удалена')
    await fetchNews()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Ошибка удаления')
    }
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

onMounted(() => {
  fetchNews()
})
</script>

<style scoped>
.admin-news {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.news-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.header-left h2 {
  color: #17624A;
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 800;
}

.subtitle {
  color: #666;
  margin: 0;
  font-size: 16px;
}

.create-btn {
  background: linear-gradient(135deg, #17624A 0%, #27ae60 100%);
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.stat-item {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 16px 20px;
  border-radius: 12px;
  text-align: center;
  min-width: 120px;
  border: 1px solid #dee2e6;
}

.stat-number {
  font-size: 24px;
  font-weight: 800;
  color: #17624A;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.news-table {
  border-radius: 12px;
  overflow: hidden;
}

.news-title-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-text {
  font-weight: 600;
  color: #333;
}

.news-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.summary-text {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.news-dialog {
  border-radius: 16px;
}

.images-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.images-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.image-item:hover {
  border-color: #17624A;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 98, 74, 0.2);
}

.image-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.image-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-item:hover .image-actions {
  opacity: 1;
}

@media (max-width: 768px) {
  .admin-news {
    padding: 12px;
  }
  
  .header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .images-list {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style> 