// Composables
import { useAuth } from '@/auth/composables/auth';
import { createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Start',
        component: () => import(/* webpackChunkName: "home" */ '@/views/StartPage.vue'),
      },
      {
        path: 'home',
        name: 'TastingNotes',
        component: () => import(/* webpackChunkName: "home" */ '@/tasting-notes/TastingNotesPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/auth-action-complete',
    component: () => import('@/layouts/stand-alone/StandAlone.vue'),
    children: [
      {
        path: '',
        name: 'AuthActionComplete',
        component: () => import(/* webpackChunkName: "auth" */ '@/auth/AuthActionCompletePage.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/layouts/stand-alone/StandAlone.vue'),
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import(/* webpackChunkName: "auth" */ '@/auth/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/logout',
    component: () => import('@/layouts/stand-alone/StandAlone.vue'),
    children: [
      {
        path: '',
        name: 'Logout',
        component: () => import(/* webpackChunkName: "auth" */ '@/auth/LogoutPage.vue'),
      },
    ],
  },
];

const checkAuthStatus = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  if (to.matched.some((r) => r.meta.requiresAuth)) {
    const { isAuthenticated } = useAuth();
    if (!(await isAuthenticated())) {
      return next('/login');
    }
  }
  next();
};

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(checkAuthStatus);

export default router;
