<template>
  <el-card class="transactions-card">
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    
    <div class="transactions-header">
      <h1>📊 Все транзакции</h1>
      <p class="transactions-subtitle">История всех транзакций в системе</p>
    </div>

    <div class="filters-section">
      <div class="filter-row">
        <el-input 
          v-model="searchQuery" 
          placeholder="🔍 Поиск по имени пользователя..." 
          class="search-input"
          clearable
          @input="onSearchInput"
          @focus="showSearchResults = true"
          @blur="setTimeout(() => showSearchResults = false, 200)"
        />
        <div v-if="showSearchResults && searchQuery && searchResults.length > 0" class="search-dropdown">
          <div 
            v-for="item in searchResults" 
            :key="item.id" 
            class="search-result-item"
            @click="selectSearchResult(item)"
          >
            <div class="search-user-avatar">
              <img 
                v-if="item.avatar_url"
                :src="item.avatar_url" 
                :alt="`${item.first_name} ${item.last_name}`"
                class="search-avatar-img"
              />
              <div v-else class="search-avatar-placeholder">
                <i class="el-icon-user"></i>
              </div>
            </div>
            <div class="search-user-info">
              <div class="search-user-name">{{ item.first_name }} {{ item.last_name }}</div>
              <div class="search-user-telegram">@{{ item.telegram_username }}</div>
            </div>
          </div>
        </div>
        <el-select v-model="reasonFilter" placeholder="Фильтр по основанию" class="reason-filter" clearable>
          <el-option label="Все основания" value="" />
          <el-option v-for="reason in uniqueReasons" :key="reason" :label="reason" :value="reason" />
        </el-select>
                         <el-select v-model="transactionTypeFilter" placeholder="Тип транзакций" class="transaction-type-filter" clearable>
          <el-option label="Только от админов" value="admin-only" />
          <el-option label="Все транзакции" value="all" />
          <el-option label="Только от пользователей" value="user-only" />
        </el-select>
        <el-select v-model="adminFilter" placeholder="Фильтр по админу" class="admin-filter" clearable>
          <el-option label="Все админы" value="" />
          <el-option v-for="admin in uniqueAdmins" :key="admin.id" :label="admin.name" :value="admin.id" />
        </el-select>
      </div>
      <div class="filter-row">
        <el-button type="primary" @click="resetFilters" class="reset-btn">Сбросить фильтры</el-button>
      </div>
    </div>

    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ totalTransactions }}</div>
        <div class="stat-label">Всего транзакций</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ totalAmount }}</div>
        <div class="stat-label">Общая сумма</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ uniqueUsers }}</div>
        <div class="stat-label">Уникальных пользователей</div>
      </div>
    </div>

    <div v-if="isMobile" class="mobile-transactions-list">
      <div v-for="transaction in filteredTransactions" :key="transaction.id" class="transaction-card">
        <div class="transaction-id">
          <span class="id-label">ID:</span>
          <span class="id-value">{{ transaction.id }}</span>
        </div>
        
        <div class="transaction-header">
          <div class="user-info">
            <div class="user-avatar">
              <img 
                v-if="transaction.user.avatar_url"
                :src="transaction.user.avatar_url" 
                :alt="`${transaction.user.first_name} ${transaction.user.last_name}`"
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder">
                <i class="el-icon-user"></i>
              </div>
            </div>
            <div class="user-details">
              <div class="user-name">{{ transaction.user.first_name }} {{ transaction.user.last_name }}</div>
              <div class="user-telegram">@{{ transaction.user.telegram_username }}</div>
            </div>
          </div>
          <div class="transaction-amount" :class="{ positive: transaction.amount > 0, negative: transaction.amount < 0 }">
            {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }} Вектриков
          </div>
        </div>
        
        <div class="transaction-details">
          <div class="transaction-row">
            <b>Основание:</b> {{ transaction.reason }}
          </div>
          <div class="transaction-row" v-if="transaction.context">
            <b>Комментарий:</b> {{ transaction.context }}
          </div>
          <div class="transaction-row">
            <b>Админ:</b> <span v-if="transaction.admin">{{ transaction.admin.first_name }} {{ transaction.admin.last_name }}</span><span v-else class="no-admin">—</span>
          </div>
          <div class="transaction-row">
            <b>Дата:</b> {{ formatDate(transaction.created_at) }}
          </div>
        </div>
      </div>
    </div>

    <el-table v-else :data="filteredTransactions" style="width: 100%" class="desktop-table">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="Пользователь" min-width="200">
        <template #default="scope">
          <div class="user-cell">
            <img 
              v-if="scope.row.user.avatar_url"
              :src="scope.row.user.avatar_url" 
              :alt="`${scope.row.user.first_name} ${scope.row.user.last_name}`"
              class="table-avatar"
            />
            <div v-else class="table-avatar-placeholder">
              <i class="el-icon-user"></i>
            </div>
            <div class="user-info">
              <div class="user-name">{{ scope.row.user.first_name }} {{ scope.row.user.last_name }}</div>
              <div class="user-telegram">@{{ scope.row.user.telegram_username }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="amount" label="Сумма" width="120">
        <template #default="scope">
          <span :class="{ positive: scope.row.amount > 0, negative: scope.row.amount < 0 }">
            {{ scope.row.amount > 0 ? '+' : '' }}{{ scope.row.amount }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column prop="reason" label="Основание" min-width="200" />
      
      <el-table-column prop="context" label="Комментарий" min-width="200">
        <template #default="scope">
          <span v-if="scope.row.context">{{ scope.row.context }}</span>
          <span v-else class="no-comment">—</span>
        </template>
      </el-table-column>
      
             <el-table-column label="Админ" width="150">
         <template #default="scope">
           <span v-if="scope.row.admin">{{ scope.row.admin.first_name }} {{ scope.row.admin.last_name }}</span>
           <span v-else class="no-admin">—</span>
         </template>
       </el-table-column>
      
      <el-table-column prop="created_at" label="Дата" width="120">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-section" v-if="!isMobile">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[20, 50, 100]"
        :total="totalTransactions"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const transactions = ref([])
const searchQuery = ref('')
const showSearchResults = ref(false)
const searchResults = ref([])
const selectedUserId = ref(null)

const reasonFilter = ref('')
const transactionTypeFilter = ref('admin-only') // По умолчанию только админы
const adminFilter = ref('')
// дата-фильтр удалён
const currentPage = ref(1)
const pageSize = ref(50)
const isMobile = ref(false)

const fetchTransactions = async () => {
  try {
    const resp = await axios.get('/api/admin/transactions')
    transactions.value = resp.data
  } catch (error) {
    console.error('Ошибка загрузки транзакций:', error)
  }
}

const uniqueReasons = computed(() => {
  const reasons = [...new Set(transactions.value.map(t => t.reason))]
  return reasons.sort()
})

const uniqueAdmins = computed(() => {
  const adminMap = new Map()
  transactions.value.forEach(t => {
    if (t.admin && !adminMap.has(t.admin.id)) {
      adminMap.set(t.admin.id, {
        id: t.admin.id,
        name: `${t.admin.first_name} ${t.admin.last_name}`
      })
    }
  })
  return Array.from(adminMap.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const filteredTransactions = computed(() => {
  let result = [...transactions.value]

  // Фильтр по выбранному пользователю из подсказок
  if (selectedUserId.value) {
    result = result.filter(t => t.user && t.user.id === selectedUserId.value)
  } else if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    const terms = query.split(/\s+/).filter(Boolean)
    result = result.filter(t => {
      const fn = (t.user?.first_name || '').toLowerCase()
      const ln = (t.user?.last_name || '').toLowerCase()
      const tg = (t.user?.telegram_username || '').toLowerCase()
      const full1 = `${t.user?.first_name || ''} ${t.user?.last_name || ''}`.toLowerCase().trim()
      const full2 = `${t.user?.last_name || ''} ${t.user?.first_name || ''}`.toLowerCase().trim()

      // Совпадение по одному полю
      if (fn.includes(query) || ln.includes(query) || tg.includes(query) || full1.includes(query) || full2.includes(query)) return true
      // Совпадение по всем термам в full name
      if (terms.length > 1) {
        return terms.every(ti => full1.includes(ti) || full2.includes(ti))
      }
      return false
    })
  }

  if (reasonFilter.value) {
    result = result.filter(t => t.reason === reasonFilter.value)
  }

  // Фильтр по типу транзакций
  if (transactionTypeFilter.value === 'admin-only') {
    result = result.filter(t => t.admin && t.admin.id !== null)
  } else if (transactionTypeFilter.value === 'user-only') {
    result = result.filter(t => !t.admin || t.admin.id === null)
  }
  // Если выбран конкретный админ, дополнительно фильтруем
  if (adminFilter.value) {
    result = result.filter(t => t.admin && t.admin.id === adminFilter.value)
  }

  return result
})

const totalTransactions = computed(() => filteredTransactions.value.length)
const totalAmount = computed(() => filteredTransactions.value.reduce((sum, t) => sum + t.amount, 0))
const uniqueUsers = computed(() => new Set(filteredTransactions.value.map(t => t.user.id)).size)

const onSearchInput = () => {
  currentPage.value = 1
  selectedUserId.value = null
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    searchResults.value = []
    return
  }
  // Предлагаем пользователей из всех транзакций (уникально)
  const userMap = new Map()
  transactions.value.forEach(t => {
    const u = t.user
    if (!u) return
    const match = (
      u.first_name?.toLowerCase().includes(query) ||
      u.last_name?.toLowerCase().includes(query) ||
      u.telegram_username?.toLowerCase().includes(query) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(query) ||
      `${u.last_name} ${u.first_name}`.toLowerCase().includes(query)
    )
    if (match && !userMap.has(u.id)) {
      userMap.set(u.id, {
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        telegram_username: u.telegram_username,
        avatar_url: u.avatar_url || null,
      })
    }
  })
  searchResults.value = Array.from(userMap.values()).slice(0, 8)
}

const selectSearchResult = (user) => {
  selectedUserId.value = user.id
  searchQuery.value = `${user.first_name} ${user.last_name}`
  showSearchResults.value = false
}

// обработчик изменения даты удалён

const resetFilters = () => {
  searchQuery.value = ''
  selectedUserId.value = null
  reasonFilter.value = ''
  transactionTypeFilter.value = 'admin-only' // Возвращаем к фильтру только админы
  adminFilter.value = ''
  // сброс диапазона дат не требуется
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchTransactions()
  isMobile.value = window.innerWidth < 600
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 600
  })
})
</script>

