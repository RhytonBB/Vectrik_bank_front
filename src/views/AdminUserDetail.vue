<template>
  <el-card class="user-detail-card">
    <el-button type="primary" @click="$router.push('/admin/users')" class="back-button">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    
    <div class="user-header">
      <h2>👤 Детали пользователя</h2>
      <div v-if="user" class="user-info">
        <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
        <div class="user-id">ID: {{ user.id }}</div>
      </div>
    </div>
    
    <el-tabs v-model="activeTab" class="custom-tabs">
      <el-tab-pane label="📝 Профиль" name="profile">
        <div class="tab-content">
          <div class="form-section">
            <h3>Основная информация</h3>
            <el-form :model="editForm" label-width="120px" @submit.prevent="saveProfile" class="profile-form">
              <el-form-item label="Имя" class="form-item">
                <el-input v-model="editForm.first_name" class="form-input" />
              </el-form-item>
              <el-form-item label="Фамилия" class="form-item">
                <el-input v-model="editForm.last_name" class="form-input" />
              </el-form-item>
              <el-form-item label="Telegram" class="form-item">
                <el-input v-model="editForm.telegram_username" class="form-input" />
              </el-form-item>
              <el-form-item label="Логин" class="form-item">
                <el-input v-model="editForm.login" class="form-input" />
              </el-form-item>
              <el-form-item label="Пароль (новый)" class="form-item">
                <el-input v-model="editForm.password" type="password" autocomplete="new-password" class="form-input" />
              </el-form-item>
              <el-form-item label="Группа" class="form-item">
                <el-select v-model="editForm.group_id" placeholder="Выберите группу" clearable class="form-select">
                  <el-option v-for="g in groups" :key="g.id" :label="g.name" :value="g.id" />
                </el-select>
              </el-form-item>
              <el-form-item class="form-actions">
                <el-button type="primary" @click="saveProfile" class="save-btn">💾 Сохранить</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <div class="user-status-section">
            <h3>Статус пользователя</h3>
            <div v-if="user" class="status-cards">
              <div class="status-card">
                <div class="status-label">ID пользователя</div>
                <div class="status-value">{{ user.id }}</div>
              </div>
              <div class="status-card">
                <div class="status-label">Активен</div>
                <div class="status-value">
                  <el-switch v-model="user.is_active" @change="toggleActive" class="status-switch" />
                </div>
              </div>
              <div class="status-card">
                <div class="status-label">Администратор</div>
                <div class="status-value">
                  <el-switch v-model="user.is_admin" @change="toggleAdmin" class="status-switch" />
                </div>
              </div>
              <div class="status-card">
                <div class="status-label">Статус бана</div>
                <div class="status-value">
                  <el-tag :type="user.is_banned ? 'danger' : 'success'" class="ban-tag">
                    {{ user.is_banned ? '🚫 Забанен' : '✅ Активен' }}
                  </el-tag>
                </div>
              </div>
            </div>
            <div class="ban-actions">
              <el-button type="danger" @click="banUser" v-if="user && !user.is_banned" class="ban-btn">
                🚫 Забанить пользователя
              </el-button>
              <el-button type="success" @click="unbanUser" v-if="user && user.is_banned" class="unban-btn">
                ✅ Разбанить пользователя
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="💰 Корректировка баланса" name="balance">
        <div class="tab-content">
          <div class="balance-section">
            <h3>Изменение баланса пользователя</h3>
            <el-form :model="balanceForm" label-width="120px" @submit.prevent="adjustBalance" class="balance-form">
              <el-form-item label="Сумма (+/-)" class="form-item">
                <el-input-number v-model="balanceForm.amount" :min="-1000000" :max="1000000" class="balance-input" />
              </el-form-item>
              <el-form-item label="Комментарий" class="form-item">
                <el-input v-model="balanceForm.context" type="textarea" :rows="3" class="form-input" />
              </el-form-item>
              <el-form-item class="form-actions">
                <el-button type="primary" @click="adjustBalance" class="adjust-btn">💰 Скорректировать</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="🗑️ Удаление" name="delete">
        <div class="tab-content">
          <div class="delete-section">
            <h3>Удаление пользователя</h3>
            <el-alert 
              type="warning" 
              title="⚠️ Внимание!" 
              description="Удаление пользователя необратимо. Все связанные данные будут потеряны." 
              show-icon 
              class="delete-alert"
            />
            <div class="delete-actions">
              <el-button type="danger" @click="confirmDelete" class="delete-btn">
                🗑️ Удалить пользователя
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <el-alert v-if="message" :title="message" type="success" show-icon closable @close="message = ''" class="success-alert" />
    <el-alert v-if="error" :title="error" type="error" show-icon closable @close="error = ''" class="error-alert" />
    
    <div v-if="!user" class="error-section">
      <el-alert title="Пользователь не найден или ошибка загрузки" type="error" show-icon />
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const user = ref(null)
const activeTab = ref('profile')
const message = ref('')
const error = ref('')
const groups = ref([])

