<template>
  <el-card class="user-dashboard-card">
    <div class="dashboard-header">
      <AppLogo />
      <h1>Личный кабинет</h1>
    </div>
    <p class="balance">Ваш баланс: <b>{{ balance }}</b> Вектриков</p>
    <el-menu class="dashboard-menu" :default-active="activeMenu" router>
      <el-menu-item index="/user/points">🏅 Мои баллы</el-menu-item>
      <el-menu-item index="/user/rewards">🎁 Мои награды</el-menu-item>
      <el-menu-item index="/user/purchases">🛒 Мои покупки</el-menu-item>
      <el-menu-item @click="logout" index="logout">🚪 Выйти</el-menu-item>
    </el-menu>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AppLogo from '@/components/AppLogo.vue'
import { useUserTheme } from '@/composables/useUserTheme.js'

const balance = ref(0)
const router = useRouter()
const activeMenu = ref('')

useUserTheme()

const fetchBalance = async () => {
  try {
    const resp = await axios.get('/api/admin/balance', { withCredentials: true })
    balance.value = resp.data.balance
  } catch (err) {
    balance.value = 'Ошибка'
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
.user-dashboard-card {
  max-width: 480px;
  margin: 40px auto;
  padding: 32px 24px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(17, 87, 64, 0.08);
  border: 2px solid var(--color-primary);
  font-family: 'Inter', sans-serif;
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
  overflow: hidden;
  box-shadow: none;
  padding: 0;
}

:deep(.el-menu-item) {
  transition: background 0.2s, color 0.2s;
  background: transparent !important;
  border-radius: 0 !important;
  margin: 0 !important;
  padding-left: 24px !important;
  padding-right: 24px !important;
  min-height: 48px !important;
  display: flex;
  align-items: center;
}

:deep(.el-menu-item:hover),
:deep(.el-menu-item:focus) {
  background: #e0f0e7 !important;
  color: #17624A !important;
  border-radius: 0 !important;
}

:deep(.el-menu-item.is-active) {
  background: #c0e2ce !important;
  color: #17624A !important;
  font-weight: 700;
  border-radius: 0 !important;
}

@media (max-width: 600px) {
  .user-dashboard-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 16px 4vw !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    box-sizing: border-box;
  }
  .dashboard-header {
    flex-direction: column !important;
    gap: 12px !important;
    align-items: center !important;
    text-align: center !important;
  }
  .dashboard-header h1 {
    font-size: 1.4rem !important;
    margin-bottom: 8px !important;
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
    box-shadow: none !important;
    padding: 0 !important;
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
  .balance {
    font-size: 1.1rem !important;
    margin-bottom: 16px !important;
    text-align: center !important;
  }
}
</style> 