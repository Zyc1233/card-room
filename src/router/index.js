import { createRouter, createWebHistory } from 'vue-router';

import Login from '@/pages/login/login.vue'
import Register from '@/pages/login/register.vue'
import Forget from '@/pages/login/forget.vue'
import Reservation from '@/pages/reservation/reservation.vue'
import Info from '@/pages/reservation/info.vue'
import Cost from '@/pages/reservation/cost.vue'
import Modify from '@/pages/reservation/modify.vue'
import Check from '@/pages/reservation/check.vue'
import User from '@/pages/user/user.vue'


const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/forget',
    name: 'Forget',
    component: Forget
  },
  {
    path: '/reservation',
    name: 'Reservation',
    component: Reservation
  },
  {
    path: '/info',
    name: 'Info',
    component: Info,
	props: true
  },
  {
    path: '/cost',
    name: 'Cost',
    component: Cost
  },
  {
    path: '/modify',
    name: 'Modify',
    component: Modify
  },
  {
    path: '/check',
    name: 'Check',
    component: Check
  },
  {
    path: '/user',
    name: 'User',
    component: User
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;