<template>
  <ClientLayout>
    <div class="client-news">
      <!-- Заголовок -->
      <div class="header">
        <div class="logo-section">
          <img src="/logo.png" alt="Вектрик Банк" class="logo">
          <h1 class="bank-name">Вектрик Банк</h1>
        </div>
      </div>

      <!-- Заголовок новостей -->
      <div class="news-header">
        <h2 class="news-title">📰 Новости банка</h2>
        <p class="news-subtitle">Будьте в курсе последних событий и обновлений</p>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Загрузка новостей...</p>
      </div>

      <!-- Нет новостей -->
      <div v-else-if="news.length === 0" class="no-news">
        <div class="no-news-icon">📰</div>
        <h3>Пока нет новостей</h3>
        <p>Следите за обновлениями, скоро здесь появятся интересные новости!</p>
      </div>

      <!-- Список новостей -->
      <div v-else class="news-container">
        <!-- Важные новости -->
        <div v-if="featuredNews.length > 0" class="featured-section">
          <h3 class="section-title">🔥 Важные новости</h3>
          <div class="featured-news">
            <div 
              v-for="item in featuredNews" 
              :key="item.id" 
              class="news-card featured"
              @click="viewNews(item)"
            >
              <div class="news-image" v-if="item.images && item.images.length > 0">
                <img :src="item.images[0]" :alt="item.title">
                <div class="featured-badge">Важная</div>
              </div>
              <div class="news-content">
                <h4 class="news-heading">{{ item.title }}</h4>
                <p class="news-summary">{{ item.summary || getSummary(item.content) }}</p>
                <div class="news-meta">
                  <span class="news-date">{{ formatDate(item.published_at) }}</span>
                  <span class="news-views" v-if="item.views > 0">{{ item.views }} просмотров</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Обычные новости -->
        <div class="regular-section">
          <h3 class="section-title" v-if="featuredNews.length > 0">📰 Все новости</h3>
          <div class="news-grid">
            <div 
              v-for="item in regularNews" 
              :key="item.id" 
              class="news-card regular"
              @click="viewNews(item)"
            >
              <div class="news-image" v-if="item.images && item.images.length > 0">
                <img :src="item.images[0]" :alt="item.title">
              </div>
              <div class="news-content">
                <h4 class="news-heading">{{ item.title }}</h4>
                <p class="news-summary">{{ item.summary || getSummary(item.content) }}</p>
                <div class="news-meta">
                  <span class="news-date">{{ formatDate(item.published_at) }}</span>
                  <span class="news-views" v-if="item.views > 0">{{ item.views }} просмотров</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Диалог просмотра новости -->
      <el-dialog 
        v-model="showNewsDialog" 
        :title="selectedNews?.title"
        width="90%"
        max-width="800px"
        class="news-dialog"
      >
        <div v-if="selectedNews" class="news-full">
          <div class="news-full-header">
            <div class="news-full-meta">
              <span class="news-full-date">{{ formatDate(selectedNews.published_at) }}</span>
              <span class="news-full-views" v-if="selectedNews.views > 0">👁️ {{ selectedNews.views }} просмотров</span>
              <el-tag v-if="selectedNews.is_featured" type="danger" size="small">Важная новость</el-tag>
            </div>
          </div>
          
          <div class="news-full-content">
            <div class="content-with-images" v-html="renderContentWithImages(selectedNews)"></div>
          </div>
          
          <!-- Система оценок -->
          <div class="news-ratings">
            <h4>Оцените новость:</h4>
            <div class="rating-buttons">
              <el-button 
                :type="userRating === 'thumbs_up' ? 'success' : 'default'"
                @click="rateNews(selectedNews.id, 'thumbs_up')"
                :loading="ratingLoading"
              >
                👍 {{ selectedNews.thumbs_up || 0 }}
              </el-button>
              <el-button 
                :type="userRating === 'thumbs_down' ? 'danger' : 'default'"
                @click="rateNews(selectedNews.id, 'thumbs_down')"
                :loading="ratingLoading"
              >
                👎 {{ selectedNews.thumbs_down || 0 }}
              </el-button>
              <el-button 
                :type="userRating === 'fire' ? 'warning' : 'default'"
                @click="rateNews(selectedNews.id, 'fire')"
                :loading="ratingLoading"
              >
                🔥 {{ selectedNews.fire_count || 0 }}
              </el-button>
            </div>
          </div>
        </div>
      </el-dialog>

      <!-- Лайтбокс для изображений -->
      <el-dialog 
        v-model="showImageLightbox" 
        width="90%"
        max-width="600px"
        class="image-lightbox"
      >
        <div class="lightbox-content">
          <img :src="lightboxImage" alt="Изображение" class="lightbox-image">
        </div>
      </el-dialog>
    </div>
  </ClientLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import ClientLayout from '@/components/ClientLayout.vue'
import axios from 'axios'

const news = ref([])
const loading = ref(true)
const ratingLoading = ref(false)
const showNewsDialog = ref(false)
const showImageLightbox = ref(false)
const selectedNews = ref(null)
const lightboxImage = ref('')
const userRating = ref(null)

const featuredNews = computed(() => 
  news.value.filter(item => item.is_featured)
)

const regularNews = computed(() => 
  news.value.filter(item => !item.is_featured)
)

