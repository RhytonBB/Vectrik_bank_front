import axios from 'axios'

export function useTheme() {
  const applyTheme = async () => {
    try {
      // Определяем, админ это или клиент
      const isAdmin = window.location.pathname.includes('/admin');
      const themeEndpoint = isAdmin ? '/api/admin/theme' : '/api/client/theme';
      
      const response = await axios.get(themeEndpoint);
      const theme = response.data.theme;
      
      // Применяем тему к body
      document.body.className = ''; // Очищаем все классы
      if (theme === 'pink') {
        document.body.classList.add('theme-pink');
      }
      
      console.log('🎨 Тема применена:', theme);
      return theme;
    } catch (error) {
      console.error('❌ Ошибка получения темы:', error);
      return 'green'; // Возвращаем тему по умолчанию
    }
  }

  const setTheme = async (theme) => {
    try {
      const isAdmin = window.location.pathname.includes('/admin');
      const themeEndpoint = isAdmin ? '/api/admin/theme' : '/api/client/theme';
      
      await axios.post(themeEndpoint, { theme });
      
      // Применяем тему на странице
      document.body.className = ''; // Очищаем все классы
      if (theme === 'pink') {
        document.body.classList.add('theme-pink');
      }
      
      console.log('🎨 Тема установлена:', theme);
      return true;
    } catch (error) {
      console.error('❌ Ошибка установки темы:', error);
      return false;
    }
  }

  return {
    applyTheme,
    setTheme
  }
} 