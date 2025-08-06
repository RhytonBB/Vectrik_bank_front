import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './assets/main.css';
import axios from 'axios';

axios.defaults.withCredentials = true;

// Настройка базового URL для API
if (process.env.NODE_ENV === 'production') {
  // В production используем VUE_APP_API_URL или относительный путь
  const apiUrl = process.env.VUE_APP_API_URL || '/api';
  axios.defaults.baseURL = apiUrl;
  
  // Проверяем что переменная установлена
  if (!process.env.VUE_APP_API_URL) {
    console.warn('VUE_APP_API_URL не задана, используем /api по умолчанию');
  }
} else {
  // В development используем относительный путь
  axios.defaults.baseURL = '/';
}

// Подавляем предупреждения ResizeObserver
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
    return;
  }
  originalError.apply(console, args);
};

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount('#app');