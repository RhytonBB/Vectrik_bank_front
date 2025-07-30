<template>
  <el-card class="theme-card">
    <el-button type="primary" @click="$router.push('/admin/dashboard')" style="margin-bottom: 18px;">
      <i class="el-icon-arrow-left" style="margin-right: 6px;"></i>Назад
    </el-button>
    <div class="theme-header">
      <h2>🎨 Настройка темы для пользователей</h2>
    </div>
    
    <div class="current-theme-section">
      <h3>Текущая тема</h3>
      <div class="theme-display">
        <div class="theme-preview" :class="theme">
          <div class="theme-color"></div>
          <div class="theme-info">
            <div class="theme-name">{{ getThemeName(theme) }}</div>
            <div class="theme-color-code">{{ getThemeColor(theme) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="theme-selection-section">
      <h3>Выберите тему</h3>
      <div class="theme-options">
        <div 
          v-for="themeOption in themeOptions" 
          :key="themeOption.value"
          class="theme-option"
          :class="{ active: theme === themeOption.value }"
          @click="selectTheme(themeOption.value)"
        >
          <div class="option-preview" :style="{ backgroundColor: themeOption.color }"></div>
          <div class="option-info">
            <div class="option-name">{{ themeOption.name }}</div>
            <div class="option-color">{{ themeOption.color }}</div>
          </div>
          <div v-if="theme === themeOption.value" class="option-check">
            <i class="el-icon-check"></i>
          </div>
        </div>
      </div>
    </div>
    
    <div class="theme-actions">
      <el-button type="primary" @click="changeTheme" class="apply-btn">
        Применить тему
      </el-button>
    </div>
    
    <el-alert v-if="message" :title="message" type="success" show-icon closable @close="message = ''" class="success-alert" />
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const theme = ref('green')
const message = ref('')

const themeOptions = [
  { value: 'green', name: 'Зелёная (по умолчанию)', color: '#17624A' },
  { value: 'pink', name: 'Розовая', color: '#ff4dbb' }
]

const getThemeName = (themeValue) => {
  const option = themeOptions.find(t => t.value === themeValue)
  return option ? option.name : 'Неизвестная тема'
}

const getThemeColor = (themeValue) => {
  const option = themeOptions.find(t => t.value === themeValue)
  return option ? option.color : '#000000'
}

const selectTheme = (themeValue) => {
  theme.value = themeValue
}

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
  max-width: 600px;
  margin: 40px auto;
  padding: 32px 24px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(17, 87, 64, 0.08);
  border: 2px solid var(--color-primary);
  font-family: 'Inter', sans-serif;
}

.theme-header {
  margin-bottom: 32px;
}

.theme-header h2 {
  color: var(--color-primary);
  font-weight: 800;
  margin: 0;
  text-align: center;
}

.current-theme-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.current-theme-section h3 {
  color: var(--color-primary);
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.theme-display {
  display: flex;
  justify-content: center;
}

.theme-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  min-width: 300px;
}

.theme-color {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
}

.theme-preview.green .theme-color {
  background: #17624A;
}

.theme-preview.pink .theme-color {
  background: #ff4dbb;
}

.theme-info {
  flex: 1;
}

.theme-name {
  font-weight: 700;
  font-size: 18px;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.theme-color-code {
  font-size: 14px;
  color: #666;
  font-family: 'Courier New', monospace;
}

.theme-selection-section {
  margin-bottom: 32px;
}

.theme-selection-section h3 {
  color: var(--color-primary);
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.theme-option:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 12px rgba(17,87,64,0.08);
}

.theme-option.active {
  border-color: var(--color-primary);
  background: #f0f8f5;
  box-shadow: 0 4px 16px rgba(17,87,64,0.12);
}

.option-preview {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  border: 2px solid #e0e0e0;
}

.option-info {
  flex: 1;
}

.option-name {
  font-weight: 600;
  font-size: 16px;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.option-color {
  font-size: 14px;
  color: #666;
  font-family: 'Courier New', monospace;
}

.option-check {
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.theme-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.apply-btn {
  width: 100%;
  height: 48px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 12px;
}

.success-alert {
  border-radius: 8px;
}

@media (max-width: 600px) {
  .theme-card {
    max-width: 100vw !important;
    margin: 12px 0 !important;
    padding: 16px 4vw !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    box-sizing: border-box;
  }
  
  .theme-header h2 {
    font-size: 1.4rem !important;
  }
  
  .current-theme-section {
    padding: 20px;
    border-radius: 10px;
  }
  
  .current-theme-section h3 {
    font-size: 1.1rem !important;
    margin-bottom: 12px !important;
  }
  
  .theme-preview {
    flex-direction: column !important;
    gap: 12px !important;
    padding: 16px !important;
    min-width: 0 !important;
    text-align: center !important;
  }
  
  .theme-color {
    width: 50px !important;
    height: 50px !important;
  }
  
  .theme-name {
    font-size: 16px !important;
  }
  
  .theme-selection-section h3 {
    font-size: 1.1rem !important;
    margin-bottom: 16px !important;
  }
  
  .theme-options {
    gap: 12px;
  }
  
  .theme-option {
    padding: 16px !important;
    gap: 12px !important;
  }
  
  .option-preview {
    width: 40px !important;
    height: 40px !important;
  }
  
  .option-name {
    font-size: 16px !important;
  }
  
  .option-color {
    font-size: 13px !important;
  }
  
  .apply-btn {
    height: 52px !important;
    font-size: 18px !important;
    border-radius: 10px !important;
  }
  
  .success-alert {
    font-size: 16px !important;
    margin-top: 16px !important;
    border-radius: 8px !important;
  }
}
</style> 