<template>
  <div class="login-container">
    <AppLogo />
    <h1>Вектрик Банк</h1>
    <el-form :model="form" class="login-form" @submit.prevent="onLogin">
      <el-form-item>
        <el-input v-model="form.username" placeholder="Логин" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="form.password" type="password" placeholder="Пароль" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%; background: var(--color-primary); border-color: var(--color-primary); color: #fff;">Войти</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import AppLogo from '@/components/AppLogo.vue';

const router = useRouter();

const form = ref({
  username: '',
  password: ''
});
const loading = ref(false);

async function onLogin() {
  if (!form.value.username || !form.value.password) {
    ElMessage.error('Заполните все поля!');
    return;
  }
  loading.value = true;
  try {
    const response = await axios.post(
      '/login',
      {
        login: form.value.username,
        password: form.value.password
      },
      {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        withCredentials: true
      }
    );
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // Получаем роль пользователя
      try {
        const meResp = await axios.get('/me', { withCredentials: true });
        if (meResp.data.is_admin) {
          router.push('/admin/dashboard');
        } else {
          router.push('/client');
        }
      } catch (e) {
        ElMessage.error('Ошибка авторизации (me)');
      }
      return;
    } else {
      ElMessage.error('Ошибка авторизации.');
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error) {
      ElMessage.error(err.response.data.error);
    } else {
      ElMessage.error('Ошибка соединения с сервером.');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-secondary);
}
h1 {
  color: var(--color-primary);
  font-weight: 800;
  margin-bottom: 32px;
  font-family: 'Inter', sans-serif;
}
.login-form {
  width: 320px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(17, 87, 64, 0.08);
  padding: 32px 24px;
  margin-top: 24px;
}
</style>