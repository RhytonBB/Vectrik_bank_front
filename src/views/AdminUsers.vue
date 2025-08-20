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
        <el-button type="primary" @click="goToRegister" class="register-button">➕ Зарегистрировать пользователя</el-button>
        <div class="filter-section">
          <el-select v-model="sortFilter" placeholder="Сортировка и фильтры" class="filter-select">
            <el-option label="По умолчанию" value="default" />
            <el-option label="💰 Баланс ↓ (высокий)" value="balance_desc" />
            <el-option label="💰 Баланс ↑ (низкий)" value="balance_asc" />
            <el-option label="📝 Фамилия А-Я" value="lastname_az" />
            <el-option label="📝 Фамилия Я-А" value="lastname_za" />
            <el-option label="👥 Все группы" value="all_groups" />
            <el-option v-for="group in groups" :key="group.id" :label="`👥 ${group.name} (${getGroupUserCount(group.id)})`" :value="`group_${group.id}`" />
          </el-select>
          <div v-if="sortFilter !== 'default'" class="filter-status">
            Показано: {{ filteredUsers.length }} из {{ users.length }} пользователей
          </div>
        </div>
      </div>
      <div v-if="isMobile" class="mobile-user-list">
        <div v-for="user in filteredUsers" :key="user.id" class="user-card" @click="goToUser(user)">
          <div class="user-header">
            <div class="user-avatar">
              <img 
                :src="user.avatar_url || '/default-avatar.png'" 
                :alt="`${user.first_name} ${user.last_name}`"
                class="avatar-img"
              />
            </div>
            <div class="user-info-main">
              <div class="user-name">{{ user.last_name }} {{ user.first_name }}</div>
              <div class="user-balance">{{ user.balance }} Вектриков</div>
            </div>
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
      <el-table v-else :data="filteredUsers" style="width: 100%" @row-click="goToUser" class="desktop-table">
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
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AdminGroups from './AdminGroups.vue'

const users = ref([])
const groups = ref([])
const router = useRouter()
const activeTab = ref('users')
const isMobile = ref(false)
const sortFilter = ref('default')
const filteredUsers = ref([])

const fetchUsers = async () => {
  const resp = await axios.get('/api/admin/users')
  users.value = resp.data
  applyFilters()
}

const fetchGroups = async () => {
  try {
    const resp = await axios.get('/api/admin/groups')
    groups.value = resp.data
  } catch (error) {
    console.error('Ошибка загрузки групп:', error)
  }
}

const applyFilters = () => {
  let result = [...users.value]
  
  if (sortFilter.value === 'default') {
    // По умолчанию сортируем по имени
    result.sort((a, b) => a.first_name.localeCompare(b.first_name, 'ru'))
  } else if (sortFilter.value === 'balance_desc') {
    result.sort((a, b) => b.balance - a.balance)
  } else if (sortFilter.value === 'balance_asc') {
    result.sort((a, b) => a.balance - b.balance)
  } else if (sortFilter.value === 'lastname_az') {
    result.sort((a, b) => a.last_name.localeCompare(b.last_name, 'ru'))
  } else if (sortFilter.value === 'lastname_za') {
    result.sort((a, b) => b.last_name.localeCompare(a.last_name, 'ru'))
  } else if (sortFilter.value === 'all_groups') {
    // Показываем всех пользователей (уже загружено)
  } else if (sortFilter.value.startsWith('group_')) {
    const groupID = parseInt(sortFilter.value.replace('group_', ''))
    result = result.filter(user => user.group_id === groupID)
  }
  
  filteredUsers.value = result
}

// Следим за изменением фильтра
watch(sortFilter, applyFilters)

const goToUser = (row) => {
  router.push(`/admin/users/${row.id}`)
}

const goToRegister = () => {
  router.push('/admin/users/register')
}

const handleTabChange = () => {}

const getGroupUserCount = (groupId) => {
  return users.value.filter(user => user.group_id === groupId).length;
};

onMounted(() => {
  fetchUsers()
  fetchGroups()
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

.filter-section {
  width: 100%;
  max-width: 300px;
}

.filter-select {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.filter-select:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17,87,64,0.15);
}

.filter-select :deep(.el-input__inner) {
  border-radius: 10px;
  border: 2px solid var(--color-primary);
  font-weight: 600;
}

.filter-select :deep(.el-input__inner:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(23, 98, 74, 0.2);
}

.filter-select :deep(.el-select-dropdown__item) {
  padding: 12px 16px;
  font-size: 14px;
}

.filter-select :deep(.el-select-dropdown__item.selected) {
  background-color: var(--color-primary);
  color: white;
}

.filter-select :deep(.el-select-dropdown__item:hover) {
  background-color: rgba(23, 98, 74, 0.1);
}

.sort-button {
  flex: 1;
  min-width: 140px;
  height: 40px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sort-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17,87,64,0.15);
}

.register-button {
  width: auto;
  max-width: 300px;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17,87,64,0.15);
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

.filter-status {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  text-align: right;
}

@media (max-width: 600px) {
  .el-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 16px 4vw !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    box-sizing: border-box;
    border: 1px solid var(--color-primary) !important;
  }
  
  .header {
    margin-bottom: 20px !important;
  }
  
  .register-button {
    width: 100% !important;
    max-width: none !important;
    height: 48px !important;
    font-size: 14px !important;
    border-radius: 10px !important;
    align-self: stretch !important;
  }
  
  .filter-section {
    max-width: none !important;
    width: 100% !important;
  }

  .filter-select {
    width: 100% !important;
    height: 48px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .filter-select :deep(.el-input__inner) {
    font-size: 18px !important;
    height: 48px !important;
    border-radius: 10px !important;
  }
  
  .filter-select :deep(.el-select-dropdown__item) {
    padding: 16px 20px !important;
    font-size: 16px !important;
  }
  
  .filter-status {
    font-size: 16px !important;
    text-align: center !important;
    margin-top: 12px !important;
  }
  
  .register-button:hover {
    transform: none !important;
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
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .user-avatar {
    flex-shrink: 0;
  }
  
  .avatar-img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--color-primary);
  }
  
  .user-info-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
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