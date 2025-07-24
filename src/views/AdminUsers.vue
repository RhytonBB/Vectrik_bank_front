<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <el-tab-pane label="Пользователи" name="users" />
      <el-tab-pane label="Группы" name="groups" />
    </el-tabs>
    <div v-if="activeTab === 'users'">
      <div class="header">
        <h2>Пользователи</h2>
        <el-button type="primary" @click="goToRegister">➕ Зарегистрировать нового пользователя</el-button>
        <el-button type="primary" @click="sortByBalanceDesc">Сортировать по балансу ↓</el-button>
        <el-button type="primary" @click="sortByBalanceAsc">Сортировать по балансу ↑</el-button>
        <el-button type="primary" @click="sortByLastNameAZ">Фамилия А-Я</el-button>
        <el-button type="primary" @click="sortByLastNameZA">Фамилия Я-А</el-button>
      </div>
      <el-table :data="users" style="width: 100%" @row-click="goToUser">
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

const handleTabChange = () => {
  // Можно добавить логику, если нужно
}

onMounted(fetchUsers)
</script>

<style scoped>
:deep(.el-tabs__item.is-active) {
  color: #17624A !important;
  font-weight: 700;
}
:deep(.el-tabs__active-bar) {
  background-color: #17624A !important;
}
:deep(.el-tabs__item:hover) {
  color: #17624A !important;
  background: transparent !important;
}
@media (max-width: 600px) {
  .header {
    flex-direction: column !important;
    gap: 8px !important;
    align-items: stretch !important;
  }
  .el-table {
    font-size: 13px !important;
    min-width: 600px !important;
  }
  .el-table__body-wrapper {
    overflow-x: auto !important;
  }
}
</style> 