<template>
  <ClientLayout>
    <div class="client-about">
      <!-- Заголовок -->
      <div class="header">
        <div class="logo-section">
          <img :src="getLogo()" alt="Вектрик Банк" class="logo">
          <h1 class="bank-name">Вектрик Банк</h1>
        </div>
      </div>

      <!-- Раздел "О нас" -->
      <div class="about-section">
        <h2 class="section-title">О нас</h2>
        <div class="info-card">
          <div class="contact-item">
            <span class="contact-label">Секретарь:</span>
            <span class="contact-value">xxx@xxx</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">Техническая поддержка:</span>
            <span class="contact-value">xxx@xxx или в чат с тех поддержкой</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">Обслуживание физических лиц:</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">пн.-пт.:</span>
            <span class="contact-value">08:30-19:30</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">сб.:</span>
            <span class="contact-value">09:30-15:00</span>
          </div>
        </div>
      </div>

      <!-- Раздел "Адрес" -->
      <div class="address-section">
        <h2 class="section-title">Адрес</h2>
        <div class="info-card">
          <div class="address-item">
            <span class="address-label">Главный офис:</span>
            <span class="address-value">г. Москва, ул. Вавилова, д. 19 М. Ленинский проспект</span>
          </div>
          <div class="address-item">
            <span class="address-label">Дополнительный офис:</span>
            <span class="address-value">г. Москва, Гороховский переулок, д. 4к7 М. Курская</span>
          </div>
        </div>
      </div>

      <!-- Раздел "Политика конфиденциальности" -->
      <div class="privacy-section">
        <h2 class="section-title">Политика конфиденциальности</h2>
        <div class="info-card">
          <div class="privacy-content">
            <p><strong>1. Общие положения</strong></p>
            <p>Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных участников учебного интенсива (далее — Пользователь), предоставляемых при использовании информационной системы.</p>
            
            <p><strong>2. Перечень обрабатываемых персональных данных</strong></p>
            <p>В рамках работы системы обрабатываются следующие персональные данные Пользователя: фамилия, имя, Telegram username.</p>
            
            <p><strong>3. Цели обработки персональных данных</strong></p>
            <p>Персональные данные обрабатываются исключительно для целей организации и проведения учебного интенсива, а также для функционирования системы начисления баллов.</p>
            
            <p><strong>4. Сроки и условия хранения данных</strong></p>
            <p>Персональные данные хранятся только в течение срока проведения интенсива и подлежат удалению не позднее 7 (семи) дней после его завершения. Данные не передаются третьим лицам, не используются в коммерческих целях и не передаются за пределы Российской Федерации.</p>
            
            <p><strong>5. Права пользователя</strong></p>
            <p>Пользователь имеет право запросить удаление или изменение своих персональных данных, а также отозвать согласие на их обработку, обратившись к организаторам интенсива по адресу: vanya.sirotkin2017@yandex.ru</p>
            
            <p><strong>6. Безопасность данных</strong></p>
            <p>Организаторы принимают необходимые меры для защиты персональных данных от несанкционированного доступа, раскрытия и иных неправомерных действий.</p>
            
            <p><strong>7. Согласие</strong></p>
            <p>Используя данную систему, Пользователь подтверждает ознакомление с настоящей Политикой и выражает согласие на обработку своих персональных данных на указанных условиях.</p>
          </div>
        </div>
      </div>
    </div>
  </ClientLayout>
</template>

<script setup>
import ClientLayout from '@/components/ClientLayout.vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme } = useTheme()

const getLogo = () => {
  if (currentTheme.value === 'pink') {
      return '/logo-pink.svg'
}
return '/logo.svg'
}
</script>

<style scoped>
.client-about {
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
  color: var(--color-primary);
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}

.section-title {
  color: var(--color-primary);
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-align: center;
}

.about-section,
.address-section,
.privacy-section {
  margin-bottom: 24px;
}

.info-card {
  background: #e8f5e8;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #d4edda;
}

/* Розовая тема */
body.theme-pink .info-card {
  background: #ffe6f7;
  border: 1px solid #ffb3e6;
}

.contact-item,
.address-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.contact-item:last-child,
.address-item:last-child {
  margin-bottom: 0;
}

.contact-label,
.address-label {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.contact-value,
.address-value {
  color: #333;
  font-size: 14px;
  line-height: 1.4;
}

.privacy-content {
  color: #333;
  font-size: 14px;
  line-height: 1.6;
}

.privacy-content p {
  margin-bottom: 12px;
}

.privacy-content p:last-child {
  margin-bottom: 0;
}

.privacy-content strong {
  color: var(--color-primary);
  font-weight: 600;
}

@media (max-width: 480px) {
  .client-about {
    padding: 12px;
  }
  
  .bank-name {
    font-size: 20px;
  }
  
  .info-card {
    padding: 12px;
  }
  
  .contact-label,
  .address-label {
    font-size: 13px;
  }
  
  .contact-value,
  .address-value,
  .privacy-content {
    font-size: 13px;
  }
}
</style> 