<template>
  <el-card class="reward-card">
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <div class="reward-header">
      <h1>💸 Начисление Вектриков</h1>
    </div>
    
    <div class="tabs-section">
      <el-tabs v-model="activeTab" class="reward-tabs">
        <el-tab-pane label="Моя группа" name="group"></el-tab-pane>
        <el-tab-pane label="Общий список" name="all"></el-tab-pane>
      </el-tabs>
    </div>
    
    <div class="search-section">
      <div class="search-container">
        <el-input 
          v-model="query" 
          placeholder="🔍 Поиск пользователей..." 
          class="search-input"
          clearable
          @input="onSearchInput"
          @focus="showSearchResults = true"
          @blur="setTimeout(() => showSearchResults = false, 200)"
        />
        <div v-if="showSearchResults && query && searchResults.length > 0" class="search-dropdown">
          <div 
            v-for="user in searchResults" 
            :key="user.id" 
            class="search-result-item"
            @click="selectSearchResult(user)"
          >
            <div class="search-user-avatar">
              <img 
                v-if="user.avatar_url"
                :src="user.avatar_url" 
                :alt="`${user.first_name} ${user.last_name}`"
                class="search-avatar-img"
              />
              <div v-else class="search-avatar-placeholder">
                <i class="el-icon-user"></i>
              </div>
            </div>
            <div class="search-user-info">
              <div class="search-user-name">{{ user.first_name }} {{ user.last_name }}</div>
              <div class="search-user-telegram">@{{ user.telegram_username }}</div>
              <div class="search-user-group" v-if="user.group">{{ user.group.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="reward-form-section">
      <h3>Выбор пользователей</h3>
      <div v-if="isMobile" class="mobile-user-list">
        <div v-for="u in users" :key="u.id" class="user-card">
          <el-checkbox :value="u.id" v-model="selectedUsers" class="user-checkbox">
            <div class="user-info">
              <div class="user-avatar">
                <img 
                  v-if="u.avatar_url"
                  :src="u.avatar_url" 
                  :alt="`${u.first_name} ${u.last_name}`"
                  class="avatar-img"
                />
                <div v-else class="avatar-placeholder">
                  <i class="el-icon-user"></i>
                </div>
              </div>
              <div class="user-details">
                <div class="user-name">{{ u.first_name }} {{ u.last_name }}</div>
                <div class="user-telegram">@{{ u.telegram_username }}</div>
                <div v-if="u.is_admin" class="admin-badge">👑 Админ</div>
              </div>
            </div>
          </el-checkbox>
        </div>
      </div>
      <div v-else class="desktop-user-list">
        <el-checkbox-group v-model="selectedUsers" class="user-checkbox-group">
                  <el-checkbox v-for="u in users" :key="u.id" :value="u.id" class="user-checkbox">
          <div class="user-info">
            <div class="user-avatar">
              <img 
                v-if="u.avatar_url"
                :src="u.avatar_url" 
                :alt="`${u.first_name} ${u.last_name}`"
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder">
                <i class="el-icon-user"></i>
              </div>
            </div>
            <div class="user-details">
              <div class="user-name">{{ u.first_name }} {{ u.last_name }}</div>
              <div class="user-telegram">@{{ u.telegram_username }}</div>
              <div v-if="u.is_admin" class="admin-badge">👑 Админ</div>
            </div>
          </div>
        </el-checkbox>
        </el-checkbox-group>
      </div>
      
      <div class="reward-details">
        <h3>Детали начисления</h3>
        <el-form-item label="Основание:" class="reason-item">
          <el-select v-model="reasonType" placeholder="Тип основания" required @change="onReasonTypeChange" class="reason-type-select">
            <el-option label="Предустановленные основания" value="preset" />
            <el-option label="Ручной ввод" value="manual" />
          </el-select>
          
          <el-select v-if="reasonType === 'preset'" v-model="reason" placeholder="Основание для начисления" required @change="onReasonChange" class="reason-select">
            <el-option v-for="r in reasons" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
          
          <el-input v-if="reasonType === 'manual'" v-model="customReason" placeholder="Введите основание для начисления" required class="custom-reason-input" />
        </el-form-item>
        <el-form-item label="Сумма:" class="amount-item">
          <el-input-number v-model="amount" :min="1" required class="amount-input" />
        </el-form-item>
        <el-form-item class="reward-button-item">
          <el-button type="primary" native-type="submit" @click="sendReward" class="reward-btn">
            Начислить Вектрики
          </el-button>
        </el-form-item>
      </div>
      
      <div class="comment-section">
        <h3>Комментарий (ОБЯЗАТЕЛЬНО!)</h3>
        <el-form-item class="context-item">
          <el-input v-model="context" type="textarea" :rows="isMobile ? 4 : 6" placeholder="Дополнительная информация..." class="context-input" />
        </el-form-item>
      </div>
    </div>
    
    <el-alert v-if="message" :title="message" type="success" show-icon closable @close="message = ''" class="success-alert" />
    <el-alert v-if="error" :title="error" type="error" show-icon closable @close="error = ''" class="error-alert" />
  </el-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const activeTab = ref('all')
const query = ref('')
const users = ref([])
const selectedUsers = ref([])
const amount = ref(0)
const reasonType = ref('preset')
const reason = ref('')
const customReason = ref('')
const context = ref('')
const message = ref('')
const error = ref('')
const isMobile = ref(false)
const searchResults = ref([])
const showSearchResults = ref(false)

const reasons = [
  { label: '+5 за активность в группе Вектора', value: '+5 за активность в группе Вектора', amount: 5 },
  { label: '+10 за отличный вопрос или активность на блоке', value: '+10 за отличный вопрос или активность на блоке', amount: 10 },
  { label: '+15 за конструктивную ОС', value: '+15 за конструктивную ОС', amount: 15 },
  { label: '+20 за участие в задании на ИС по своей инициативе', value: '+20 за участие в задании на ИС по своей инициативе', amount: 20 },
  { label: '+25 за отличную игротехнику', value: '+25 за отличную игротехнику', amount: 25 },
  { label: '+30 за победу в соревнованиях', value: '+30 за победу в соревнованиях', amount: 30 },
  { label: '+35 за что-то внезапное, креативное и хорошее', value: '+35 за что-то внезапное, креативное и хорошее', amount: 35 },
  { label: '+40 за преодоление себя', value: '+40 за преодоление себя', amount: 40 },
  { label: '+50 за высокий результат на экзамене', value: '+50 за высокий результат на экзамене', amount: 50 },
  { label: '+245 за прохождение вузовской Школы кураторов', value: '+245 за прохождение вузовской Школы кураторов', amount: 245 }
]

const fetchUsers = async () => {
  try {
    const resp = await axios.get('/api/admin/reward/users', {
      params: { scope: activeTab.value, q: query.value }
    })
    
    // Сортируем пользователей: сначала обычные, потом админы
    if (activeTab.value === 'all') {
      users.value = resp.data.sort((a, b) => {
        if (a.is_admin && !b.is_admin) return 1
        if (!a.is_admin && b.is_admin) return -1
        return 0
      })
    } else {
      users.value = resp.data
    }
  } catch (e) {
    error.value = 'Ошибка поиска пользователей'
  }
}
watch(activeTab, fetchUsers)

const onSearchInput = () => {
  if (query.value.trim() === '') {
    searchResults.value = [];
    return;
  }
  
  const searchQuery = query.value.toLowerCase().trim();
  searchResults.value = users.value.filter(user => 
    user.first_name.toLowerCase().includes(searchQuery) ||
    user.last_name.toLowerCase().includes(searchQuery) ||
    user.telegram_username.toLowerCase().includes(searchQuery) ||
    (user.group && user.group.name.toLowerCase().includes(searchQuery))
  ).slice(0, 8); // Ограничиваем до 8 результатов
};

const selectSearchResult = (user) => {
  query.value = '';
  searchResults.value = [];
  showSearchResults.value = false;
  // Автоматически выбираем пользователя
  if (!selectedUsers.value.includes(user.id)) {
    selectedUsers.value.push(user.id);
  }
};
const onReasonChange = (val) => {
  const found = reasons.find(r => r.value === val)
  if (found) amount.value = found.amount
}

const onReasonTypeChange = (val) => {
  if (val === 'preset') {
    reason.value = ''
    customReason.value = ''
  } else {
    reason.value = ''
    amount.value = 0
  }
}
const sendReward = async () => {
  try {
    const finalReason = reasonType.value === 'preset' ? reason.value : customReason.value
    
    if (!finalReason) {
      error.value = 'Выберите или введите основание для начисления'
      return
    }
    
    await axios.post('/api/admin/reward', {
      user_ids: selectedUsers.value,
      amount: amount.value,
      reason: finalReason,
      context: context.value
    })
    message.value = 'Начисление успешно!'
    error.value = ''
    
    // Сброс формы
    selectedUsers.value = []
    amount.value = 0
    reason.value = ''
    customReason.value = ''
    context.value = ''
  } catch (e) {
    error.value = 'Ошибка начисления'
  }
}
onMounted(() => {
  fetchUsers()
  isMobile.value = window.innerWidth < 600
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 600
  })
})
</script>

