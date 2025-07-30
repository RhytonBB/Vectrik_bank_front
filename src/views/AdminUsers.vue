<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <el-tabs v-model="activeTab" @tab-click="handleTabChange" class="custom-tabs">
      <el-tab-pane label="Пользователи" name="users" />
      <el-tab-pane label="Группы" name="groups" />
    </el-tabs>
    <div v-if="activeTab === 'users'">
      <div class="header">
        <el-button type="primary" @click="goToRegister" class="primary-button">➕ Зарегистрировать нового пользователя</el-button>
        <div class="sort-buttons">
          <el-button type="primary" @click="sortByBalanceDesc" class="sort-button">Сортировать по балансу ↓</el-button>
          <el-button type="primary" @click="sortByBalanceAsc" class="sort-button">Сортировать по балансу ↑</el-button>
          <el-button type="primary" @click="sortByLastNameAZ" class="sort-button">Фамилия А-Я</el-button>
          <el-button type="primary" @click="sortByLastNameZA" class="sort-button">Фамилия Я-А</el-button>
        </div>
      </div>
      <div v-if="isMobile" class="mobile-user-list">
        <div v-for="user in users" :key="user.id" class="user-card" @click="goToUser(user)">
          <div class="user-header">
            <div class="user-name">{{ user.last_name }} {{ user.first_name }}</div>
            <div class="user-balance">{{ user.balance }} Вектриков</div>
          </div>
          <div class="user-details">
            <div class="user-row"><b>ID:</b> {{ user.id }}</div>
            <div class="user-row"><b>Telegram:</b> @{{ user.telegram_username }}</div>
            <div class="user-row"><b>Группа:</b> <span v-if="user.group">{{ user.group.name }}</span><span v-else class="no-group">—</span></div>
          </div>
          <div class="user-status">
            <el-tag :type="user.is_active ? 'success' : 'danger'" size="small">{{ user.is_active ? 'Активен' : 'Неактивен' }}</el-tag>
            <el-tag :type="user.is_admin ? 'warning' : 'info'" size="small">{{ user.is_admin ? 'Админ' : 'Пользователь' }}</el-tag>
          </div>
        </div>
      </div>
      <el-table v-else :data="users" style="width: 100%" @row-click="goToUser" class="desktop-table">
        <el-table-column prop="id" label="ID" width="60"/>
        <el-table-column label="Фамилия Имя">
          <template #default="scope">
            {{ scope.row.last_name }} {{ scope.row.first_name }}
          </template>
        </el-table-column>
        <el-table-column prop="telegram_username" label="Telegram"/>
        <el-table-column prop="group.name" label="Группа" width="180">
          <template #default="scope">
            <span v-if="scope.row.group">{{ scope.row.group.name }}</span>
            <span v-else style="color:#aaa">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="Вектриков" width="120"/>
        <el-table-column prop="is_active" label="Активен" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'danger'">
              {{ scope.row.is_active ? 'Да' : 'Нет' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_admin" label="Админ" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_admin ? 'success' : 'info'">
              {{ scope.row.is_admin ? 'Да' : 'Нет' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <AdminGroups />
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AdminGroups from './AdminGroups.vue'

const users = ref([])
const router = useRouter()
const activeTab = ref('users')
const isMobile = ref(false)

const fetchUsers = async () => {
  const resp = await axios.get('/api/admin/users')
  users.value = resp.data
}

const goToUser = (row) => {
  router.push(`/admin/users/${row.id}`)
}

const goToRegister = () => {
  router.push('/admin/users/register')
}

const sortByBalanceDesc = () => {
  users.value = [...users.value].sort((a, b) => b.balance - a.balance)
}
const sortByBalanceAsc = () => {
  users.value = [...users.value].sort((a, b) => a.balance - b.balance)
}
const sortByLastNameAZ = () => {
  users.value = [...users.value].sort((a, b) => a.last_name.localeCompare(b.last_name, 'ru'))
}
const sortByLastNameZA = () => {
  users.value = [...users.value].sort((a, b) => b.last_name.localeCompare(a.last_name, 'ru'))
}

const handleTabChange = () => {}

onMounted(() => {
  fetchUsers()
  isMobile.value = window.innerWidth < 600
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 600
  })
})
</script>

<style scoped>
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

.header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.sort-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sort-button {
  flex: 1;
  min-width: 140px;
}

.primary-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.desktop-table {
  border-radius: 8px;
  overflow: hidden;
}

.desktop-table :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.desktop-table :deep(.el-table__row:hover) {
  background-color: #e0f0e7 !important;
}

@media (max-width: 600px) {
  .el-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 16px 4vw !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    box-sizing: border-box;
  }
  
  .header {
    margin-bottom: 20px !important;
  }
  
  .sort-buttons {
    flex-direction: column !important;
    gap: 10px !important;
  }
  
  .sort-button {
    width: 100% !important;
    min-width: 0 !important;
    font-size: 16px !important;
    height: 44px !important;
    border-radius: 8px !important;
  }
  
  .primary-button {
    height: 52px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .mobile-user-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
  }
  
  .user-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px 16px;
    box-shadow: 0 2px 12px rgba(17,87,64,0.08);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid #e0e0e0;
  }
  
  .user-card:hover {
    box-shadow: 0 4px 20px rgba(17,87,64,0.12);
    transform: translateY(-2px);
  }
  
  .user-card:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(17,87,64,0.15);
  }
  
  .user-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .user-name {
    font-weight: 700;
    font-size: 18px;
    color: var(--color-primary);
  }
  
  .user-balance {
    font-weight: 600;
    color: #27ae60;
    font-size: 16px;
  }
  
  .user-details {
    margin-bottom: 12px;
  }
  
  .user-row {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
  }
  
  .user-row b {
    color: #666;
    min-width: 80px;
  }
  
  .no-group {
    color: #aaa;
    font-style: italic;
  }
  
  .user-status {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .user-status .el-tag {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .el-tabs {
    margin-bottom: 20px;
  }
  
  .el-tabs :deep(.el-tabs__nav-wrap) {
    padding: 0;
  }
  
  .el-tabs :deep(.el-tabs__item) {
    font-size: 16px;
    padding: 12px 16px;
  }
}
</style> 