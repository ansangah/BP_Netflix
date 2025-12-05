import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Views
import HomeView from '../views/HomeView.vue'
import PopularView from '../views/PopularView.vue'
import SearchView from '../views/SearchView.vue'
import WishlistView from '../views/WishlistView.vue'
import SignInView from '../views/SignInView.vue'

// 라우트 타입 선언
const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/popular', name: 'popular', component: PopularView },
  { path: '/search', name: 'search', component: SearchView },
  { path: '/wishlist', name: 'wishlist', component: WishlistView },
  { path: '/signin', name: 'signin', component: SignInView }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router