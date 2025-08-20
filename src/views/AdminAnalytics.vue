<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <h2>Аналитика</h2>
    <div v-if="isMobile">
      <div class="kpi-mobile-grid">
        <div class="kpi-mobile-card primary">
          <div class="kpi-icon">👤</div>
          <div class="kpi-content">
            <div class="kpi-label">Всего пользователей</div>
            <div class="kpi-value">{{ analytics.total_users }}</div>
          </div>
        </div>
        <div class="kpi-mobile-card warning">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <div class="kpi-label">Общий баланс</div>
            <div class="kpi-value">{{ analytics.total_balance }}</div>
          </div>
        </div>
        <div class="kpi-mobile-card danger">
          <div class="kpi-icon">💸</div>
          <div class="kpi-content">
            <div class="kpi-label">Сумма трат</div>
            <div class="kpi-value">{{ analytics.total_spend }}</div>
          </div>
        </div>
        <div class="kpi-mobile-card success">
          <div class="kpi-icon">💵</div>
          <div class="kpi-content">
            <div class="kpi-label">Сумма начислений</div>
            <div class="kpi-value">{{ analytics.total_reward }}</div>
          </div>
        </div>
      </div>
      <div class="chart-section">
        <h3>Динамика по дням</h3>
        <div class="chart-container">
          <LineChart v-if="chartData" :chart-data="chartData" :options="chartOptions" />
          <div v-else class="no-data">
            <div class="no-data-icon">📊</div>
            <div class="no-data-text">Нет данных для отображения</div>
          </div>
        </div>
      </div>
      <div class="mobile-table-list">
        <div class="table-section">
          <h3>Топ-10 по тратам</h3>
          <div v-for="(item, index) in analytics.top_spenders || []" :key="item.user_id" class="table-mobile-card">
            <div class="rank-badge">{{ index + 1 }}</div>
            <div class="table-content">
              <div class="user-info">
                <div class="user-name">{{ item.last_name }} {{ item.first_name }}</div>
                <div class="user-detail">ID: {{ item.user_id }}</div>
              </div>
              <div class="amount-info">
                <div class="amount">{{ item.total }}</div>
                <div class="amount-label">Вектриков</div>
              </div>
            </div>
          </div>
        </div>
        <div class="table-section">
          <h3>Топ-10 по балансу</h3>
          <div v-for="(item, index) in analytics.top_balance || []" :key="item.user_id" class="table-mobile-card">
            <div class="rank-badge success">{{ index + 1 }}</div>
            <div class="table-content">
              <div class="user-info">
                <div class="user-name">{{ item.last_name }} {{ item.first_name }}</div>
                <div class="user-detail">ID: {{ item.user_id }}</div>
              </div>
              <div class="amount-info">
                <div class="amount success">{{ item.total }}</div>
                <div class="amount-label">Вектриков</div>
              </div>
            </div>
          </div>
        </div>
        <div class="table-section">
          <h3>Последние транзакции</h3>
          <div v-for="item in analytics.last_transactions || []" :key="item.id" class="table-mobile-card transaction">
            <div class="transaction-header">
              <div class="transaction-date">{{ formatDate(item.created_at) }}</div>
              <div class="transaction-amount" :class="item.amount > 0 ? 'positive' : 'negative'">
                {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
              </div>
            </div>
            <div class="transaction-details">
              <div class="user-name">{{ item.last_name }} {{ item.first_name }}</div>
              <div class="transaction-reason">{{ item.reason }}</div>
              <div class="transaction-source">{{ item.source }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="kpi-row">
        <el-card class="kpi-card primary">
          <div class="kpi-content">
            <div class="kpi-icon">👤</div>
            <div class="kpi-text">
              <div class="kpi-label">Всего пользователей</div>
              <div class="kpi-value">{{ analytics.total_users }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="kpi-card warning">
          <div class="kpi-content">
            <div class="kpi-icon">💰</div>
            <div class="kpi-text">
              <div class="kpi-label">Общий баланс</div>
              <div class="kpi-value">{{ analytics.total_balance }}</div>
            </div>
          </div>
        </el-card>
      </div>
      <div class="kpi-row">
        <el-card class="kpi-card danger">
          <div class="kpi-content">
            <div class="kpi-icon">💸</div>
            <div class="kpi-text">
              <div class="kpi-label">Сумма трат</div>
              <div class="kpi-value">{{ analytics.total_spend }}</div>
            </div>
          </div>
        </el-card>
        <el-card class="kpi-card success">
          <div class="kpi-content">
            <div class="kpi-icon">💵</div>
            <div class="kpi-text">
              <div class="kpi-label">Сумма начислений</div>
              <div class="kpi-value">{{ analytics.total_reward }}</div>
            </div>
          </div>
        </el-card>
      </div>
      <div class="chart-section">
        <h3>Динамика по дням</h3>
        <div class="chart-container">
          <LineChart v-if="chartData" :chart-data="chartData" :options="chartOptions" />
          <div v-else class="no-data">
            <div class="no-data-icon">📊</div>
            <div class="no-data-text">Нет данных для отображения</div>
          </div>
        </div>
      </div>
      <div class="tables-row">
        <div class="table-block">
          <h3>Топ-10 по тратам</h3>
          <el-table :data="analytics.top_spenders || []" size="small" class="analytics-table">
            <el-table-column prop="last_name" label="Фамилия" />
            <el-table-column prop="first_name" label="Имя" />
            <el-table-column prop="total" label="Сумма трат" />
          </el-table>
        </div>
        <div class="table-block">
          <h3>Топ-10 по балансу</h3>
          <el-table :data="analytics.top_balance || []" size="small" class="analytics-table">
            <el-table-column prop="last_name" label="Фамилия" />
            <el-table-column prop="first_name" label="Имя" />
            <el-table-column prop="total" label="Баланс" />
          </el-table>
        </div>
      </div>
      <div class="transactions-section">
        <h3>Последние транзакции</h3>
        <el-table :data="analytics.last_transactions || []" size="small" class="analytics-table">
          <el-table-column prop="created_at" label="Дата" />
          <el-table-column prop="last_name" label="Фамилия" />
          <el-table-column prop="first_name" label="Имя" />
          <el-table-column prop="amount" label="Сумма" />
          <el-table-column prop="reason" label="Причина" />
          <el-table-column prop="source" label="Источник" />
        </el-table>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import LineChart from '@/components/LineChart.vue'

const analytics = ref({})
const isMobile = ref(false)
const chartData = computed(() => {
  if (!analytics.value.day_stats) return null
  return {
    labels: analytics.value.day_stats.map(d => d.date),
    datasets: [
      {
        label: 'Траты',
        data: analytics.value.day_stats.map(d => -d.spend),
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231,76,60,0.1)',
        tension: 0.3,
        yAxisID: 'y'
      },
      {
        label: 'Начисления',
        data: analytics.value.day_stats.map(d => d.reward),
        borderColor: '#27ae60',
        backgroundColor: 'rgba(39,174,96,0.1)',
        tension: 0.3,
        yAxisID: 'y'
      },
      {
        label: 'Количество покупок',
        data: analytics.value.day_stats.map(d => d.purchase_count),
        borderColor: '#f39c12',
        backgroundColor: 'rgba(243,156,18,0.1)',
        tension: 0.3,
        yAxisID: 'y1',
        type: 'bar'
      }
    ]
  }
})
const chartOptions = {
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Дата'
      }
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Сумма (Вектрики)'
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'Количество операций'
      },
      grid: {
        drawOnChartArea: false,
      },
    }
  },
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Динамика финансовых операций'
    }
  }
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

