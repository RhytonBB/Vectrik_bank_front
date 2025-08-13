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
        <div class="group-details">
          <div class="group-row">
            <span class="detail-label">Название:</span>
            <span class="detail-value">{{ group.name }}</span>
          </div>
          <div class="group-row">
            <span class="detail-label">Администраторы:</span>
            <span class="detail-value">
              <div v-if="group.admins && group.admins.length" class="admins-list">
                <div v-for="admin in group.admins" :key="admin.id" class="admin-item">
                  {{ admin.first_name }} {{ admin.last_name }} (@{{ admin.telegram_username }})
                </div>
              </div>
              <span v-else class="no-admins-text">Не назначены</span>
            </span>
          </div>
        </div>
        <div class="group-status">
          <el-tag type="success" size="small">Активна</el-tag>
        </div>
        <div class="group-actions">
          <el-button 
            type="danger" 
            size="small" 
            @click.stop="deleteGroup(group)" 
            class="delete-btn"
            :loading="deletingGroupId === group.id"
            :disabled="deletingGroupId === group.id"
          >
            {{ deletingGroupId === group.id ? 'Удаление...' : 'Удалить' }}
          </el-button>
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
      <el-table-column label="Действия" width="120">
        <template #default="scope">
          <el-button 
            type="danger" 
            size="small" 
            @click="deleteGroup(scope.row)" 
            class="delete-btn"
            :loading="deletingGroupId === scope.row.id"
            :disabled="deletingGroupId === scope.row.id"
          >
            {{ deletingGroupId === scope.row.id ? 'Удаление...' : 'Удалить' }}
          </el-button>
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
          <div class="dialog-footer">
            <el-button size="small" @click="showCreate = false" class="cancel-btn">Отмена</el-button>
            <el-button type="primary" size="small" native-type="submit" class="submit-btn">Создать</el-button>
          </div>
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
const isMobile = ref(false)
const deletingGroupId = ref(null)

const fetchGroups = async () => {
  const resp = await axios.get('/admin/groups')
  const data = Array.isArray(resp.data) ? resp.data : []
  groups.value = data.map(g => ({ ...g, admins: g.admins || [] }))
}
const fetchAdmins = async () => {
  // Получаем всех пользователей и фильтруем по is_admin
  const resp = await axios.get('/admin/users')
  admins.value = resp.data.filter(u => u.is_admin)
}
const createGroup = async () => {
  if (!groupName.value) {
    error.value = 'Введите название группы'
    return
  }
  try {
    await axios.post('/admin/groups', {
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

const deleteGroup = async (group) => {
  if (confirm('Удалить группу?')) {
    deletingGroupId.value = group.id
    try {
      await axios.delete(`/admin/groups/${group.id}`)
      fetchGroups()
    } catch (e) {
      if (e.response?.data?.error) {
        error.value = `Ошибка удаления группы: ${e.response.data.error}`
      } else if (e.response?.status === 404) {
        error.value = 'Группа не найдена'
      } else if (e.response?.status === 403) {
        error.value = 'Недостаточно прав для удаления группы'
      } else {
        error.value = 'Ошибка удаления группы'
      }
    } finally {
      deletingGroupId.value = null
    }
  }
}
onMounted(() => {
  fetchGroups()
  fetchAdmins()
  isMobile.value = window.innerWidth < 600
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 600
  })
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

.delete-btn {
  font-size: 12px;
  padding: 4px 8px;
  height: 28px;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .el-button {
  min-width: 80px;
  font-size: 14px;
  padding: 8px 16px;
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
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .group-card:hover {
    box-shadow: 0 4px 20px rgba(17,87,64,0.12);
    transform: translateY(-2px);
  }
  
  .group-card:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(17,87,64,0.15);
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
  
  .group-details {
    margin-bottom: 16px;
  }
  
  .group-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 8px 0;
  }
  
  .detail-label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
  
  .detail-value {
    font-weight: 700;
    font-size: 16px;
    color: #27ae60;
  }
  
  .admins-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .admin-item {
    font-size: 14px;
    color: #333;
  }
  
  .no-admins-text {
    color: #666;
    font-style: italic;
  }
  
  .group-status {
    margin-bottom: 16px;
    text-align: center;
  }
  
  .group-actions {
    display: flex;
    justify-content: center;
  }
  
  .delete-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    border-radius: 8px;
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

  .desktop-table {
    display: none;
  }
  
  .dialog-footer {
    justify-content: center;
    gap: 8px;
  }
  
  .dialog-footer .el-button {
    min-width: 70px;
    font-size: 13px;
    padding: 6px 12px;
  }
}
</style> 