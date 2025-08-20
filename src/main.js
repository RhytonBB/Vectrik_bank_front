import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './assets/main.css';
import axios from 'axios';

// Настройка axios
axios.defaults.baseURL = 'https://vectrikbank.ru'
axios.defaults.withCredentials = true

// Глобальный interceptor для CSRF защиты
axios.interceptors.request.use(
  async (config) => {
    // Для POST/PUT/DELETE запросов добавляем CSRF токен
    if (['post', 'put', 'delete'].includes(config.method?.toLowerCase())) {
      // Пробуем получить токен из cookie
      const token = getCookie('csrf_token')
      if (token) {
        config.headers['X-CSRF-Token'] = token
      } else {
        // Если токена нет, получаем новый
        try {
          const response = await axios.get('/api/csrf-token')
          config.headers['X-CSRF-Token'] = response.data.token
        } catch (error) {
          console.error('Ошибка получения CSRF токена:', error)
        }
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Функция для получения cookie
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// Устанавливаем базовый URL для API
axios.defaults.baseURL = '/api';

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