<style scoped>
.reward-card {
  max-width: 600px;
  margin: 40px auto;
  padding: 32px 24px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(17, 87, 64, 0.08);
  border: 2px solid var(--color-primary);
  font-family: 'Inter', sans-serif;
}

.reward-header {
  margin-bottom: 24px;
}

.reward-header h1 {
  color: var(--color-primary);
  font-weight: 800;
  margin: 0;
  text-align: center;
}

.reward-tabs :deep(.el-tabs__item.is-active) {
  color: #17624A !important;
  font-weight: 700;
}

.reward-tabs :deep(.el-tabs__active-bar) {
  background-color: #17624A !important;
}

.reward-tabs :deep(.el-tabs__item:hover) {
  color: #17624A !important;
  background: transparent !important;
}

.search-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.search-container {
  position: relative;
}

.search-input {
  width: 100%;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 8px;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background-color: #f0f0f0;
}

.search-user-avatar {
  flex-shrink: 0;
  margin-right: 12px;
}

.search-avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary);
}

.search-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
  font-size: 20px;
  border: 2px solid var(--color-primary);
}

.search-user-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.search-user-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-primary);
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  line-height: 1.3;
}

.search-user-telegram {
  font-size: 12px;
  color: #666;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.search-user-group {
  font-size: 12px;
  color: #555;
  margin-top: 4px;
}