const fetchNews = async () => {
  try {
    const response = await axios.get('/api/news')
    news.value = response.data
  } catch (error) {
    console.error('Failed to fetch news:', error)
  } finally {
    loading.value = false
  }
}

const viewNews = async (item) => {
  selectedNews.value = item
  showNewsDialog.value = true
  
  // Получаем рейтинг пользователя для этой новости
  try {
    const response = await axios.get(`/api/news/${item.id}/rating`, { withCredentials: true })
    userRating.value = response.data.rating
  } catch (error) {
    userRating.value = null
  }
}

const rateNews = async (newsId, rating) => {
  ratingLoading.value = true
  try {
    const response = await axios.post(`/api/news/${newsId}/rate`, 
      { rating }, 
      { withCredentials: true }
    )
    
    // Обновляем данные новости
    if (selectedNews.value && selectedNews.value.id === newsId) {
      selectedNews.value.thumbs_up = response.data.news.thumbs_up
      selectedNews.value.thumbs_down = response.data.news.thumbs_down
      selectedNews.value.fire_count = response.data.news.fire_count
    }
    
    // Обновляем рейтинг пользователя
    if (userRating.value === rating) {
      userRating.value = null // Убираем рейтинг при повторном клике
    } else {
      userRating.value = rating
    }
    
    ElMessage.success('Оценка обновлена')
  } catch (error) {
    ElMessage.error('Ошибка при оценке новости')
    console.error('Failed to rate news:', error)
  } finally {
    ratingLoading.value = false
  }
}

const openImageLightbox = (image) => {
  lightboxImage.value = image
  showImageLightbox.value = true
}

const getSummary = (content) => {
  return content.length > 150 ? content.substring(0, 150) + '...' : content
}

const renderContentWithImages = (newsItem) => {
  if (!newsItem.images || newsItem.images.length === 0) {
    return newsItem.content.replace(/\n/g, '<br>')
  }
  
  let content = newsItem.content
  const images = [...newsItem.images].sort((a, b) => a.position - b.position)
  
  // Вставляем изображения в контент
  for (let i = images.length - 1; i >= 0; i--) {
    const image = images[i]
    const imgTag = `<img src="${image.url}" alt="${image.alt}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; cursor: pointer;" onclick="window.openImageLightbox('${image.url}')" />`
    content = content.slice(0, image.position) + imgTag + content.slice(image.position)
  }
  
  return content.replace(/\n/g, '<br>')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchNews()
})
</script>

<style scoped>
.client-news {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 24px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo {
  width: 40px;
  height: 40px;
}

.bank-name {
  color: #17624A;
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}

.news-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #17624A 0%, #27ae60 100%);
  border-radius: 16px;
  color: white;
}

.news-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 8px 0;
}

.news-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #17624A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-news {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-news-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-news h3 {
  color: #333;
  margin: 0 0 12px 0;
  font-size: 20px;
}

.news-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  color: #17624A;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.featured-news {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.news-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e0e0e0;
}

.news-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.news-card.featured {
  border: 2px solid #e74c3c;
  box-shadow: 0 4px 16px rgba(231, 76, 60, 0.2);
}

.news-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.news-card:hover .news-image img {
  transform: scale(1.05);
}

.featured-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #e74c3c;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.news-content {
  padding: 20px;
}

.news-heading {
  color: #333;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-summary {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.news-date {
  font-weight: 500;
}

.news-views {
  display: flex;
  align-items: center;
  gap: 4px;
}

.news-dialog {
  border-radius: 16px;
}

.news-full {
  padding: 20px 0;
}

.news-full-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.news-full-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.news-full-date {
  color: #666;
  font-weight: 500;
}

.news-full-views {
  color: #999;
  font-size: 14px;
}

.news-full-content {
  margin-bottom: 24px;
}

.news-full-text {
  color: #333;
  font-size: 16px;
  line-height: 1.7;
  margin: 0;
}

.content-with-images {
  color: #333;
  font-size: 16px;
  line-height: 1.7;
}

.content-with-images img {
  max-width: 100%;
  height: auto;
  margin: 16px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.content-with-images img:hover {
  transform: scale(1.02);
}

.news-ratings {
  border-top: 1px solid #e0e0e0;
  padding-top: 24px;
  margin-top: 24px;
}

.news-ratings h4 {
  color: #17624A;
  margin: 0 0 16px 0;
  font-size: 18px;
}

.rating-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.rating-buttons .el-button {
  min-width: 80px;
  font-size: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.rating-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.news-full-images {
  border-top: 1px solid #e0e0e0;
  padding-top: 24px;
}

.news-full-images h4 {
  color: #17624A;
  margin: 0 0 16px 0;
  font-size: 18px;
}

.images-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.gallery-image {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.gallery-image:hover {
  transform: scale(1.05);
}

.gallery-image img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.image-lightbox {
  border-radius: 16px;
}

.lightbox-content {
  text-align: center;
}

.lightbox-image {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .client-news {
    padding: 12px;
  }
  
  .news-header {
    padding: 20px 16px;
    border-radius: 12px;
  }
  
  .news-title {
    font-size: 24px;
  }
  
  .news-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .featured-news {
    gap: 16px;
    margin-bottom: 32px;
  }
  
  .news-content {
    padding: 16px;
  }
  
  .news-heading {
    font-size: 16px;
  }
  
  .news-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .images-gallery {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}
</style> 