<style scoped>
.transactions-card {
  max-width: 1200px;
  margin: 40px auto;
  padding: 32px 24px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(17, 87, 64, 0.08);
  border: 2px solid var(--color-primary);
  font-family: 'Inter', sans-serif;
}

.transactions-header {
  margin-bottom: 32px;
  text-align: center;
}

.transactions-header h1 {
  color: var(--color-primary);
  font-weight: 800;
  margin: 0 0 8px 0;
  font-size: 2rem;
}

.transactions-subtitle {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
}

.filters-section { position: relative; }
.search-dropdown {
  position: absolute;
  top: 76px;
  left: 24px;
  right: 24px;
  max-height: 300px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}
.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.search-result-item:hover { background-color: #f0f0f0; }
.search-user-avatar { flex-shrink: 0; margin-right: 12px; }
.search-avatar-img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid #e0e0e0; }
.search-avatar-placeholder { width: 36px; height: 36px; border-radius: 50%; background: #f0f0f0; color: #999; display:flex; align-items:center; justify-content:center; }
.search-user-info { min-width: 0; overflow: hidden; }
.search-user-name { font-weight: 600; font-size: 14px; color: var(--color-primary); }
.search-user-telegram { font-size: 12px; color: #666; }

.filter-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.search-input, .reason-filter, .transaction-type-filter, .admin-filter {
  min-width: 200px;
  flex: 1;
}

.reset-btn {
  height: 40px;
  padding: 0 20px;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: linear-gradient(135deg, #f0f8f5 0%, #e0f0e7 100%);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  border: 1px solid #d0e8d8;
  box-shadow: 0 2px 8px rgba(17, 87, 64, 0.06);
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  font-weight: 600;
}

.mobile-transactions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.transaction-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: relative;
}

.transaction-id {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #f0f8f5 0%, #e0f0e7 100%);
  border: 1px solid #d0e8d8;
  border-radius: 8px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.id-label {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
}

.id-value {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
  font-family: 'Courier New', monospace;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-img, .avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.avatar-placeholder {
  background: #f0f0f0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 700;
  font-size: 16px;
  color: var(--color-primary);
}

.user-telegram {
  font-size: 14px;
  color: #666;
}

.transaction-amount {
  font-weight: 800;
  font-size: 18px;
}

.transaction-amount.positive {
  color: #27ae60;
}

.transaction-amount.negative {
  color: #e74c3c;
}

.transaction-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transaction-row {
  display: flex;
  gap: 8px;
  font-size: 14px;
  line-height: 1.4;
}

.transaction-row b {
  color: #666;
  min-width: 100px;
  flex-shrink: 0;
}

.desktop-table {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.desktop-table :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.desktop-table :deep(.el-table__row:hover) {
  background-color: #e0f0e7 !important;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-avatar, .table-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.table-avatar-placeholder {
  background: #f0f0f0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-primary);
}

.user-telegram {
  font-size: 12px;
  color: #666;
}

.positive {
  color: #27ae60;
  font-weight: 600;
}

.negative {
  color: #e74c3c;
  font-weight: 600;
}

.no-comment, .no-admin {
  color: #aaa;
  font-style: italic;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 600px) {
  .transactions-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 16px 4vw !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    border: 1px solid var(--color-primary) !important;
  }
  
  .transactions-header h1 {
    font-size: 1.6rem !important;
  }
  
  .filters-section {
    padding: 16px !important;
    border-radius: 10px !important;
    overflow: hidden;
  }
  
  .filter-row {
    flex-direction: column !important;
    gap: 12px !important;
    width: 100% !important;
  }
  
  .search-input, .reason-filter, .transaction-type-filter, .admin-filter {
    width: 100% !important;
    min-width: 0 !important;
  }

  .reset-btn {
    width: 100% !important;
    max-width: 260px !important;
    margin: 0 auto !important;
    display: block !important;
  }
  
  .stats-section {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
  
  .stat-card {
    padding: 20px !important;
  }
  
  .transaction-card {
    padding: 16px !important;
    border-radius: 10px !important;
  }
  
  .transaction-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 12px !important;
  }
  
  .user-info {
    width: 100% !important;
  }
  
  .transaction-amount {
    align-self: flex-end !important;
  }
  
  .transaction-id {
    position: static !important;
    margin-bottom: 12px !important;
    align-self: flex-start !important;
    width: fit-content !important;
  }
  
  .id-label, .id-value {
    font-size: 10px !important;
  }
}
</style>