.reward-form-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.reward-form-section h3 {
  color: var(--color-primary);
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.mobile-user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.desktop-user-list {
  margin-bottom: 24px;
}

.user-checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 40px 24px;
  align-items: start;
}

.user-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 32px 24px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  min-height: 140px;
  margin-bottom: 20px;
  position: relative;
  box-sizing: border-box;
}

.user-card:not(:last-child) {
  margin-bottom: 30px;
}

.user-card:hover {
  box-shadow: 0 2px 8px rgba(17,87,64,0.08);
}

.user-checkbox {
  width: 100%;
  margin: 0;
}

.user-checkbox :deep(.el-checkbox__label) {
  width: 100%;
  padding-left: 8px;
}

.user-checkbox :deep(.el-checkbox__input) {
  margin-right: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24px;
  width: 100%;
  min-height: 80px;
  box-sizing: border-box;
}

.user-avatar {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.avatar-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary);
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
  font-size: 28px;
  border: 2px solid var(--color-primary);
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
  color: var(--color-primary);
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  line-height: 1.3;
}

.user-telegram {
  font-size: 14px;
  color: #666;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.admin-badge {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: inline-block;
  margin-top: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.reward-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e0e0e0;
}

.reason-type-select, .reason-select, .custom-reason-input, .amount-input, .context-input {
  width: 100%;
  margin-bottom: 16px;
}

.reason-type-select {
  margin-bottom: 12px;
}

  .context-input :deep(.el-textarea__inner) {
    font-size: 16px;
    line-height: 1.5;
    resize: vertical;
    min-height: 80px;
    width: 100%;
  }

.reward-btn {
  width: 100%;
  height: 48px;
  font-size: 18px;
  font-weight: 600;
}

.comment-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e0e0e0;
}

