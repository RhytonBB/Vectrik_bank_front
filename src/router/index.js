import { createRouter, createWebHistory } from 'vue-router';
import UserLogin from '../pages/UserLogin.vue';
import AdminUsers from '../views/AdminUsers.vue'
import AdminUserDetail from '../views/AdminUserDetail.vue'
import AdminProducts from '../views/AdminProducts.vue'
import AdminProductEdit from '../views/AdminProductEdit.vue'
import AdminAnalytics from '../views/AdminAnalytics.vue'
import AdminBanners from '../views/AdminBanners.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminReward from '../views/AdminReward.vue'
import AdminBroadcast from '../views/AdminBroadcast.vue'
import AdminUserRegister from '../views/AdminUserRegister.vue'
import AdminNews from '../views/AdminNews.vue'

import AdminTheme from '../views/AdminTheme.vue'
import AdminGroups from '../views/AdminGroups.vue'

// Новые компоненты для клиентской части
import ClientHome from '../views/ClientHome.vue'
import ClientStore from '../views/ClientStore.vue'
import ClientNews from '../views/ClientNews.vue'
import ClientAbout from '../views/ClientAbout.vue'
import ClientProfile from '../views/ClientProfile.vue'

// Функция для проверки мобильного устройства
function isMobileDevice() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768;
  console.log('Mobile device check:', { 
    userAgent: navigator.userAgent, 
    windowWidth: window.innerWidth, 
    isMobile 
  });
  return isMobile;
}

const routes = [
  { path: '/', component: UserLogin },
  { path: '/admin/dashboard', component: AdminDashboard },
  { path: '/admin/reward', component: AdminReward },
  { path: '/admin/broadcast', component: AdminBroadcast },
  { path: '/admin/users/register', component: AdminUserRegister },
  { path: '/admin/users', component: AdminUsers },
  { path: '/admin/users/:id', component: AdminUserDetail },
  { path: '/admin/products', component: AdminProducts },
  { path: '/admin/products/edit/:id?', component: AdminProductEdit },
  { path: '/admin/analytics', component: AdminAnalytics },
  { path: '/admin/banners', component: AdminBanners },
  { path: '/admin/theme', component: AdminTheme },
  { path: '/admin/groups', component: AdminGroups },
  { path: '/admin/news', component: AdminNews },

  
  // Клиентские маршруты
  { path: '/client', component: ClientHome },
  { path: '/dashboard', component: ClientHome }, // Алиас для клиентов
  { path: '/client/store', component: ClientStore },
  { path: '/client/news', component: ClientNews },
  { path: '/client/about', component: ClientAbout },
  { path: '/client/profile', component: ClientProfile },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Глобальный guard для разграничения интерфейсов
router.beforeEach(async (to, from, next) => {
  console.log('Router guard:', { to: to.path, from: from.path });
  
  if (to.path === '/') return next();
  
  // Проверяем авторизацию
  try {
    const resp = await fetch('/api/me', { credentials: 'include' });
    if (!resp.ok) throw new Error('not auth');
    const me = await resp.json();
    const isAdmin = me.is_admin;
    
    console.log('User info:', { isAdmin, path: to.path });
    
    // Если это клиентский маршрут (включая /dashboard)
    if (to.path.startsWith('/client') || to.path === '/dashboard') {
      console.log('Client route detected');
      if (isAdmin) {
        // Админы не могут попасть в клиентскую часть
        console.log('Admin trying to access client route, redirecting to admin dashboard');
        return next('/admin/dashboard');
      }
      
      // Проверяем, что это мобильное устройство
      // Временно отключаем для диагностики
      // if (!isMobileDevice()) {
      //   console.log('Non-mobile device trying to access client route');
      //   alert('Клиентская часть доступна только с мобильных устройств и планшетов');
      //   return next('/');
      // }
      
      console.log('Client route access granted');
      return next();
    }
    
    // Если это админский маршрут
    if (to.path.startsWith('/admin')) {
      console.log('Admin route detected');
      if (!isAdmin) {
        console.log('Non-admin trying to access admin route, redirecting to client');
        return next('/client');
      }
      console.log('Admin route access granted');
      return next();
    }
    
    // Любой другой маршрут — редирект по роли
    console.log('Unknown route, redirecting by role');
    if (isAdmin) return next('/admin/dashboard');
    return next('/client');
  } catch (error) {
    console.log('Auth error:', error);
    return next('/');
  }
});

export default router;