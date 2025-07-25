<template>
  <el-card class="dashboard-card">
    <div class="dashboard-header">
      <AppLogo />
      <h1>Панель администратора</h1>
    </div>
    <p class="balance">Ваш баланс: <b>{{ balance }}</b> Вектриков</p>
    <el-menu class="dashboard-menu" :default-active="activeMenu" router>
      <el-menu-item index="/admin/reward">💸 Начисление Вектриков</el-menu-item>
      <el-menu-item index="/admin/users">👥 Модерация пользователей</el-menu-item>
      <el-menu-item index="/admin/broadcast">📢 Рассылка через Telegram-бота</el-menu-item>
      <el-menu-item index="/admin/products">🛍️ Управление лотами и товарами</el-menu-item>
      <el-menu-item index="/admin/banners">🖼️ Баннеры и медиа</el-menu-item>
      <el-menu-item index="/admin/analytics">📈 Аналитика</el-menu-item>
      <el-menu-item index="/admin/theme">🎨 Тема для пользователей</el-menu-item>
      <el-menu-item @click="logout" index="logout">🚪 Выйти</el-menu-item>
    </el-menu>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AppLogo from '@/components/AppLogo.vue'

const balance = ref(0)
const router = useRouter()
const activeMenu = ref('')

const fetchBalance = async () => {
  try {
    const resp = await axios.get('/api/admin/balance', { withCredentials: true })
    balance.value = resp.data.balance
  } catch (err) {
    balance.value = 'Ошибка'
    if (err.response) {
      alert('Ошибка получения баланса: ' + (err.response.data?.error || err.response.status))
    } else {
      alert('Ошибка соединения с сервером')
    }
  }
}

const logout = () => {
  localStorage.removeItem('token')
  router.push('/')
}

onMounted(() => {
  fetchBalance()
  activeMenu.value = router.currentRoute.value.path
})
</script>

<style scoped>
.dashboard-card {
  max-width: 480px;
  margin: 40px auto;
  padding: 32px 24px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(17, 87, 64, 0.08);
  border: 2px solid var(--color-primary);
}
.dashboard-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}
.dashboard-header h1 {
  color: var(--color-primary);
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 1.6rem;
  margin: 0;
}
.balance {
  color: var(--color-primary);
  font-size: 1.1rem;
  margin-bottom: 18px;
}
.dashboard-menu {
  font-family: 'Inter', sans-serif;
  --el-menu-bg-color: var(--color-secondary);
  --el-menu-active-color: var(--color-primary);
  border-radius: 12px;
}
/* Кастомная подсветка пунктов меню */
:deep(.el-menu-item) {
  transition: background 0.2s, color 0.2s;
  background: transparent !important;
}
:deep(.el-menu-item:hover),
:deep(.el-menu-item:focus) {
  background: rgba(23, 98, 74, 0.07) !important;
  color: #17624A !important;
}
:deep(.el-menu-item.is-active) {
  background: rgba(23, 98, 74, 0.13) !important;
  color: #17624A !important;
  font-weight: 700;
}
@media (max-width: 600px) {
  .dashboard-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 12px 2vw !important;
    border-radius: 10px !important;
    box-sizing: border-box;
  }
  .dashboard-header {
    flex-direction: column !important;
    gap: 8px !important;
    align-items: flex-start !important;
  }
  .dashboard-header h1 {
    font-size: 1.1rem !important;
    margin-bottom: 8px !important;
  }
  .dashboard-menu {
    font-size: 16px !important;
    border-radius: 8px !important;
    width: 100% !important;
    min-width: 0 !important;
    overflow-x: auto !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
  }
  .el-menu-item {
    width: 100% !important;
    min-width: 0 !important;
    font-size: 16px !important;
    padding: 12px 0 !important;
    text-align: left !important;
  }
  .balance {
    font-size: 1rem !important;
    margin-bottom: 12px !important;
  }
}
</style> 