.comment-section h3 {
  color: var(--color-primary);
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.success-alert, .error-alert {
  margin-top: 16px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .user-checkbox-group {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .user-card {
    padding: 24px 20px;
    margin-bottom: 16px;
  }
  
  .user-info {
    gap: 20px;
  }
  
  .user-name {
    font-size: 15px;
    max-width: 250px;
  }
  
  .user-telegram {
    font-size: 13px;
  }
}

@media (max-width: 600px) {
  .reward-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 16px 4vw !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    box-sizing: border-box;
    border: 1px solid var(--color-primary) !important;
  }
  
  .reward-header h1 {
    font-size: 1.4rem !important;
  }
  
  .search-section {
    padding: 16px;
    border-radius: 10px;
  }
  
  .search-form {
    flex-direction: column !important;
    gap: 12px !important;
  }
  
  .search-input, .search-btn {
    width: 100% !important;
    font-size: 16px !important;
  }
  
  .search-btn {
    height: 44px !important;
  }
  
  .mobile-user-list {
    gap: 10px;
  }
  
  .user-card {
    padding: 20px 16px !important;
    border-radius: 8px;
    min-height: auto !important;
    margin-bottom: 16px !important;
  }
  
  .user-info {
    gap: 16px !important;
    min-height: auto !important;
    flex-wrap: wrap !important;
  }
  
  .user-name {
    font-size: 15px !important;
    line-height: 1.3 !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    hyphens: auto !important;
    max-width: 200px !important;
  }
  
  .user-telegram {
    font-size: 13px !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }
  
  .avatar-img {
    width: 50px !important;
    height: 50px !important;
    flex-shrink: 0 !important;
  }
  
  .avatar-placeholder {
    width: 50px !important;
    height: 50px !important;
    font-size: 24px !important;
    flex-shrink: 0 !important;
  }
  
  .user-details {
    flex: 1 !important;
    min-width: 0 !important;
    max-width: calc(100% - 66px) !important;
  }
  
  .user-checkbox :deep(.el-checkbox__label) {
    padding-left: 6px !important;
  }
  
  .user-checkbox :deep(.el-checkbox__input) {
    margin-right: 6px !important;
  }
  
  .reward-details {
    padding: 20px;
    border-radius: 10px;
  }
  
  .reward-form-section h3 {
    font-size: 1.1rem !important;
    margin-bottom: 12px !important;
  }
  
  .el-form-item {
    width: 100% !important;
    margin-bottom: 16px !important;
  }
  
  .el-input, .el-button, .el-select, .el-input-number, .el-textarea {
    width: 100% !important;
    font-size: 16px !important;
  }
  
  .reason-type-select, .reason-select, .custom-reason-input {
    margin-bottom: 12px !important;
  }
  
  .reward-btn {
    height: 52px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .comment-section {
    padding: 20px;
    border-radius: 10px;
  }

  .comment-section h3 {
    font-size: 1.1rem !important;
    margin-bottom: 12px !important;
  }

  .context-input :deep(.el-textarea__inner) {
    font-size: 16px !important;
    min-height: 80px !important;
    max-height: 200px !important;
    width: 100% !important;
  }

  .admin-badge {
    font-size: 10px;
    padding: 3px 6px;
    margin-top: 3px;
  }
}

/* Дополнительные стили для очень маленьких экранов */
@media (max-width: 480px) {
  .reward-card {
    padding: 12px 3vw !important;
  }
  
  .user-card {
    padding: 16px 12px !important;
    margin-bottom: 12px !important;
  }
  
  .user-info {
    gap: 12px !important;
  }
  
  .avatar-img, .avatar-placeholder {
    width: 45px !important;
    height: 45px !important;
  }
  
  .avatar-placeholder {
    font-size: 20px !important;
  }
  
  .user-name {
    font-size: 14px !important;
    max-width: 180px !important;
  }
  
  .user-telegram {
    font-size: 12px !important;
  }
  
  .user-details {
    max-width: calc(100% - 57px) !important;
  }
  
  .search-section {
    padding: 14px;
  }
  
  .search-input {
    font-size: 16px !important;
    height: 44px !important;
  }
  
  .search-dropdown {
    max-height: 250px !important;
    margin-top: 4px !important;
  }
  
  .search-result-item {
    padding: 16px 20px !important;
  }
  
  .search-avatar-img, .search-avatar-placeholder {
    width: 45px !important;
    height: 45px !important;
  }
  
  .search-user-name {
    font-size: 16px !important;
  }
  
  .search-user-telegram, .search-user-group {
    font-size: 14px !important;
  }

  .reward-details, .comment-section {
    padding: 16px;
  }
}
</style> 