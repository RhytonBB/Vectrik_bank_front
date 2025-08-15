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
          <div class="info-item" v-if="userInfo.login">
            <span class="info-label">Логин:</span>
            <span class="info-value">{{ userInfo.login }}</span>
          </div>
        </div>
      </div>

      <!-- Кнопки управления -->
      <div class="profile-actions">
        <button @click="showChangeLogin = true" class="action-button primary">
          Сменить логин
        </button>
        <button @click="showChangePassword = true" class="action-button secondary">
          Сменить пароль
        </button>
      </div>

      <!-- Кнопка выхода -->
      <div class="logout-section">
        <button @click="logout" class="logout-button">
          Выйти из аккаунта
        </button>
      </div>

      <!-- Модальное окно смены логина -->
      <el-dialog
        v-model="showChangeLogin"
        title="Смена логина"
        width="400px"
        :close-on-click-modal="false"
      >
        <div class="login-change-form">
          <div class="warning-message" v-if="userInfo.login_change_count >= 2">
            ⚠️ Внимание! Вы уже сменили логин {{ userInfo.login_change_count }} раз(а). 
            Максимальное количество смен: 2 раза.
          </div>
          
          <el-form @submit.prevent="changeLogin" :model="loginForm" :rules="loginRules">
            <el-form-item label="Текущий логин" prop="oldLogin">
              <el-input 
                v-model="loginForm.oldLogin" 
                placeholder="Введите текущий логин"
                :disabled="userInfo.login_change_count >= 2"
              />
            </el-form-item>
            
            <el-form-item label="Новый логин" prop="newLogin">
              <el-input 
                v-model="loginForm.newLogin" 
                placeholder="Введите новый логин"
                :disabled="userInfo.login_change_count >= 2"
              />
            </el-form-item>
          </el-form>
        </div>
        
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showChangeLogin = false">Отмена</el-button>
            <el-button 
              type="primary" 
              @click="changeLogin"
              :disabled="userInfo.login_change_count >= 2 || changingLogin"
              :loading="changingLogin"
            >
              Сменить логин
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- Модальное окно смены пароля -->
      <el-dialog
        v-model="showChangePassword"
        title="Смена пароля"
        width="400px"
        :close-on-click-modal="false"
      >
        <div class="password-change-form">
          <el-form @submit.prevent="changePassword" :model="passwordForm" :rules="passwordRules">
            <el-form-item label="Текущий пароль" prop="oldPassword">
              <el-input 
                v-model="passwordForm.oldPassword" 
                type="password"
                placeholder="Введите текущий пароль"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="Новый пароль" prop="newPassword">
              <el-input 
                v-model="passwordForm.newPassword" 
                type="password"
                placeholder="Введите новый пароль"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="Подтвердите пароль" prop="confirmPassword">
              <el-input 
                v-model="passwordForm.confirmPassword" 
                type="password"
                placeholder="Подтвердите новый пароль"
                show-password
              />
            </el-form-item>
          </el-form>
        </div>
        
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showChangePassword = false">Отмена</el-button>
            <el-button 
              type="primary" 
              @click="changePassword"
              :loading="changingPassword"
            >
              Сменить пароль
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- Модальное окно пользовательского соглашения -->
      <el-dialog
        v-model="showAgreement"
        title="Пользовательское соглашение"
        width="600px"
        :close-on-click-modal="false"
        :show-close="false"
      >
        <div class="agreement-content">
          <div class="agreement-text">
            <h3>Согласие на обработку персональных данных</h3>
            <p>Я, участник учебного интенсива, настоящим свободно, своей волей и в своем интересе даю согласие на обработку моих персональных данных (фамилия, имя, Telegram username) организаторам интенсива исключительно в целях участия в учебном интенсиве и функционирования системы начисления баллов.</p>
            
            <p>Я подтверждаю, что ознакомлен(а) с Политикой конфиденциальности, понимаю цели, объем и сроки обработки моих персональных данных, а также свои права, предусмотренные действующим законодательством Российской Федерации.</p>
            
            <p>Мои персональные данные не будут переданы третьим лицам, не будут использоваться в коммерческих целях, не будут передаваться за пределы Российской Федерации и будут удалены не позднее 7 (семи) дней после завершения интенсива.</p>
            
            <p>Настоящее согласие действует в течение срока проведения интенсива и может быть отозвано мной в любой момент путем обращения к организаторам интенсива по адресу: vanya.sirotkin2017@yandex.ru.</p>
          </div>
        </div>
        
        <template #footer>
          <div class="dialog-footer">
            <el-button 
              type="primary" 
              @click="acceptAgreement"
              :loading="acceptingAgreement"
            >
              Принять соглашение
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </ClientLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import ClientLayout from '@/components/ClientLayout.vue'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const { currentTheme } = useTheme()
const userInfo = ref({})

