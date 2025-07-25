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
        <el-button type="primary" @click="goToRegister">➕ Зарегистрировать нового пользователя</el-button>
        <el-button type="primary" @click="sortByBalanceDesc">Сортировать по балансу ↓</el-button>
        <el-button type="primary" @click="sortByBalanceAsc">Сортировать по балансу ↑</el-button>
        <el-button type="primary" @click="sortByLastNameAZ">Фамилия А-Я</el-button>
        <el-button type="primary" @click="sortByLastNameZA">Фамилия Я-А</el-button>
      </div>
      <div v-if="isMobile" class="mobile-user-list">
        <div v-for="user in users" :key="user.id" class="user-card" @click="goToUser(user)">
          <div class="user-row"><b>ID:</b> {{ user.id }}</div>
          <div class="user-row"><b>ФИО:</b> {{ user.last_name }} {{ user.first_name }}</div>
          <div class="user-row"><b>Telegram:</b> {{ user.telegram_username }}</div>
          <div class="user-row"><b>Группа:</b> <span v-if="user.group">{{ user.group.name }}</span><span v-else style="color:#aaa">—</span></div>
          <div class="user-row"><b>Вектриков:</b> {{ user.balance }}</div>
          <div class="user-row"><b>Активен:</b> <el-tag :type="user.is_active ? 'success' : 'danger'">{{ user.is_active ? 'Да' : 'Нет' }}</el-tag></div>
          <div class="user-row"><b>Админ:</b> <el-tag :type="user.is_admin ? 'success' : 'info'">{{ user.is_admin ? 'Да' : 'Нет' }}</el-tag></div>
        </div>
      </div>
      <el-table v-else :data="users" style="width: 100%" @row-click="goToUser">
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
@media (max-width: 600px) {
  .el-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 12px 2vw !important;
    border-radius: 10px !important;
    box-shadow: none !important;
    box-sizing: border-box;
  }
  .header {
    flex-direction: column !important;
    gap: 14px !important;
    align-items: stretch !important;
    margin-bottom: 16px !important;
  }
  .el-button {
    width: 100% !important;
    min-width: 0 !important;
    font-size: 18px !important;
    margin-bottom: 8px !important;
    border-radius: 8px !important;
    height: 48px !important;
  }
  .mobile-user-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 10px;
  }
  .user-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px 12px;
    box-shadow: 0 2px 8px rgba(17,87,64,0.04);
    font-size: 16px;
    cursor: pointer;
    transition: box-shadow 0.2s;
  }
  .user-card:active {
    box-shadow: 0 4px 16px rgba(17,87,64,0.10);
  }
  .user-row {
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  h2 {
    font-size: 1.3rem !important;
    margin-bottom: 10px !important;
  }
}
</style> 