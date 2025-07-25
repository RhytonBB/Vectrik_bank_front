<template>
  <el-card class="reward-card">
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <h1>💸 Начисление Вектриков</h1>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="Моя группа" name="group"></el-tab-pane>
      <el-tab-pane label="Общий список" name="all"></el-tab-pane>
    </el-tabs>
    <el-form :inline="true" @submit.prevent="searchUsers">
      <el-form-item label="Поиск пользователей:">
        <el-input v-model="query" placeholder="Имя, фамилия или логин" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">Искать</el-button>
      </el-form-item>
    </el-form>
    <el-form @submit.prevent="sendReward">
      <h3>Пользователи:</h3>
      <div v-if="users.length">
        <el-checkbox-group v-model="selectedUsers">
          <el-checkbox v-for="u in users" :key="u.id" :value="u.id">
            {{ u.first_name }} {{ u.last_name }} ({{ u.telegram_username }})
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div v-else>
        <p>Пользователи не найдены</p>
      </div>
      <el-form-item label="Причина:">
        <el-select v-model="reason" placeholder="Выберите причину" required @change="onReasonChange">
          <el-option v-for="r in reasons" :key="r.value" :label="r.label" :value="r.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="Сумма (Вектрики):">
        <el-input-number v-model="amount" :min="1" required />
      </el-form-item>
      <el-form-item label="Комментарий (необязательно):">
        <el-input v-model="context" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">Начислить</el-button>
      </el-form-item>
    </el-form>
    <el-alert v-if="message" :title="message" type="success" show-icon closable @close="message = ''" />
    <el-alert v-if="error" :title="error" type="error" show-icon closable @close="error = ''" />
  </el-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const activeTab = ref('all')
const query = ref('')
const users = ref([])
const selectedUsers = ref([])
const amount = ref(0)
const reason = ref('')
const context = ref('')
const message = ref('')
const error = ref('')

const reasons = [
  { label: '+5 за активность в группе Вектора', value: '+5 за активность в группе Вектора', amount: 5 },
  { label: '+10 за отличный вопрос или активность на блоке', value: '+10 за отличный вопрос или активность на блоке', amount: 10 },
  { label: '+15 за конструктивную ОС', value: '+15 за конструктивную ОС', amount: 15 },
  { label: '+20 за участие в задании на ИС по своей инициативе', value: '+20 за участие в задании на ИС по своей инициативе', amount: 20 },
  { label: '+25 за отличную игротехнику', value: '+25 за отличную игротехнику', amount: 25 },
  { label: '+30 за победу в соревнованиях', value: '+30 за победу в соревнованиях', amount: 30 },
  { label: '+35 за что-то внезапное, креативное и хорошее', value: '+35 за что-то внезапное, креативное и хорошее', amount: 35 },
  { label: '+40 за преодоление себя', value: '+40 за преодоление себя', amount: 40 },
  { label: '+50 за высокий результат на экзамене', value: '+50 за высокий результат на экзамене', amount: 50 },
  { label: '+245 за прохождение вузовской Школы кураторов', value: '+245 за прохождение вузовской Школы кураторов', amount: 245 }
]

const fetchUsers = async () => {
  try {
    const resp = await axios.get('/api/admin/reward/users', {
      params: { scope: activeTab.value, q: query.value }
    })
    users.value = resp.data
  } catch (e) {
    error.value = 'Ошибка поиска пользователей'
  }
}

const searchUsers = fetchUsers

watch(activeTab, fetchUsers)

const onReasonChange = (val) => {
  const found = reasons.find(r => r.value === val)
  if (found) amount.value = found.amount
}

const sendReward = async () => {
  try {
    await axios.post('/api/admin/reward', {
      user_ids: selectedUsers.value,
      amount: amount.value,
      reason: reason.value,
      context: context.value
    })
    message.value = 'Начисление успешно!'
    error.value = ''
  } catch (e) {
    error.value = 'Ошибка начисления'
  }
}

onMounted(fetchUsers)
</script>

<style scoped>
.reward-card {
  max-width: 600px;
  margin: 40px auto;
  padding: 32px 24px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(17, 87, 64, 0.08);
  border: 2px solid var(--color-primary);
  font-family: 'Inter', sans-serif;
}
h1 {
  color: var(--color-primary);
  font-weight: 800;
  margin-bottom: 24px;
}
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
  .reward-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 12px 2vw !important;
    border-radius: 10px !important;
    box-sizing: border-box;
  }
  h1 {
    font-size: 1.2rem !important;
    margin-bottom: 12px !important;
  }
  .el-form, .el-form-item, .el-button {
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box;
    font-size: 16px !important;
  }
  .el-checkbox-group {
    flex-direction: column !important;
    gap: 10px !important;
  }
  .el-select, .el-input, .el-input-number {
    width: 100% !important;
    min-width: 0 !important;
    font-size: 16px !important;
  }
  .el-alert {
    font-size: 15px !important;
  }
}
</style> 