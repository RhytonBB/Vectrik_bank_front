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
      <el-form :inline="!isMobile" @submit.prevent="searchUsers" class="search-form">
        <el-form-item label="Поиск пользователей:" class="search-item">
          <el-input v-model="query" placeholder="Имя, фамилия или логин" class="search-input" />
        </el-form-item>
        <el-form-item class="search-button-item">
          <el-button type="primary" native-type="submit" class="search-btn">Искать</el-button>
        </el-form-item>
      </el-form>
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
            </div>
          </div>
        </el-checkbox>
        </el-checkbox-group>
      </div>
      
      <div class="reward-details">
        <h3>Детали начисления</h3>
        <el-form-item label="Причина:" class="reason-item">
          <el-select v-model="reason" placeholder="Выберите причину" required @change="onReasonChange" class="reason-select">
            <el-option v-for="r in reasons" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Сумма (Вектрики):" class="amount-item">
          <el-input-number v-model="amount" :min="1" required class="amount-input" />
        </el-form-item>
        <el-form-item class="reward-button-item">
          <el-button type="primary" native-type="submit" @click="sendReward" class="reward-btn">
            Начислить Вектрики
          </el-button>
        </el-form-item>
      </div>
      
      <div class="comment-section">
        <h3>Комментарий (необязательно)</h3>
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
const reason = ref('')
const context = ref('')
const message = ref('')
const error = ref('')
const isMobile = ref(false)

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
    const resp = await axios.get('/admin/reward/users', {
      params: { scope: activeTab.value, q: query.value }
    })
    users.value = resp.data
  } catch (e) {
    error.value = 'Ошибка поиска пользователей'
  }
}
const searchUsers = fetchUsers
watch(activeTab, fetchUsers)
const onReasonChange = (val) => {
  const found = reasons.find(r => r.value === val)
  if (found) amount.value = found.amount
}
const sendReward = async () => {
  try {
    await axios.post('/admin/reward', {
      user_ids: selectedUsers.value,
      amount: amount.value,
      reason: reason.value,
      context: context.value
    })
    message.value = 'Начисление успешно!'
    error.value = ''
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

.search-form {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.search-input {
  width: 100%;
}

.search-btn {
  height: 40px;
  font-weight: 600;
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
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.user-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.user-card:hover {
  box-shadow: 0 2px 8px rgba(17,87,64,0.08);
}

.user-checkbox {
  width: 100%;
}

.user-checkbox :deep(.el-checkbox__label) {
  width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary);
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
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
  color: var(--color-primary);
}

.user-telegram {
  font-size: 14px;
  color: #666;
}

.reward-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e0e0e0;
}

.reason-select, .amount-input, .context-input {
  width: 100%;
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
    padding: 14px;
    border-radius: 8px;
  }
  
  .user-name {
    font-size: 16px !important;
  }
  
  .user-telegram {
    font-size: 14px !important;
  }
  
  .avatar-img {
    width: 70px !important;
    height: 70px !important;
  }
  
  .avatar-placeholder {
    width: 70px !important;
    height: 70px !important;
    font-size: 32px !important;
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
}
</style> 