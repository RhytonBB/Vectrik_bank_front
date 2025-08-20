import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './assets/main.css';
import axios from 'axios';

// Настройка axios - правильный baseURL
axios.defaults.baseURL = 'https://vectrikbank.ru';
axios.defaults.withCredentials = true;

// Глобальный interceptor для CSRF защиты
axios.interceptors.request.use(
  async (config) => {
    // Для POST/PUT/DELETE запросов добавляем CSRF токен
    if (['post', 'put', 'delete'].includes(config.method?.toLowerCase())) {
      // Пробуем получить токен из cookie
      const token = getCookie('csrf_token');
      if (token) {
        config.headers['X-CSRF-Token'] = token;
      } else {
        // Если токена нет, получаем новый
        try {
          const response = await axios.get('/api/csrf-token');
          config.headers['X-CSRF-Token'] = response.data.token;
        } catch (error) {
          console.error('Ошибка получения CSRF токена:', error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Глобальный interceptor для обработки ответов и автоматического выхода
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Если получили 403 Forbidden с ошибкой CSRF, значит токен истек
    if (error.response && error.response.status === 403) {
      const errorData = error.response.data;
      if (errorData && (errorData.error === 'CSRF token missing' || errorData.error === 'Invalid CSRF token')) {
        console.log('🔒 CSRF токен истек, выполняем автоматический выход');
        performLogout();
      }
    }
    // Также обрабатываем 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.log('🔒 Токен авторизации истек, выполняем автоматический выход');
      performLogout();
    }
    return Promise.reject(error);
  }
);


// Функция для получения cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Функция для проверки срока действия CSRF токена
function isCSRFTokenExpired() {
  const token = getCookie('csrf_token');
  if (!token) {
    console.log('🔒 CSRF токен отсутствует');
    return true;
  }
  
  // CSRF токен живет 30 минут (1800 секунд)
  // Проверяем, есть ли токен в cookie
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      // Если токен есть, считаем его валидным
      // Сервер сам удалит его через 30 минут
      return false;
    }
  }
  
  console.log('🔒 CSRF токен истек или отсутствует');
  return true;
}

// Функция для автоматического выхода
function performLogout() {
  console.log('🔒 Выполняем автоматический выход');
  
  // Очищаем localStorage
  localStorage.removeItem('token');
  
  // Очищаем все cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  // Перенаправляем на страницу входа
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  }
}

// Подавляем предупреждения ResizeObserver
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
    return;
  }
  originalError.apply(console, args);
};

// Импортируем composable для темы
import { useTheme } from './composables/useTheme.js'

// Применяем тему при загрузке
const { applyTheme } = useTheme()
applyTheme()

// Проверяем CSRF токен при загрузке страницы
const checkCSRFTokenOnLoad = () => {
  if (isCSRFTokenExpired()) {
    performLogout();
    return;
  }
};

// Запускаем проверку при загрузке
checkCSRFTokenOnLoad();

// Запускаем периодическую проверку CSRF токена каждые 5 минут
setInterval(() => {
  if (isCSRFTokenExpired()) {
    performLogout();
  }
}, 5 * 60 * 1000); // 5 минут

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount('#app');