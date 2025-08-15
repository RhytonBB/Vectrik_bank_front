<template>
  <ClientLayout>
    <div class="client-profile">
      <!-- Заголовок -->
      <div class="header">
        <div class="logo-section">
          <img :src="getLogo()" alt="Вектрик Банк" class="logo">
          <h1 class="bank-name">Вектрик Банк</h1>
        </div>
      </div>

      <!-- Заголовок профиля -->
      <h2 class="profile-title">Профиль</h2>

      <!-- Информация о пользователе -->
      <div class="profile-info">
        <div class="profile-header">
          <div class="avatar-section">
            <img 
              v-if="userInfo.avatar_url"
              :src="userInfo.avatar_url" 
              :alt="`${userInfo.first_name} ${userInfo.last_name}`"
              class="user-avatar"
            />
            <div v-else class="avatar-placeholder">
              <el-icon><User /></el-icon>
            </div>
          </div>
          <div class="profile-actions">
            <button @click="showChangeLoginModal = true" class="action-button change-login-btn">
              Сменить логин
            </button>
            <button @click="showChangePasswordModal = true" class="action-button change-password-btn">
              Сменить пароль
            </button>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-item">
            <span class="info-label">Имя:</span>
            <span class="info-value">{{ userInfo.first_name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Фамилия:</span>
            <span class="info-value">{{ userInfo.last_name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Telegram:</span>
            <span class="info-value">@{{ userInfo.telegram_username }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Номер счета:</span>
            <span class="info-value">{{ userInfo.account_number }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Баланс:</span>
            <span class="info-value balance">{{ userInfo.balance }} Вектриков</span>
          </div>
        </div>
      </div>

      <!-- Модальное окно смены логина -->
      <el-dialog v-model="showChangeLoginModal" title="Смена логина" width="400px" center>
        <el-form @submit.prevent="changeLogin" :model="loginForm" :rules="loginRules" ref="loginFormRef">
          <el-form-item label="Текущий логин:" prop="oldLogin">
            <el-input v-model="loginForm.oldLogin" placeholder="Введите текущий логин" />
          </el-form-item>
          <el-form-item label="Новый логин:" prop="newLogin">
            <el-input v-model="loginForm.newLogin" placeholder="Введите новый логин" />
          </el-form-item>
          <el-form-item label="Подтвердите логин:" prop="confirmLogin">
            <el-input v-model="loginForm.confirmLogin" placeholder="Повторите новый логин" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showChangeLoginModal = false">Отмена</el-button>
          <el-button type="primary" @click="changeLogin" :loading="isLoading">Сменить</el-button>
        </template>
      </el-dialog>

      <!-- Модальное окно смены пароля -->
      <el-dialog v-model="showChangePasswordModal" title="Смена пароля" width="400px" center>
        <el-form @submit.prevent="changePassword" :model="passwordForm" :rules="passwordRules" ref="passwordFormRef">
          <el-form-item label="Текущий пароль:" prop="oldPassword">
            <el-input v-model="passwordForm.oldPassword" type="password" placeholder="Введите текущий пароль" />
          </el-form-item>
          <el-form-item label="Новый пароль:" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" placeholder="Введите новый пароль" />
          </el-form-item>
          <el-form-item label="Подтвердите пароль:" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="Повторите новый пароль" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showChangePasswordModal = false">Отмена</el-button>
          <el-button type="primary" @click="changePassword" :loading="isLoading">Сменить</el-button>
        </template>
      </el-dialog>

      <!-- Кнопка выхода -->
      <div class="logout-section">
        <button @click="logout" class="logout-button">
          Выйти из аккаунта
        </button>
      </div>
    </div>
  </ClientLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import ClientLayout from '@/components/ClientLayout.vue'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const { currentTheme } = useTheme()
const userInfo = ref({})

// Модальные окна
const showChangeLoginModal = ref(false)
const showChangePasswordModal = ref(false)
const isLoading = ref(false)

// Формы
const loginForm = ref({
  oldLogin: '',
  newLogin: '',
  confirmLogin: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Рефы для форм
const loginFormRef = ref(null)
const passwordFormRef = ref(null)

// Правила валидации
const loginRules = {
  oldLogin: [
    { required: true, message: 'Введите текущий логин', trigger: 'blur' }
  ],
  newLogin: [
    { required: true, message: 'Введите новый логин', trigger: 'blur' },
    { min: 3, message: 'Логин должен содержать минимум 3 символа', trigger: 'blur' }
  ],
  confirmLogin: [
    { required: true, message: 'Подтвердите новый логин', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== loginForm.value.newLogin) {
          callback(new Error('Логины не совпадают'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const passwordRules = {
  oldPassword: [
    { required: true, message: 'Введите текущий пароль', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: 'Введите новый пароль', trigger: 'blur' },
    { min: 6, message: 'Пароль должен содержать минимум 6 символов', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Подтвердите новый пароль', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('Пароли не совпадают'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const getLogo = () => {
  if (currentTheme.value === 'pink') {
      return '/logo-pink.svg'
}
return '/logo.svg'
}

const fetchUserInfo = async () => {
  try {
    const response = await axios.get('/me')
    userInfo.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки информации о пользователе:', error)
  }
}

const changeLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate((valid) => {
    if (valid) {
      isLoading.value = true
      axios.post('/client/change-login', {
        old_login: loginForm.value.oldLogin,
        new_login: loginForm.value.newLogin
      })
        .then(() => {
          ElMessage.success('Логин успешно изменен!')
          showChangeLoginModal.value = false
          // Очищаем форму
          loginForm.value = { oldLogin: '', newLogin: '', confirmLogin: '' }
        })
        .catch(error => {
          ElMessage.error(error.response?.data?.message || 'Ошибка изменения логина')
        })
        .finally(() => {
          isLoading.value = false
        })
    }
  })
}

const changePassword = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      isLoading.value = true
      axios.post('/client/change-password', {
        old_password: passwordForm.value.oldPassword,
        new_password: passwordForm.value.newPassword,
        confirm_password: passwordForm.value.confirmPassword
      })
        .then(() => {
          ElMessage.success('Пароль успешно изменен!')
          showChangePasswordModal.value = false
          // Очищаем форму
          passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
        })
        .catch(error => {
          ElMessage.error(error.response?.data?.message || 'Ошибка изменения пароля')
        })
        .finally(() => {
          isLoading.value = false
        })
    }
  })
}

const logout = async () => {
  try {
    await axios.post('/logout')
    localStorage.removeItem('token')
    // НЕ сбрасываем preloaderShown - флаг должен сохраняться до новой авторизации
    router.push('/')
  } catch (error) {
    console.error('Ошибка выхода:', error)
    // В любом случае перенаправляем на главную
    localStorage.removeItem('token')
    // НЕ сбрасываем preloaderShown
    router.push('/')
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.client-profile {
  padding: 16px;
  background: #fff;
  min-height: 100vh;
}

.header {
  margin-bottom: 20px;
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
  color: var(--color-primary);
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}

.profile-title {
  color: var(--color-primary);
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-align: center;
}

.profile-info {
  margin-bottom: 32px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary);
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  background-color: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  font-size: 32px;
  border: 3px solid var(--color-primary);
}

.avatar-placeholder .el-icon {
  font-size: 32px;
}

.profile-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 8px 15px;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: #d0d0d0;
}

.change-login-btn {
  background: #409eff;
  color: #fff;
}

.change-login-btn:hover {
  background: #66b1ff;
}

.change-password-btn {
  background: #67c23a;
  color: #fff;
}

.change-password-btn:hover {
  background: #85ce61;
}

.info-card {
  background: #e8f5e8;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #d4edda;
}

/* Розовая тема */
body.theme-pink .info-card {
  background: #ffe6f7;
  border: 1px solid #ffb3e6;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #d4edda;
}

.info-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.info-label {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 14px;
}

.info-value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.info-value.balance {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 16px;
}

.info-value.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.info-value.status.active {
  background: #d4edda;
  color: #155724;
}

.info-value.status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.logout-section {
  display: flex;
  justify-content: center;
}

.logout-button {
  padding: 12px 24px;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: #c82333;
}

@media (max-width: 480px) {
  .client-profile {
    padding: 12px;
  }
  
  .bank-name {
    font-size: 20px;
  }
  
  .profile-header {
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }
  
  .profile-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .action-button {
    width: 100%;
    padding: 12px;
    font-size: 16px;
  }
  
  .info-card {
    padding: 16px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .info-label,
  .info-value {
    font-size: 13px;
  }
  
  .info-value.balance {
    font-size: 15px;
  }

  .avatar-section {
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }
  
  .user-avatar,
  .avatar-placeholder {
    width: 100px !important;
    height: 100px !important;
  }
  
  .avatar-placeholder .el-icon {
    font-size: 40px !important;
  }
}
</style> 