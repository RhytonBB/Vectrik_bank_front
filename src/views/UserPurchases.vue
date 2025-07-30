<template>
  <el-card class="user-dashboard-card">
    <el-button type="primary" @click="$router.push('/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <h2>Мои покупки</h2>
    <p>Здесь будет информация о ваших покупках. <br> <el-button type="primary" @click="$router.push('/dashboard')">Вернуться в меню</el-button></p>
  </el-card>
</template>

<script setup>
import { useUserTheme } from '@/composables/useUserTheme.js'
useUserTheme()
</script>

<style scoped>
.user-dashboard-card {
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
  text-align: center;
}

p {
  text-align: center;
  line-height: 1.6;
  margin-bottom: 24px;
  color: #666;
}

.el-button {
  transition: all 0.3s ease;
  border-radius: 10px;
  font-weight: 600;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17,87,64,0.15);
}

@media (max-width: 600px) {
  .user-dashboard-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 20px 4vw !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    box-sizing: border-box;
  }
  h2 {
    font-size: 1.4rem !important;
    margin-bottom: 16px !important;
  }
  
  p {
    font-size: 16px !important;
    margin-bottom: 20px !important;
  }
  
  .el-button {
    width: 100% !important;
    height: 48px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
}
</style> 