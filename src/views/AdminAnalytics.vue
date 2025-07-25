<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <h2>Аналитика</h2>
    <div v-if="isMobile">
      <div class="kpi-mobile-list">
        <div class="kpi-mobile-card">👤 Всего пользователей<br><b>{{ analytics.total_users }}</b></div>
        <div class="kpi-mobile-card">🟢 Активных<br><b>{{ analytics.active_users }}</b></div>
        <div class="kpi-mobile-card">🚫 Забанено<br><b>{{ analytics.banned_users }}</b></div>
        <div class="kpi-mobile-card">💰 Общий баланс<br><b>{{ analytics.total_balance }}</b></div>
        <div class="kpi-mobile-card">🆕 Новых за период<br><b>{{ analytics.new_users }}</b></div>
        <div class="kpi-mobile-card">💸 Сумма трат<br><b>{{ analytics.total_spend }}</b></div>
        <div class="kpi-mobile-card">💵 Сумма начислений<br><b>{{ analytics.total_reward }}</b></div>
      </div>
      <div style="max-width: 100vw; margin: 0 auto;">
        <h3>Динамика по дням</h3>
        <LineChart v-if="chartData" :chart-data="chartData" :options="chartOptions" style="max-width:100vw;" />
        <div v-else style="text-align:center; color: #888; margin-top: 40px;">Нет данных для отображения</div>
      </div>
      <div class="mobile-table-list">
        <h3>Топ-10 по тратам</h3>
        <div v-for="item in analytics.top_spenders || []" :key="item.user_id" class="table-mobile-card">
          <div><b>Фамилия:</b> {{ item.last_name }}</div>
          <div><b>Имя:</b> {{ item.first_name }}</div>
          <div><b>Сумма трат:</b> {{ item.total }}</div>
        </div>
        <h3>Топ-10 по начислениям</h3>
        <div v-for="item in analytics.top_rewarded || []" :key="item.user_id" class="table-mobile-card">
          <div><b>Фамилия:</b> {{ item.last_name }}</div>
          <div><b>Имя:</b> {{ item.first_name }}</div>
          <div><b>Сумма начислений:</b> {{ item.total }}</div>
        </div>
        <h3>Последние транзакции</h3>
        <div v-for="item in analytics.last_transactions || []" :key="item.id" class="table-mobile-card">
          <div><b>Дата:</b> {{ item.created_at }}</div>
          <div><b>Фамилия:</b> {{ item.last_name }}</div>
          <div><b>Имя:</b> {{ item.first_name }}</div>
          <div><b>Сумма:</b> {{ item.amount }}</div>
          <div><b>Причина:</b> {{ item.reason }}</div>
          <div><b>Источник:</b> {{ item.source }}</div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="kpi-row">
        <el-card class="kpi-card"><div>👤 Всего пользователей<br><b>{{ analytics.total_users }}</b></div></el-card>
        <el-card class="kpi-card"><div>🟢 Активных<br><b>{{ analytics.active_users }}</b></div></el-card>
        <el-card class="kpi-card"><div>🚫 Забанено<br><b>{{ analytics.banned_users }}</b></div></el-card>
        <el-card class="kpi-card"><div>💰 Общий баланс<br><b>{{ analytics.total_balance }}</b></div></el-card>
        <el-card class="kpi-card"><div>🆕 Новых за период<br><b>{{ analytics.new_users }}</b></div></el-card>
      </div>
      <div class="kpi-row">
        <el-card class="kpi-card"><div>💸 Сумма трат<br><b>{{ analytics.total_spend }}</b></div></el-card>
        <el-card class="kpi-card"><div>💵 Сумма начислений<br><b>{{ analytics.total_reward }}</b></div></el-card>
      </div>
      <div style="max-width: 800px; margin: 0 auto;">
        <h3>Динамика по дням</h3>
        <LineChart v-if="chartData" :chart-data="chartData" :options="chartOptions" />
        <div v-else style="text-align:center; color: #888; margin-top: 40px;">Нет данных для отображения</div>
      </div>
      <div class="tables-row">
        <div class="table-block">
          <h3>Топ-10 по тратам</h3>
          <el-table :data="analytics.top_spenders || []" size="small">
            <el-table-column prop="last_name" label="Фамилия" />
            <el-table-column prop="first_name" label="Имя" />
            <el-table-column prop="total" label="Сумма трат" />
          </el-table>
        </div>
        <div class="table-block">
          <h3>Топ-10 по начислениям</h3>
          <el-table :data="analytics.top_rewarded || []" size="small">
            <el-table-column prop="last_name" label="Фамилия" />
            <el-table-column prop="first_name" label="Имя" />
            <el-table-column prop="total" label="Сумма начислений" />
          </el-table>
        </div>
      </div>
      <div style="margin-top: 32px;">
        <h3>Последние транзакции</h3>
        <el-table :data="analytics.last_transactions || []" size="small">
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
        tension: 0.3
      },
      {
        label: 'Начисления',
        data: analytics.value.day_stats.map(d => d.reward),
        borderColor: '#27ae60',
        backgroundColor: 'rgba(39,174,96,0.1)',
        tension: 0.3
      }
    ]
  }
})
const chartOptions = {
  scales: {
    y: {
      type: 'logarithmic',
      beginAtZero: true
    }
  }
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
@media (max-width: 600px) {
  .kpi-row, .tables-row {
    flex-direction: column !important;
    gap: 10px !important;
  }
  .kpi-card {
    min-width: 0 !important;
    font-size: 1rem !important;
    padding: 10px 4vw !important;
  }
  .table-block {
    min-width: 0 !important;
    padding: 0 !important;
  }
  .el-table {
    font-size: 13px !important;
    min-width: 600px !important;
  }
  .el-table__body-wrapper {
    overflow-x: auto !important;
  }
  .el-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 12px 2vw !important;
    border-radius: 10px !important;
    box-sizing: border-box;
  }
  h2, h3 {
    font-size: 1.2rem !important;
    margin-bottom: 12px !important;
  }
  .kpi-mobile-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
  }
  .kpi-mobile-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 14px 10px;
    font-size: 16px;
    margin-bottom: 8px;
    text-align: center;
    font-weight: 700;
    color: var(--color-primary);
    border: 1.5px solid var(--color-primary);
  }
  .mobile-table-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
  }
  .table-mobile-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 12px 10px;
    font-size: 15px;
    margin-bottom: 8px;
    border: 1px solid #e0e0e0;
  }
}
</style> 