const editForm = ref({
  first_name: '',
  last_name: '',
  telegram_username: '',
  login: '',
  password: '',
  group_id: null
})
const balanceForm = ref({
  amount: 0,
  context: ''
})

const fetchGroups = async () => {
  const resp = await axios.get('/admin/groups')
  groups.value = resp.data
}

const fetchUser = async () => {
  const resp = await axios.get(`/admin/users/${route.params.id}`)
  user.value = resp.data
  editForm.value.first_name = user.value.first_name
  editForm.value.last_name = user.value.last_name
  editForm.value.telegram_username = user.value.telegram_username
  editForm.value.login = user.value.login || ''
  editForm.value.password = ''
  editForm.value.group_id = user.value.group_id || null
}

const saveProfile = async () => {
  try {
    await axios.put(`/admin/users/${user.value.id}`, {
      first_name: editForm.value.first_name,
      last_name: editForm.value.last_name,
      telegram_username: editForm.value.telegram_username,
      login: editForm.value.login,
      password: editForm.value.password ? editForm.value.password : undefined,
      group_id: editForm.value.group_id
    })
    message.value = 'Данные пользователя обновлены'
    error.value = ''
    fetchUser()
  } catch (e) {
    error.value = 'Ошибка обновления профиля'
  }
}

const adjustBalance = async () => {
  if (!balanceForm.value.amount) {
    error.value = 'Введите сумму корректировки'
    return
  }
  try {
    await axios.post('/admin/users/adjust_balance', {
      user_id: user.value.id,
      amount: balanceForm.value.amount,
      context: balanceForm.value.context
    })
    message.value = 'Баланс скорректирован'
    error.value = ''
    balanceForm.value.amount = 0
    balanceForm.value.context = ''
    fetchUser()
  } catch (e) {
    error.value = 'Ошибка корректировки баланса'
  }
}

const toggleActive = async () => {
  await axios.post(`/admin/users/${user.value.id}/activate`, { is_active: user.value.is_active })
}

const toggleAdmin = async () => {
  await axios.post(`/admin/users/${user.value.id}/admin`, { is_admin: user.value.is_admin })
}

const banUser = async () => {
  await axios.post(`/admin/users/${user.value.id}/ban`)
  fetchUser()
}

const unbanUser = async () => {
  await axios.post(`/admin/users/${user.value.id}/unban`)
  fetchUser()
}

const confirmDelete = async () => {
  try {
    await ElMessageBox.confirm(
      'Вы уверены, что хотите удалить пользователя? Это действие необратимо.',
      'Подтверждение удаления',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning',
      }
    )
    await axios.delete(`/admin/users/${user.value.id}`)
    message.value = 'Пользователь удалён'
    setTimeout(() => router.push('/admin/users'), 1200)
  } catch (e) {
    if (e !== 'cancel') error.value = 'Ошибка удаления пользователя'
  }
}

onMounted(() => {
  fetchUser()
  fetchGroups()
})
</script>

<style scoped>
.user-detail-card {
  max-width: 800px;
  margin: 40px auto;
  padding: 32px 24px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(17, 87, 64, 0.08);
  border: 2px solid var(--color-primary);
  font-family: 'Inter', sans-serif;
}

.back-button {
  margin-bottom: 24px;
  transition: all 0.3s ease;
  border-radius: 10px;
  font-weight: 600;
}

.back-button:hover {
  transform: translateX(-4px);
  box-shadow: 0 4px 12px rgba(17,87,64,0.15);
}

.user-header {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.user-header h2 {
  color: var(--color-primary);
  font-weight: 800;
  margin: 0 0 16px 0;
  font-size: 1.8rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-primary);
}

.user-id {
  font-size: 1rem;
  color: #666;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  color: #17624A !important;
  font-weight: 700;
}

.custom-tabs :deep(.el-tabs__active-bar) {
  background-color: #17624A !important;
}

