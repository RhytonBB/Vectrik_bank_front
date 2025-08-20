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
        <div class="search-section">
          <el-input 
            v-model="searchQuery" 
            placeholder="🔍 Поиск пользователей..." 
            class="search-input"
            clearable
            @input="onSearchInput"
            @focus="showSearchResults = true"
            @blur="setTimeout(() => showSearchResults = false, 200)"
          />
          <div v-if="showSearchResults && searchQuery && searchResults.length > 0" class="search-dropdown">
            <div 
              v-for="user in searchResults" 
              :key="user.id" 
              class="search-result-item"
              @click="selectSearchResult(user)"
            >
              <div class="search-user-avatar">
                <img 
                  v-if="user.avatar_url"
                  :src="user.avatar_url" 
                  :alt="`${user.first_name} ${user.last_name}`"
                  class="search-avatar-img"
                />
                <div v-else class="search-avatar-placeholder">
                  <i class="el-icon-user"></i>
                </div>
              </div>
              <div class="search-user-info">
                <div class="search-user-name">{{ user.last_name }} {{ user.first_name }}</div>
                <div class="search-user-telegram">@{{ user.telegram_username }}</div>
                <div class="search-user-group" v-if="user.group">{{ user.group.name }}</div>
              </div>
            </div>
          </div>
        </div>
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
        <div v-if="sortFilter === 'all_groups'" class="group-headers">
          <div v-for="group in getGroupedUsers()" :key="group.id || 'no-group'" class="group-section">
            <div class="group-header">
              <h3 v-if="group.id">{{ group.name }}</h3>
              <h3 v-else class="no-group-header">Без группы</h3>
            </div>
            <div v-for="user in group.users" :key="user.id" class="user-card" @click="goToUser(user)">
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
        </div>
        <div v-else>
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
      </div>
      <el-table v-else-if="sortFilter !== 'all_groups'" :data="filteredUsers" style="width: 100%" @row-click="goToUser" class="desktop-table">
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
      
      <!-- Группированное отображение для фильтра "Все группы" -->
      <div v-if="sortFilter === 'all_groups'" class="desktop-grouped-view">
        <div v-for="group in getGroupedUsers()" :key="group.id || 'no-group'" class="group-section-desktop">
          <div class="group-header-desktop">
            <h3 v-if="group.id">{{ group.name }}</h3>
            <h3 v-else class="no-group-header">Без группы</h3>
          </div>
          <el-table :data="group.users" style="width: 100%" @row-click="goToUser" class="group-table">
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
      </div>
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
const searchQuery = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)

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
    // Группируем пользователей по группам, сортируем группы по ID, пользователей по имени
    result.sort((a, b) => {
      // Сначала сортируем по group_id (группы без ID идут в конец)
      if (a.group_id === null && b.group_id !== null) return 1
      if (a.group_id !== null && b.group_id === null) return -1
      if (a.group_id === null && b.group_id === null) {
        // Если оба без группы, сортируем по имени
        return a.first_name.localeCompare(b.first_name, 'ru')
      }
      if (a.group_id !== b.group_id) {
        // Если разные группы, сортируем по ID группы
        return a.group_id - b.group_id
      }
      // Если одна группа, сортируем по имени
      return a.first_name.localeCompare(b.first_name, 'ru')
    })
  } else if (sortFilter.value.startsWith('group_')) {
    const groupID = parseInt(sortFilter.value.replace('group_', ''))
    result = result.filter(user => user.group_id === groupID)
    // Сортируем пользователей в группе по имени
    result.sort((a, b) => a.first_name.localeCompare(b.first_name, 'ru'))
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

const getGroupedUsers = () => {
  if (sortFilter.value !== 'all_groups') {
    return [];
  }

  const groupedUsers = {};
  
  // Сначала добавляем пользователей без группы
  groupedUsers['no-group'] = {
    id: null,
    name: 'Без группы',
    users: []
  };
  
  // Добавляем пользователей по группам
  users.value.forEach(user => {
    if (user.group_id === null) {
      groupedUsers['no-group'].users.push(user);
    } else {
      const groupKey = `group-${user.group_id}`;
      if (!groupedUsers[groupKey]) {
        groupedUsers[groupKey] = {
          id: user.group_id,
          name: user.group ? user.group.name : `Группа ${user.group_id}`,
          users: []
        };
      }
      groupedUsers[groupKey].users.push(user);
    }
  });

  // Сортируем пользователей внутри каждой группы по имени
  Object.values(groupedUsers).forEach(group => {
    group.users.sort((a, b) => a.first_name.localeCompare(b.first_name, 'ru'));
  });

  // Конвертируем в массив и сортируем группы по ID (группы без ID идут в конец)
  return Object.values(groupedUsers).sort((a, b) => {
    if (a.id === null && b.id !== null) return 1;
    if (a.id !== null && b.id === null) return -1;
    if (a.id === null && b.id === null) return 0;
    return a.id - b.id;
  });
};

const onSearchInput = () => {
  if (searchQuery.value.trim() === '') {
    searchResults.value = [];
    return;
  }
  
  const query = searchQuery.value.toLowerCase().trim();
  searchResults.value = users.value.filter(user => 
    user.first_name.toLowerCase().includes(query) ||
    user.last_name.toLowerCase().includes(query) ||
    user.telegram_username.toLowerCase().includes(query) ||
    (user.group && user.group.name.toLowerCase().includes(query))
  ).slice(0, 8); // Ограничиваем до 8 результатов
};

const selectSearchResult = (user) => {
  searchQuery.value = '';
  searchResults.value = [];
  showSearchResults.value = false;
  goToUser(user);
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

.search-section {
  position: relative;
  width: 100%;
  max-width: 300px;
}

.search-input {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.search-input:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17,87,64,0.15);
}

.search-input :deep(.el-input__inner) {
  border-radius: 10px;
  border: 2px solid var(--color-primary);
  font-weight: 600;
}

.search-input :deep(.el-input__inner:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(23, 98, 74, 0.2);
}

.search-dropdown {
  position: absolute;
  top: 100%; /* Position below the search input */
  left: 0;
  width: 100%;
  max-height: 300px; /* Limit height for dropdown */
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 10;
  margin-top: 8px;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background-color: #f0f9eb; /* Light green background on hover */
}

.search-user-avatar {
  flex-shrink: 0;
  margin-right: 12px;
}

.search-avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary);
}

