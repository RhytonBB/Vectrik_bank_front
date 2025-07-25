<template>
  <el-card class="theme-card">
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <h2>Тема для пользователей</h2>
    <div style="margin-bottom: 24px;">
      <span>Текущая тема: </span>
      <el-tag :type="theme === 'pink' ? 'danger' : 'success'">
        {{ theme === 'pink' ? 'Розовая (#ff4dbb)' : 'Зелёная' }}
      </el-tag>
    </div>
    <el-radio-group v-model="theme" @change="changeTheme">
      <el-radio-button label="green">Зелёная (по умолчанию)</el-radio-button>
      <el-radio-button label="pink">Розовая (#ff4dbb)</el-radio-button>
    </el-radio-group>
    <el-alert v-if="message" :title="message" type="success" show-icon closable @close="message = ''" style="margin-top: 24px;" />
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const theme = ref('green')
const message = ref('')

const fetchTheme = async () => {
  const resp = await axios.get('/api/admin/theme')
  theme.value = resp.data.theme
}

const changeTheme = async () => {
  await axios.post('/api/admin/theme', { theme: theme.value })
  message.value = 'Тема успешно изменена!'
}

onMounted(fetchTheme)
</script>

<style scoped>
.theme-card {
  max-width: 480px;
  margin: 40px auto;
  padding: 32px 24px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(17, 87, 64, 0.08);
  border: 2px solid var(--color-primary);
  font-family: 'Inter', sans-serif;
}
h2 {
  color: var(--color-primary);
  font-weight: 800;
  margin-bottom: 24px;
}
@media (max-width: 600px) {
  .theme-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 14px 2vw !important;
    border-radius: 10px !important;
    box-shadow: none !important;
    box-sizing: border-box;
  }
  h2 {
    font-size: 1.3rem !important;
    margin-bottom: 14px !important;
  }
  .el-form, .el-form-item, .el-button, .el-radio-group, .el-radio-button {
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box;
    font-size: 18px !important;
    margin-bottom: 10px !important;
  }
  .el-radio-group {
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
  }
  .el-alert {
    font-size: 16px !important;
    margin-bottom: 10px !important;
    border-radius: 8px !important;
  }
}
</style> 