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
          <div class="info-item" v-if="userInfo.login_change_count !== undefined">
            <span class="info-label">Смены логина:</span>
            <span class="info-value">{{ userInfo.login_change_count }}/2</span>
          </div>
        </div>
      </div>

      <!-- Информация о требованиях -->
      <div class="requirements-section">
        <div class="requirements-card">
          <h3 class="requirements-title">Требования к учетным данным</h3>
          
          <div class="requirement-group">
            <h4 class="requirement-subtitle">Логин</h4>
            <ul class="requirement-list">
              <li>От 3 до 50 символов</li>
              <li>Только буквы (a-z, A-Z), цифры (0-9), дефис (-) и подчеркивание (_)</li>
              <li>Максимум 2 смены за все время</li>
            </ul>
          </div>
          
          <div class="requirement-group">
            <h4 class="requirement-subtitle">Пароль</h4>
            <ul class="requirement-list">
              <li>От 6 до 100 символов</li>
              <li>Любые символы, кроме опасных скриптов</li>
              <li>Рекомендуется использовать буквы, цифры и символы</li>
            </ul>
          </div>
          
          <div class="security-note">
            <el-icon><Lock /></el-icon>
            <span>Все данные защищены современными методами шифрования</span>
          </div>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="actions-section">
        <button @click="showChangeLoginModal = true" class="action-button change-login-btn">
          Сменить логин
        </button>
        <button @click="showChangePasswordModal = true" class="action-button change-password-btn">
          Сменить пароль
        </button>
      </div>

      <!-- Модальное окно смены логина -->
      <el-dialog v-model="showChangeLoginModal" title="Смена логина" width="400px" center>
        <div class="modal-requirements">
          <p class="modal-requirements-text">
            <strong>Требования к логину:</strong> от 3 до 50 символов, только буквы, цифры, дефис и подчеркивание. 
            Максимум 2 смены за все время.
          </p>
        </div>
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
          <div class="modal-footer">
            <el-button size="small" @click="showChangeLoginModal = false">Отмена</el-button>
            <el-button size="small" type="primary" @click="changeLogin" :loading="isLoading">Сменить</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- Модальное окно смены пароля -->
      <el-dialog v-model="showChangePasswordModal" title="Смена пароля" width="400px" center>
        <div class="modal-requirements">
          <p class="modal-requirements-text">
            <strong>Требования к паролю:</strong> от 6 до 100 символов. Рекомендуется использовать буквы, цифры и символы для повышения безопасности.
          </p>
        </div>
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
          <div class="modal-footer">
            <el-button size="small" @click="showChangePasswordModal = false">Отмена</el-button>
            <el-button size="small" type="primary" @click="changePassword" :loading="isLoading">Сменить</el-button>
          </div>
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
import { User, Lock } from '@element-plus/icons-vue'
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
    { min: 3, max: 50, message: 'Логин должен содержать от 3 до 50 символов', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: 'Логин может содержать только буквы, цифры, дефис и подчеркивание',
      trigger: 'blur'
    }
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
    { min: 6, max: 100, message: 'Пароль должен содержать от 6 до 100 символов', trigger: 'blur' }
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
    const response = await axios.get('/api/me')
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
      axios.post('/api/client/change-login', {
        old_login: loginForm.value.oldLogin,
        new_login: loginForm.value.newLogin
      })
        .then(() => {
          ElMessage.success('Логин успешно изменен!')
          showChangeLoginModal.value = false
          // Очищаем форму
          loginForm.value = { oldLogin: '', newLogin: '', confirmLogin: '' }
          // Обновляем информацию пользователя
          fetchUserInfo()
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
      axios.post('/api/client/change-password', {
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
    await axios.post('/api/logout')
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

.actions-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  justify-content: center;
}

.action-button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.action-button:hover {
  background: #d0d0d0;
}

.change-login-btn {
  background: var(--color-primary);
  color: #fff;
}

.change-login-btn:hover {
  background: ##115740;
  transform: translateY(-1px);
}

.change-password-btn {
  background: #115740;
  color: #fff;
}

.change-password-btn:hover {
  background: #115740;
  transform: translateY(-1px);
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

.requirements-section {
  margin-bottom: 24px;
}

.requirements-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

/* Розовая тема */
body.theme-pink .requirements-card {
  background: #fff0f5;
  border: 1px solid #ffd6e7;
}

.requirements-title {
  color: var(--color-primary);
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-align: center;
}

.requirement-group {
  margin-bottom: 16px;
}

.requirement-group:last-child {
  margin-bottom: 0;
}

.requirement-subtitle {
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.requirement-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirement-list li {
  color: #555;
  font-size: 13px;
  margin-bottom: 6px;
  padding-left: 16px;
  position: relative;
  line-height: 1.4;
}

.requirement-list li:before {
  content: "•";
  color: var(--color-primary);
  font-weight: bold;
  position: absolute;
  left: 0;
}

.requirement-list li:last-child {
  margin-bottom: 0;
}

.security-note {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e8f5e8;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  border: 1px solid #d4edda;
}

/* Розовая тема */
body.theme-pink .security-note {
  background: #ffe6f7;
  border: 1px solid #ffb3e6;
}

.security-note .el-icon {
  color: var(--color-primary);
  font-size: 16px;
}

.security-note span {
  color: #333;
  font-size: 13px;
  font-weight: 500;
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

.modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.modal-footer .el-button {
  min-width: 80px;
}

.modal-requirements {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #e9ecef;
}

/* Розовая тема */
body.theme-pink .modal-requirements {
  background: #fff0f5;
  border: 1px solid #ffd6e7;
}

.modal-requirements-text {
  color: #555;
  font-size: 13px;
  margin: 0;
  line-height: 1.4;
}

.modal-requirements-text strong {
  color: var(--color-primary);
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
  
  .actions-section {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  
  .action-button {
    width: 100%;
    padding: 14px;
    font-size: 16px;
    min-width: auto;
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
  
  .requirements-card {
    padding: 16px;
  }
  
  .requirements-title {
    font-size: 16px;
  }
  
  .requirement-subtitle {
    font-size: 13px;
  }
  
  .requirement-list li {
    font-size: 12px;
    padding-left: 14px;
  }
  
  .security-note {
    padding: 10px;
    flex-direction: column;
    text-align: center;
    gap: 6px;
  }
  
  .security-note span {
    font-size: 12px;
  }
}
</style> 