.search-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.search-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.search-user-name {
  font-weight: 700;
  font-size: 16px;
  color: var(--color-primary);
}

.search-user-telegram {
  font-size: 14px;
  color: #666;
  margin-top: 2px;
}

.search-user-group {
  font-size: 14px;
  color: #666;
  margin-top: 2px;
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

.group-headers {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.group-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.group-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.group-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.no-group-header {
  color: #aaa;
  font-style: italic;
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

.desktop-grouped-view {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-section-desktop {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.group-header-desktop {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.group-header-desktop h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.group-table {
  border-radius: 8px;
  overflow: hidden;
}

.group-table :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.group-table :deep(.el-table__row:hover) {
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
  
  .search-section {
    max-width: none !important;
    width: 100% !important;
    margin-bottom: 16px !important;
  }
  
  .search-input {
    width: 100% !important;
    height: 48px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .search-input :deep(.el-input__inner) {
    font-size: 18px !important;
    height: 48px !important;
    border-radius: 10px !important;
  }
  
  .search-dropdown {
    max-height: 250px !important;
    margin-top: 4px !important;
  }
  
  .search-result-item {
    padding: 16px 20px !important;
  }
  
  .search-avatar-img, .search-avatar-placeholder {
    width: 45px !important;
    height: 45px !important;
  }
  
  .search-user-name {
    font-size: 18px !important;
  }
  
  .search-user-telegram, .search-user-group {
    font-size: 16px !important;
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
  
  .group-headers {
    gap: 12px !important;
  }
  
  .group-section {
    padding: 12px !important;
    border-radius: 8px !important;
  }
  
  .group-header h3 {
    font-size: 16px !important;
  }
  
  .mobile-user-list {
    gap: 12px !important;
  }
  
  .user-card {
    padding: 16px 12px !important;
    border-radius: 8px !important;
  }
  
  .user-header {
    gap: 12px !important;
  }
  
  .avatar-img {
    width: 45px !important;
    height: 45px !important;
  }
  
  .user-name {
    font-size: 16px !important;
  }
  
  .user-balance {
    font-size: 14px !important;
  }
  
  .user-row {
    font-size: 14px !important;
  }
  
  .user-status .el-tag {
    font-size: 11px !important;
    padding: 3px 6px !important;
  }
}
</style> 