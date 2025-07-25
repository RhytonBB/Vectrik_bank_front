<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/users')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <el-tabs v-model="activeTab" class="custom-tabs">
      <el-tab-pane label="Профиль" name="profile">
        <el-form :model="editForm" label-width="120px" @submit.prevent="saveProfile">
          <el-form-item label="Имя">
            <el-input v-model="editForm.first_name" />
          </el-form-item>
          <el-form-item label="Фамилия">
            <el-input v-model="editForm.last_name" />
          </el-form-item>
          <el-form-item label="Telegram">
            <el-input v-model="editForm.telegram_username" />
          </el-form-item>
          <el-form-item label="Логин">
            <el-input v-model="editForm.login" />
          </el-form-item>
          <el-form-item label="Пароль (новый)">
            <el-input v-model="editForm.password" type="password" autocomplete="new-password" />
          </el-form-item>
          <el-form-item label="Группа">
            <el-select v-model="editForm.group_id" placeholder="Выберите группу" clearable>
              <el-option v-for="g in groups" :key="g.id" :label="g.name" :value="g.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveProfile">Сохранить</el-button>
          </el-form-item>
        </el-form>
        <el-divider />
        <el-descriptions :title="user ? (user.first_name + ' ' + user.last_name) : ''" :column="2" v-if="user">
          <el-descriptions-item label="ID">{{ user.id }}</el-descriptions-item>
          <el-descriptions-item label="Активен">
            <el-switch v-model="user.is_active" @change="toggleActive" />
          </el-descriptions-item>
          <el-descriptions-item label="Админ">
            <el-switch v-model="user.is_admin" @change="toggleAdmin" />
          </el-descriptions-item>
          <el-descriptions-item label="Забанен">
            <el-tag :type="user.is_banned ? 'danger' : 'success'">
              {{ user.is_banned ? 'Да' : 'Нет' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <el-button type="danger" @click="banUser" v-if="user && !user.is_banned">Забанить</el-button>
        <el-button type="success" @click="unbanUser" v-if="user && user.is_banned">Разбанить</el-button>
      </el-tab-pane>
      <el-tab-pane label="Корректировка баланса" name="balance">
        <el-form :model="balanceForm" label-width="120px" @submit.prevent="adjustBalance">
          <el-form-item label="Сумма (+/-)">
            <el-input-number v-model="balanceForm.amount" :min="-1000000" :max="1000000" />
          </el-form-item>
          <el-form-item label="Комментарий">
            <el-input v-model="balanceForm.context" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="adjustBalance">Скорректировать</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Удаление" name="delete">
        <el-alert type="warning" title="Внимание!" description="Удаление пользователя необратимо. Все связанные данные будут потеряны." show-icon />
        <el-button type="danger" @click="confirmDelete" style="margin-top: 24px;">Удалить пользователя</el-button>
      </el-tab-pane>
    </el-tabs>
    <el-alert v-if="message" :title="message" type="success" show-icon closable @close="message = ''" />
    <el-alert v-if="error" :title="error" type="error" show-icon closable @close="error = ''" />
    <div v-if="!user">
      <el-alert title="Пользователь не найден или ошибка загрузки" type="error" show-icon />
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const user = ref(null)
const activeTab = ref('profile')
const message = ref('')
const error = ref('')
const groups = ref([])

const editForm = ref({
  first_name: '',
  last_name: '',
  telegram_username: '',
  login: '',
  password: '',
  group_id: null
})
const balanceForm = ref({
  amount: 0,
  context: ''
})

const fetchGroups = async () => {
  const resp = await axios.get('/api/admin/groups')
  groups.value = resp.data
}

const fetchUser = async () => {
  const resp = await axios.get(`/api/admin/users/${route.params.id}`)
  user.value = resp.data
  editForm.value.first_name = user.value.first_name
  editForm.value.last_name = user.value.last_name
  editForm.value.telegram_username = user.value.telegram_username
  editForm.value.login = user.value.login || ''
  editForm.value.password = ''
  editForm.value.group_id = user.value.group_id || null
}

const saveProfile = async () => {
  try {
    await axios.put(`/api/admin/users/${user.value.id}`, {
      first_name: editForm.value.first_name,
      last_name: editForm.value.last_name,
      telegram_username: editForm.value.telegram_username,
      login: editForm.value.login,
      password: editForm.value.password ? editForm.value.password : undefined,
      group_id: editForm.value.group_id
    })
    message.value = 'Данные пользователя обновлены'
    error.value = ''
    fetchUser()
  } catch (e) {
    error.value = 'Ошибка обновления профиля'
  }
}

const adjustBalance = async () => {
  if (!balanceForm.value.amount) {
    error.value = 'Введите сумму корректировки'
    return
  }
  try {
    await axios.post('/api/admin/users/adjust_balance', {
      user_id: user.value.id,
      amount: balanceForm.value.amount,
      context: balanceForm.value.context
    })
    message.value = 'Баланс скорректирован'
    error.value = ''
    balanceForm.value.amount = 0
    balanceForm.value.context = ''
    fetchUser()
  } catch (e) {
    error.value = 'Ошибка корректировки баланса'
  }
}

const toggleActive = async () => {
  await axios.post(`/api/admin/users/${user.value.id}/activate`, { is_active: user.value.is_active })
}

const toggleAdmin = async () => {
  await axios.post(`/api/admin/users/${user.value.id}/admin`, { is_admin: user.value.is_admin })
}

const banUser = async () => {
  await axios.post(`/api/admin/users/${user.value.id}/ban`)
  fetchUser()
}

const unbanUser = async () => {
  await axios.post(`/api/admin/users/${user.value.id}/unban`)
  fetchUser()
}

const confirmDelete = async () => {
  try {
    await ElMessageBox.confirm(
      'Вы уверены, что хотите удалить пользователя? Это действие необратимо.',
      'Подтверждение удаления',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning',
      }
    )
    await axios.delete(`/api/admin/users/${user.value.id}`)
    message.value = 'Пользователь удалён'
    setTimeout(() => router.push('/admin/users'), 1200)
  } catch (e) {
    if (e !== 'cancel') error.value = 'Ошибка удаления пользователя'
  }
}

onMounted(() => {
  fetchUser()
  fetchGroups()
})
</script>

<style scoped>
.custom-tabs >>> .el-tabs__item.is-active {
  color: #17624A !important;
  font-weight: 700;
}
.custom-tabs >>> .el-tabs__active-bar {
  background-color: #17624A !important;
}
.custom-tabs >>> .el-tabs__item:hover {
  color: #17624A !important;
  background: transparent !important;
}
@media (max-width: 600px) {
  .el-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 12px 2vw !important;
    border-radius: 10px !important;
    box-sizing: border-box;
  }
  .el-form, .el-form-item, .el-button {
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box;
    font-size: 16px !important;
  }
  .el-descriptions {
    font-size: 13px !important;
    min-width: 600px !important;
    overflow-x: auto !important;
  }
  .el-tabs__nav {
    flex-wrap: wrap !important;
  }
  .el-tabs {
    font-size: 15px !important;
  }
  .el-divider {
    margin: 10px 0 !important;
  }
  .el-alert {
    font-size: 15px !important;
  }
}
</style> 