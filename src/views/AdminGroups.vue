<template>
  <el-card>
    <div class="header">
      <h2>👥 Управление группами</h2>
      <el-button type="primary" @click="showCreate = true" class="create-btn">➕ Создать группу</el-button>
    </div>
    <div v-if="isMobile" class="mobile-group-list">
      <div v-for="group in groups" :key="group.id" class="group-card">
        <div class="group-header">
          <div class="group-name">{{ group.name }}</div>
          <div class="group-id">ID: {{ group.id }}</div>
        </div>
        <div class="group-admins">
          <div class="admins-label">Администраторы:</div>
          <div v-if="group.admins && group.admins.length" class="admins-list">
            <div v-for="admin in group.admins" :key="admin.id" class="admin-item">
              <div class="admin-name">{{ admin.first_name }} {{ admin.last_name }}</div>
              <div class="admin-telegram">@{{ admin.telegram_username }}</div>
            </div>
          </div>
          <div v-else class="no-admins">
            <span class="no-admins-text">Администраторы не назначены</span>
          </div>
        </div>
      </div>
    </div>
    <el-table v-else :data="groups" style="width: 100%; margin-bottom: 24px;" class="desktop-table">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="Название группы" />
      <el-table-column label="Администраторы" min-width="300">
        <template #default="scope">
          <div v-if="scope.row.admins && scope.row.admins.length" class="admins-table">
            <div v-for="admin in scope.row.admins" :key="admin.id" class="admin-table-item">
              <span class="admin-table-name">{{ admin.first_name }} {{ admin.last_name }}</span>
              <span class="admin-table-telegram">@{{ admin.telegram_username }}</span>
            </div>
          </div>
          <span v-else class="no-admins-table">Администраторы не назначены</span>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="showCreate" title="Создать группу" width="400px" class="create-dialog">
      <el-form @submit.prevent="createGroup" class="create-form">
        <el-form-item label="Название группы" required>
          <el-input v-model="groupName" placeholder="Введите название группы" />
        </el-form-item>
        <el-form-item label="Администраторы">
          <el-checkbox-group v-model="selectedAdmins" class="admins-checkbox-group">
            <el-checkbox v-for="a in admins" :key="a.id" :label="a.id" class="admin-checkbox">
              <div class="admin-checkbox-info">
                <div class="admin-checkbox-name">{{ a.first_name }} {{ a.last_name }}</div>
                <div class="admin-checkbox-telegram">@{{ a.telegram_username }}</div>
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item class="form-actions">
          <el-button type="primary" native-type="submit" class="submit-btn">Создать</el-button>
          <el-button @click="showCreate = false" class="cancel-btn">Отмена</el-button>
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
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  color: var(--color-primary);
}

.create-btn {
  height: 40px;
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

.admins-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-table-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.admin-table-name {
  font-weight: 500;
  color: var(--color-primary);
}

.admin-table-telegram {
  font-size: 12px;
  color: #666;
}

.no-admins-table {
  color: #aaa;
  font-style: italic;
}

.create-dialog {
  border-radius: 12px;
}

.create-form {
  padding: 16px 0;
}

.admins-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.admin-checkbox {
  width: 100%;
}

.admin-checkbox :deep(.el-checkbox__label) {
  width: 100%;
}

.admin-checkbox-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-checkbox-name {
  font-weight: 500;
  color: var(--color-primary);
}

.admin-checkbox-telegram {
  font-size: 12px;
  color: #666;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.submit-btn, .cancel-btn {
  min-width: 100px;
  height: 40px;
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
    flex-direction: column !important;
    gap: 16px !important;
    align-items: stretch !important;
    margin-bottom: 20px !important;
  }
  
  .header h2 {
    font-size: 1.4rem !important;
    text-align: center !important;
  }
  
  .create-btn {
    width: 100% !important;
    height: 48px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .mobile-group-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .group-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(17,87,64,0.08);
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
  }
  
  .group-card:hover {
    box-shadow: 0 4px 20px rgba(17,87,64,0.12);
    transform: translateY(-2px);
  }
  
  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .group-name {
    font-weight: 700;
    font-size: 18px;
    color: var(--color-primary);
  }
  
  .group-id {
    font-size: 14px;
    color: #666;
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 6px;
  }
  
  .group-admins {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .admins-label {
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }
  
  .admins-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .admin-item {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 12px;
    border: 1px solid #e0e0e0;
  }
  
  .admin-name {
    font-weight: 600;
    font-size: 16px;
    color: var(--color-primary);
    margin-bottom: 4px;
  }
  
  .admin-telegram {
    font-size: 14px;
    color: #666;
  }
  
  .no-admins {
    padding: 16px;
    background: #f8f9fa;
    border: 2px dashed #ddd;
    border-radius: 8px;
    text-align: center;
  }
  
  .no-admins-text {
    color: #666;
    font-style: italic;
  }
  
  .create-dialog {
    width: 95vw !important;
    max-width: none !important;
    border-radius: 12px !important;
  }
  
  .create-form {
    padding: 0 !important;
  }
  
  .el-form-item {
    width: 100% !important;
    margin-bottom: 16px !important;
  }
  
  .el-input, .el-button {
    width: 100% !important;
    font-size: 16px !important;
  }
  
  .admins-checkbox-group {
    max-height: 150px !important;
  }
  
  .admin-checkbox-name {
    font-size: 16px !important;
  }
  
  .admin-checkbox-telegram {
    font-size: 14px !important;
  }
  
  .form-actions {
    flex-direction: column !important;
    gap: 12px !important;
  }
  
  .submit-btn, .cancel-btn {
    width: 100% !important;
    height: 48px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .el-alert {
    font-size: 16px !important;
    margin-top: 16px !important;
    border-radius: 8px !important;
  }
}
</style> 