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
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  box-shadow: 0 8px 32px rgba(17, 87, 64, 0.12);
  transform: translateY(-2px);
}

.dashboard-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.dashboard-header h1 {
  color: var(--color-primary);
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 1.6rem;
  margin: 0;
  text-shadow: 0 1px 2px rgba(17, 87, 64, 0.1);
}

.balance {
  color: var(--color-primary);
  font-size: 1.1rem;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0f8f5 0%, #e0f0e7 100%);
  border-radius: 12px;
  border: 1px solid #d0e8d8;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(17, 87, 64, 0.06);
  transition: all 0.3s ease;
}

.balance:hover {
  box-shadow: 0 4px 16px rgba(17, 87, 64, 0.1);
  transform: translateY(-1px);
}

.balance b {
  color: #27ae60;
  font-size: 1.2rem;
  text-shadow: 0 1px 2px rgba(39, 174, 96, 0.2);
}

.dashboard-menu {
  font-family: 'Inter', sans-serif;
  --el-menu-bg-color: var(--color-secondary);
  --el-menu-active-color: var(--color-primary);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(17, 87, 64, 0.08);
  padding: 0;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.dashboard-menu:hover {
  box-shadow: 0 4px 20px rgba(17, 87, 64, 0.12);
}

:deep(.el-menu-item) {
  transition: all 0.3s ease !important;
  background: transparent !important;
  border-radius: 0 !important;
  margin: 0 !important;
  padding-left: 24px !important;
  padding-right: 24px !important;
  min-height: 52px !important;
  display: flex !important;
  align-items: center !important;
  font-weight: 500 !important;
  position: relative !important;
  overflow: hidden !important;
}

:deep(.el-menu-item::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, rgba(17, 87, 64, 0.1) 0%, rgba(17, 87, 64, 0.05) 100%);
  transition: width 0.3s ease;
}

:deep(.el-menu-item:hover::before) {
  width: 100%;
}

:deep(.el-menu-item:hover),
:deep(.el-menu-item:focus) {
  background: #e0f0e7 !important;
  color: #17624A !important;
  border-radius: 0 !important;
  transform: translateX(4px) !important;
  box-shadow: 0 2px 8px rgba(17, 87, 64, 0.1) !important;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #c0e2ce 0%, #b0d8c0 100%) !important;
  color: #17624A !important;
  font-weight: 700 !important;
  border-radius: 0 !important;
  box-shadow: inset 0 2px 4px rgba(17, 87, 64, 0.1) !important;
}

:deep(.el-menu-item.is-active::before) {
  width: 100%;
  background: linear-gradient(90deg, rgba(17, 87, 64, 0.15) 0%, rgba(17, 87, 64, 0.08) 100%);
}

@media (max-width: 600px) {
  .dashboard-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 16px 4vw !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    box-sizing: border-box;
  }
  
  .dashboard-card:hover {
    transform: none !important;
    box-shadow: none !important;
  }
  
  .dashboard-header {
    flex-direction: column !important;
    gap: 12px !important;
    align-items: center !important;
    text-align: center !important;
    padding-bottom: 12px !important;
  }
  
  .dashboard-header h1 {
    font-size: 1.4rem !important;
    margin-bottom: 8px !important;
  }
  
  .balance {
    font-size: 1.1rem !important;
    margin-bottom: 16px !important;
    padding: 12px 16px !important;
    border-radius: 10px !important;
  }
  
  .balance:hover {
    transform: none !important;
  }
  
  .balance b {
    font-size: 1.1rem !important;
  }
  
  .dashboard-menu {
    font-size: 18px !important;
    border-radius: 10px !important;
    width: 100% !important;
    min-width: 0 !important;
    overflow-x: auto !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 0 !important;
    box-shadow: 0 2px 8px rgba(17, 87, 64, 0.06) !important;
    padding: 0 !important;
  }
  
  .dashboard-menu:hover {
    box-shadow: 0 2px 8px rgba(17, 87, 64, 0.06) !important;
  }
  
  :deep(.el-menu-item) {
    width: 100% !important;
    min-width: 0 !important;
    font-size: 18px !important;
    padding: 18px 16px !important;
    text-align: left !important;
    min-height: 54px !important;
    border-radius: 0 !important;
  }
  
  :deep(.el-menu-item:hover) {
    transform: translateX(2px) !important;
  }
}
</style> 
</style> 