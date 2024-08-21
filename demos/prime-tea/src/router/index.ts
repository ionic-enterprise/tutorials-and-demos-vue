import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/tabs',
      name: 'tabs',
      component: () => import('../views/TabsView.vue'),
      children: [
        {
          path: 'about',
          name: 'child about',
          component: () => import('../views/AboutView.vue'),
        },
        {
          path: 'teas',
          name: 'tea-list',
          component: () => import('../views/TeaListView.vue'),
        },
        {
          path: 'teas/:id',
          name: 'tea-details',
          component: () => import('../views/TeaDetailsView.vue'),
        },
        {
          path: 'tasting-notes',
          name: 'tasting-notes',
          component: () => import('../views/TastingNotesView.vue'),
        },
      ],
    },
  ],
});

export default router;
