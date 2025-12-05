import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { isAuthenticated } from '../composables/useAuth'

// Views
import HomeView from '../views/HomeView.vue'
import PopularView from '../views/PopularView.vue'
import SearchView from '../views/SearchView.vue'
import WishlistView from '../views/WishlistView.vue'
import SignInView from '../views/SignInView.vue'

// 라우트 타입 선언
const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
  { path: '/popular', name: 'popular', component: PopularView, meta: { requiresAuth: true } },
  { path: '/search', name: 'search', component: SearchView, meta: { requiresAuth: true } },
  { path: '/wishlist', name: 'wishlist', component: WishlistView, meta: { requiresAuth: true } },
  { path: '/signin', name: 'signin', component: SignInView, meta: { guestOnly: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const loggedIn = isAuthenticated()

  if (to.meta.requiresAuth && !loggedIn) {
    return next({
      name: 'signin',
      query: { redirect: to.fullPath }
    })
  }

  if (to.meta.guestOnly && loggedIn) {
    if (from.name && from.name !== 'signin') {
      return next({ path: from.fullPath || '/' })
    }
    return next({ name: 'home' })
  }

  return next()
})

export default router
