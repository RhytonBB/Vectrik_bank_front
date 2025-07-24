<template>
  <el-card>
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <h2>Аналитика</h2>
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
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import LineChart from '@/components/LineChart.vue'

const analytics = ref({})
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

onMounted(fetchAnalytics)
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
}
</style> 