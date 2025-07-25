<template>
  <el-card>
    <div class="header">
      <h2>Группы</h2>
      <el-button type="primary" @click="showCreate = true">➕ Создать группу</el-button>
    </div>
    <el-table :data="groups" style="width: 100%; margin-bottom: 24px;">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="Название группы" />
      <el-table-column label="Админы">
        <template #default="scope">
          <span v-if="scope.row.admins && scope.row.admins.length">
            {{ scope.row.admins.map(a => a.first_name + ' ' + a.last_name).join(', ') }}
          </span>
          <span v-else style="color:#aaa">—</span>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="showCreate" title="Создать группу" width="400px">
      <el-form @submit.prevent="createGroup">
        <el-form-item label="Название группы">
          <el-input v-model="groupName" required />
        </el-form-item>
        <el-form-item label="Админы">
          <el-checkbox-group v-model="selectedAdmins">
            <el-checkbox v-for="a in admins" :key="a.id" :label="a.id">
              {{ a.first_name }} {{ a.last_name }} ({{ a.telegram_username }})
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">Создать</el-button>
          <el-button @click="showCreate = false">Отмена</el-button>
        </el-form-item>
      </el-form>
      <el-alert v-if="error" :title="error" type="error" show-icon closable @close="error = ''" />
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const groups = ref([])
const admins = ref([])
const showCreate = ref(false)
const groupName = ref('')
const selectedAdmins = ref([])
const error = ref('')

const fetchGroups = async () => {
  const resp = await axios.get('/api/admin/groups')
  const data = Array.isArray(resp.data) ? resp.data : []
  groups.value = data.map(g => ({ ...g, admins: g.admins || [] }))
}
const fetchAdmins = async () => {
  // Получаем всех пользователей и фильтруем по is_admin
  const resp = await axios.get('/api/admin/users')
  admins.value = resp.data.filter(u => u.is_admin)
}
const createGroup = async () => {
  if (!groupName.value) {
    error.value = 'Введите название группы'
    return
  }
  try {
    await axios.post('/api/admin/groups', {
      name: groupName.value,
      admin_ids: selectedAdmins.value
    })
    showCreate.value = false
    groupName.value = ''
    selectedAdmins.value = []
    error.value = ''
    fetchGroups()
  } catch (e) {
    error.value = 'Ошибка создания группы'
  }
}
onMounted(() => {
  fetchGroups()
  fetchAdmins()
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
@media (max-width: 600px) {
  .el-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 12px 2vw !important;
    border-radius: 10px !important;
    box-sizing: border-box;
  }
  .header {
    flex-direction: column !important;
    gap: 8px !important;
    align-items: stretch !important;
  }
  h2 {
    font-size: 1.2rem !important;
    margin-bottom: 12px !important;
  }
  .el-table {
    font-size: 13px !important;
    min-width: 600px !important;
  }
  .el-table__body-wrapper {
    overflow-x: auto !important;
  }
  .el-dialog {
    width: 98vw !important;
    min-width: 0 !important;
    padding: 0 !important;
  }
  .el-form, .el-form-item, .el-button {
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box;
    font-size: 16px !important;
  }
}
</style> 