.custom-tabs :deep(.el-tabs__item:hover) {
  color: #17624A !important;
  background: transparent !important;
}

.tab-content {
  padding: 24px 0;
}

.form-section, .user-status-section, .balance-section, .delete-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.form-section:hover, .user-status-section:hover, .balance-section:hover, .delete-section:hover {
  box-shadow: 0 4px 16px rgba(17,87,64,0.08);
}

.form-section h3, .user-status-section h3, .balance-section h3, .delete-section h3 {
  color: var(--color-primary);
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: 700;
}

.profile-form, .balance-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  margin-bottom: 16px;
}

.form-input, .form-select, .balance-input {
  width: 100%;
  transition: all 0.3s ease;
}

.form-input:focus, .form-select:focus, .balance-input:focus {
  box-shadow: 0 0 0 2px rgba(17,87,64,0.2);
}

.form-actions {
  margin-top: 24px;
  text-align: center;
}

.save-btn, .adjust-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
  padding: 0 32px;
}

.save-btn:hover, .adjust-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17,87,64,0.15);
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.status-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.status-card:hover {
  box-shadow: 0 4px 12px rgba(17,87,64,0.08);
  transform: translateY(-2px);
}

.status-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.status-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
}

.status-switch {
  margin-top: 4px;
}

.ban-tag {
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
}

.ban-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.ban-btn, .unban-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
  padding: 0 24px;
}

.ban-btn:hover, .unban-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231,76,60,0.15);
}

.unban-btn:hover {
  box-shadow: 0 4px 12px rgba(39,174,96,0.15);
}

.delete-alert {
  margin-bottom: 24px;
  border-radius: 10px;
}

.delete-actions {
  text-align: center;
}

.delete-btn {
  height: 52px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
  padding: 0 32px;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231,76,60,0.2);
}

.success-alert, .error-alert {
  margin-top: 16px;
  border-radius: 10px;
}

.error-section {
  margin-top: 24px;
}

@media (max-width: 600px) {
  .user-detail-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 16px 4vw !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    box-sizing: border-box;
    border: 1px solid var(--color-primary) !important;
  }
  
  .back-button {
    width: 100% !important;
    height: 48px !important;
    font-size: 16px !important;
    margin-bottom: 20px !important;
  }
  
  .back-button:hover {
    transform: none !important;
  }
  
  .user-header h2 {
    font-size: 1.4rem !important;
    margin-bottom: 12px !important;
  }
  
  .user-info {
    flex-direction: column !important;
    gap: 12px !important;
    align-items: flex-start !important;
  }
  
  .user-name {
    font-size: 1.2rem !important;
  }
  
  .user-id {
    font-size: 14px !important;
    padding: 6px 10px !important;
  }
  
  .tab-content {
    padding: 16px 0 !important;
  }
  
  .form-section, .user-status-section, .balance-section, .delete-section {
    padding: 20px !important;
    border-radius: 10px !important;
    margin-bottom: 20px !important;
  }
  
  .form-section:hover, .user-status-section:hover, .balance-section:hover, .delete-section:hover {
    box-shadow: none !important;
    transform: none !important;
  }
  
  .form-section h3, .user-status-section h3, .balance-section h3, .delete-section h3 {
    font-size: 1.1rem !important;
    margin-bottom: 16px !important;
  }
  
  .form-item {
    width: 100% !important;
    margin-bottom: 16px !important;
  }
  
  .form-input, .form-select, .balance-input {
    width: 100% !important;
    font-size: 16px !important;
  }
  
  .save-btn, .adjust-btn {
    width: 100% !important;
    height: 52px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .save-btn:hover, .adjust-btn:hover {
    transform: none !important;
  }
  
  .status-cards {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
  
  .status-card {
    padding: 16px !important;
  }
  
  .status-card:hover {
    transform: none !important;
  }
  
  .ban-actions {
    flex-direction: column !important;
    gap: 12px !important;
  }
  
  .ban-btn, .unban-btn {
    width: 100% !important;
    height: 52px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .ban-btn:hover, .unban-btn:hover {
    transform: none !important;
  }
  
  .delete-btn {
    width: 100% !important;
    height: 56px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .delete-btn:hover {
    transform: none !important;
  }
  
  .success-alert, .error-alert {
    font-size: 16px !important;
    margin-top: 16px !important;
    border-radius: 8px !important;
  }
}
</style> 