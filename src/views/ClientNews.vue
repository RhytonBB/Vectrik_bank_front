<template>
  <ClientLayout>
    <div class="client-news">
      <!-- Заголовок -->
      <div class="header">
        <div class="logo-section">
          <img src="/logo.png" alt="Вектрик Банк" class="logo">
          <h1 class="bank-name">Вектрик Банк</h1>
        </div>
      </div>

      <!-- Заголовок новостей -->
      <h2 class="news-title">Новости</h2>

      <!-- Сообщение о том, что новости пока не реализованы -->
      <div class="news-placeholder">
        <div class="placeholder-content">
          <p>Раздел новостей находится в разработке</p>
          <p>Скоро здесь появятся актуальные новости и обновления</p>
        </div>
      </div>
    </div>
  </ClientLayout>
</template>

<script setup>
import ClientLayout from '@/components/ClientLayout.vue'
</script>

<style scoped>
.client-news {
  padding: 16px;
  background: #fff;
  min-height: 100vh;
}

.header {
  margin-bottom: 20px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo {
  width: 40px;
  height: 40px;
}

.bank-name {
  color: #17624A;
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}

.news-title {
  color: #17624A;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-align: center;
}

.news-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.placeholder-content {
  text-align: center;
  color: #666;
  padding: 40px 20px;
}

.placeholder-content p {
  margin-bottom: 12px;
  font-size: 16px;
  line-height: 1.5;
}

.placeholder-content p:last-child {
  margin-bottom: 0;
  font-size: 14px;
  color: #888;
}

@media (max-width: 480px) {
  .client-news {
    padding: 12px;
  }
  
  .bank-name {
    font-size: 20px;
  }
  
  .placeholder-content p {
    font-size: 14px;
  }
  
  .placeholder-content p:last-child {
    font-size: 12px;
  }
}
</style> 