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
import UserDashboard from '../views/UserDashboard.vue'
import UserPoints from '../views/UserPoints.vue'
import UserRewards from '../views/UserRewards.vue'
import UserPurchases from '../views/UserPurchases.vue'
import AdminTheme from '../views/AdminTheme.vue'
import AdminGroups from '../views/AdminGroups.vue'

const routes = [
  { path: '/', component: UserLogin },
  { path: '/dashboard', component: UserDashboard },
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
  { path: '/user/points', component: UserPoints },
  { path: '/user/rewards', component: UserRewards },
  { path: '/user/purchases', component: UserPurchases },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Глобальный guard для разграничения интерфейсов
router.beforeEach(async (to, from, next) => {
  if (to.path === '/') return next();
  try {
    const resp = await fetch(`${process.env.VUE_APP_API_URL}/api/me`, { credentials: 'include' });
    if (!resp.ok) throw new Error('not auth');
    const me = await resp.json();
    const isAdmin = me.is_admin;
    if (to.path.startsWith('/admin')) {
      if (!isAdmin) return next('/dashboard');
      return next();
    }
    if (to.path === '/dashboard') {
      if (isAdmin) return next('/admin/dashboard');
      return next();
    }
    // Любой другой маршрут — редирект по роли
    if (isAdmin) return next('/admin/dashboard');
    return next('/dashboard');
  } catch {
    return next('/');
  }
});

export default router;