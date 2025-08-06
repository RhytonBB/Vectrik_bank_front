import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './assets/main.css';
import axios from 'axios';
axios.defaults.withCredentials = true;
// Для продакшена используем относительные пути, так как Nginx проксирует запросы
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : '/';

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