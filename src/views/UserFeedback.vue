<template>
  <el-card class="feedback-card">
    <el-button type="primary" @click="$router.push('/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <div class="feedback-header">
      <h2>💬 Обратная связь</h2>
    </div>
    
    <div class="feedback-content">
      <p>Здесь вы можете оставить отзыв или сообщить о проблеме.</p>
      <p>Функция находится в разработке.</p>
    </div>
    
    <div class="feedback-actions">
      <el-button type="primary" @click="$router.push('/dashboard')" class="back-btn">
        Вернуться в меню
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { useUserTheme } from '@/composables/useUserTheme.js'
useUserTheme()
</script>

<style scoped>
.feedback-card {
  max-width: 480px;
  margin: 40px auto;
  padding: 32px 24px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(17, 87, 64, 0.08);
  border: 2px solid var(--color-primary);
  font-family: 'Inter', sans-serif;
}

.feedback-header {
  margin-bottom: 24px;
  text-align: center;
}

.feedback-header h2 {
  color: var(--color-primary);
  font-weight: 800;
  margin: 0;
  font-size: 1.6rem;
}

.feedback-content {
  text-align: center;
  margin-bottom: 32px;
}

.feedback-content p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 16px;
}

.feedback-actions {
  display: flex;
  justify-content: center;
}

.back-btn {
  transition: all 0.3s ease;
  border-radius: 10px;
  font-weight: 600;
  height: 48px;
  font-size: 16px;
  padding: 0 32px;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17,87,64,0.15);
}

@media (max-width: 600px) {
  .feedback-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 20px 4vw !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    box-sizing: border-box;
  }
  
  .feedback-header h2 {
    font-size: 1.4rem !important;
  }
  
  .feedback-content p {
    font-size: 16px !important;
  }
  
  .back-btn {
    width: 100% !important;
    height: 52px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
}
</style>