const fetchAnalytics = async () => {
  const resp = await axios.get('/api/admin/analytics')
  analytics.value = resp.data
}

onMounted(() => {
  fetchAnalytics()
  isMobile.value = window.innerWidth < 600
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 600
  })
})
</script>

<style scoped>
.kpi-row {
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.kpi-card {
  min-width: 150px;
  text-align: center;
  font-size: 1.1rem;
  font-family: 'Inter', sans-serif;
  background: #f8f9fa;
  border: 1.5px solid var(--color-primary);
  color: var(--color-primary);
  font-weight: 700;
  transition: all 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(17,87,64,0.15);
}

.kpi-card.primary {
  border-color: #17624A;
  background: linear-gradient(135deg, #f0f8f5 0%, #e0f0e7 100%);
}

.kpi-card.success {
  border-color: #27ae60;
  background: linear-gradient(135deg, #f0f9f4 0%, #e0f5e8 100%);
}

.kpi-card.danger {
  border-color: #e74c3c;
  background: linear-gradient(135deg, #fef5f5 0%, #fde8e8 100%);
}

.kpi-card.warning {
  border-color: #f39c12;
  background: linear-gradient(135deg, #fefbf0 0%, #fdf4e0 100%);
}

.kpi-card.info {
  border-color: #3498db;
  background: linear-gradient(135deg, #f0f8ff 0%, #e0f0ff 100%);
}

.kpi-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
}

.kpi-icon {
  font-size: 24px;
}

.kpi-text {
  text-align: left;
}

.kpi-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 1.4rem;
  font-weight: 800;
}

.tables-row {
  display: flex;
  gap: 32px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.table-block {
  flex: 1 1 300px;
  min-width: 280px;
}

.analytics-table {
  border-radius: 8px;
  overflow: hidden;
}

.analytics-table :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.analytics-table :deep(.el-table__row:hover) {
  background-color: #e0f0e7 !important;
}

.chart-section {
  margin: 32px 0;
}

.chart-container {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(17,87,64,0.08);
  border: 1px solid #e0e0e0;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-data-text {
  font-size: 16px;
  color: #666;
}

.transactions-section {
  margin-top: 32px;
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
  
  h2, h3 {
    font-size: 1.4rem !important;
    margin-bottom: 16px !important;
    color: var(--color-primary);
  }
  
  .kpi-mobile-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .kpi-mobile-card {
    background: #ffffff;
    border-radius: 10px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(17,87,64,0.08);
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
    min-height: 90px;
    display: flex;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
  }
  
  .kpi-mobile-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(17,87,64,0.12);
  }
  
  .kpi-mobile-card.primary {
    border-left: 4px solid #17624A;
  }
  
  .kpi-mobile-card.success {
    border-left: 4px solid #27ae60;
  }
  
  .kpi-mobile-card.danger {
    border-left: 4px solid #e74c3c;
  }
  
  .kpi-mobile-card.warning {
    border-left: 4px solid #f39c12;
  }
  
  .kpi-mobile-card.info {
    border-left: 4px solid #3498db;
  }
  
  .kpi-content {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    justify-content: space-between;
  }
  
  .kpi-icon {
    font-size: 18px;
    flex-shrink: 0;
  }
  
  .kpi-label {
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
    line-height: 1.3;
  }
  
  .kpi-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-primary);
    line-height: 1.2;
  }
  
  .chart-section {
    margin: 24px 0;
  }
  
  .chart-container {
    padding: 16px;
    border-radius: 10px;
  }
  
  .mobile-table-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .table-section h3 {
    margin-bottom: 16px;
    color: var(--color-primary);
  }
  
  .table-mobile-card {
    background: #ffffff;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(17,87,64,0.06);
    border: 1px solid #f0f0f0;
    transition: all 0.3s ease;
  }
  
  .table-mobile-card:hover {
    box-shadow: 0 4px 12px rgba(17,87,64,0.1);
  }
  
  .table-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .rank-badge {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #17624A;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    margin-right: 12px;
  }
  
  .rank-badge.success {
    background: #27ae60;
  }
  
  .user-info {
    flex: 1;
  }
  
  .user-name {
    font-weight: 600;
    font-size: 16px;
    color: var(--color-primary);
    margin-bottom: 4px;
  }
  
  .user-detail {
    font-size: 12px;
    color: #666;
  }
  
  .amount-info {
    text-align: right;
  }
  
  .amount {
    font-weight: 700;
    font-size: 18px;
    color: #e74c3c;
  }
  
  .amount.success {
    color: #27ae60;
  }
  
  .amount-label {
    font-size: 12px;
    color: #666;
  }
  
  .transaction {
    padding: 20px 16px;
  }
  
  .transaction-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .transaction-date {
    font-size: 14px;
    color: #666;
  }
  
  .transaction-amount {
    font-weight: 700;
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
    gap: 4px;
  }
  
  .transaction-reason {
    font-size: 14px;
    color: #333;
  }
  
  .transaction-source {
    font-size: 12px;
    color: #666;
  }
}
</style> 