// Состояние модальных окон
const showChangeLogin = ref(false)
const showChangePassword = ref(false)
const showAgreement = ref(false)

// Состояние загрузки
const changingLogin = ref(false)
const changingPassword = ref(false)
const acceptingAgreement = ref(false)

// Формы
const loginForm = ref({
  oldLogin: '',
  newLogin: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Правила валидации
const loginRules = {
  oldLogin: [{ required: true, message: 'Введите текущий логин', trigger: 'blur' }],
  newLogin: [{ required: true, message: 'Введите новый логин', trigger: 'blur' }]
}

const passwordRules = {
  oldPassword: [{ required: true, message: 'Введите текущий пароль', trigger: 'blur' }],
  newPassword: [{ required: true, message: 'Введите новый пароль', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: 'Подтвердите новый пароль', trigger: 'blur' }]
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
    
    // Проверяем, нужно ли показать соглашение
    if (!userInfo.value.agreement_accepted) {
      showAgreement.value = true
    }
  } catch (error) {
    console.error('Ошибка загрузки информации о пользователе:', error)
  }
}

const changeLogin = async () => {
  if (userInfo.value.login_change_count >= 2) {
    ElMessage.warning('Достигнут лимит смен логина')
    return
  }
  
  changingLogin.value = true
  try {
    await axios.post('/api/client/change-login', {
      old_login: loginForm.value.oldLogin,
      new_login: loginForm.value.newLogin
    })
    
    ElMessage.success('Логин успешно изменен')
    showChangeLogin.value = false
    loginForm.value = { oldLogin: '', newLogin: '' }
    
    // Обновляем информацию о пользователе
    await fetchUserInfo()
  } catch (error) {
    console.error('Ошибка смены логина:', error)
    ElMessage.error(error.response?.data?.error || 'Ошибка смены логина')
  } finally {
    changingLogin.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error('Новые пароли не совпадают')
    return
  }
  
  changingPassword.value = true
  try {
    await axios.post('/api/client/change-password', {
      old_password: passwordForm.value.oldPassword,
      new_password: passwordForm.value.newPassword,
      confirm_password: passwordForm.value.confirmPassword
    })
    
    ElMessage.success('Пароль успешно изменен')
    showChangePassword.value = false
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } catch (error) {
    console.error('Ошибка смены пароля:', error)
    ElMessage.error(error.response?.data?.error || 'Ошибка смены пароля')
  } finally {
    changingPassword.value = false
  }
}

const acceptAgreement = async () => {
  acceptingAgreement.value = true
  try {
    await axios.post('/api/client/accept-agreement')
    
    ElMessage.success('Соглашение принято')
    showAgreement.value = false
    
    // Обновляем информацию о пользователе
    await fetchUserInfo()
  } catch (error) {
    console.error('Ошибка принятия соглашения:', error)
    ElMessage.error(error.response?.data?.error || 'Ошибка принятия соглашения')
  } finally {
    acceptingAgreement.value = false
  }
}

const logout = async () => {
  try {
    await axios.post('/logout')
    localStorage.removeItem('token')
    router.push('/')
  } catch (error) {
    console.error('Ошибка выхода:', error)
    localStorage.removeItem('token')
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
  margin-bottom: 24px;
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

.profile-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 32px;
}

.action-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button.primary {
  background: var(--color-primary);
  color: #fff;
}

.action-button.primary:hover {
  opacity: 0.9;
}

.action-button.secondary {
  background: #6c757d;
  color: #fff;
}

.action-button.secondary:hover {
  background: #5a6268;
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

/* Модальные окна */
.login-change-form,
.password-change-form {
  padding: 20px 0;
}

.warning-message {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.agreement-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 20px 0;
}

.agreement-text h3 {
  color: var(--color-primary);
  margin-bottom: 16px;
}

.agreement-text p {
  margin-bottom: 16px;
  line-height: 1.6;
  color: #333;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 480px) {
  .client-profile {
    padding: 12px;
  }
  
  .bank-name {
    font-size: 20px;
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
  
  .profile-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .action-button {
    width: 100%;
  }
}
</style>