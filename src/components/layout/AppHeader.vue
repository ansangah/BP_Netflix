<!-- src/components/layout/AppHeader.vue -->
<template>
  <header :class="['app-header', { 'is-scrolled': isScrolled }]">
    <div class="logo" @click="router.push('/')">
      <span class="logo-mark">WSD</span> Movie
    </div>

    <nav class="nav">
      <RouterLink to="/">홈</RouterLink>
      <RouterLink to="/popular">대세 콘텐츠</RouterLink>
      <RouterLink to="/search">찾아보기</RouterLink>
      <RouterLink to="/wishlist">내가 찜한 리스트</RouterLink>
    </nav>

    <div class="user-area">
      <template v-if="isLoggedIn">
        <span class="user-id">{{ currentUser?.id }}</span>
        <button class="ghost-btn" @click="handleLogout">로그아웃</button>
      </template>
      <RouterLink v-else class="ghost-btn" to="/signin">로그인</RouterLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { currentUser, isLoggedIn, logout } = useAuth()
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40
}

function handleLogout() {
  logout()
  router.push('/signin')
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0));
  transition: background 0.3s ease, transform 0.3s ease;
  z-index: 100;
}

.app-header.is-scrolled {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(0);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.logo {
  font-weight: 700;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.5px;
}

.logo-mark {
  padding: 4px 8px;
  border-radius: 4px;
  background: #e50914;
  font-size: 14px;
}

.nav {
  display: flex;
  gap: 18px;
}

.nav a {
  text-decoration: none;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  position: relative;
}

.nav a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 0;
  height: 2px;
  background: #e50914;
  transition: width 0.2s ease;
}

.nav a.router-link-active::after {
  width: 100%;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-id {
  font-size: 13px;
  color: #bbb;
}

.ghost-btn {
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  padding: 6px 18px;
  background: transparent;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-btn:hover {
  border-color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
    height: 64px;
  }

  .nav {
    display: none;
  }
}
</style>
