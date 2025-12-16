<!-- src/components/layout/AppHeader.vue -->
<template>
  <header :class="['app-header', { 'is-scrolled': isScrolled }]">
    <div class="logo" @click="router.push('/')">Movie</div>

    <button
      class="menu-toggle"
      type="button"
      :aria-expanded="isNavOpen"
      :aria-label="isNavOpen ? '메뉴 닫기' : '메뉴 열기'"
      @click="toggleNav"
    >
      <span class="menu-icon" :class="{ open: isNavOpen }" aria-hidden="true"></span>
    </button>

    <nav :class="['nav', { 'is-open': isNavOpen }]">
      <RouterLink to="/" @click="closeNav">홈</RouterLink>
      <RouterLink to="/popular" @click="closeNav">대세 콘텐츠</RouterLink>
      <RouterLink to="/search" @click="closeNav">찾아보기</RouterLink>
      <RouterLink to="/wishlist" @click="closeNav">내가 찜한 리스트</RouterLink>

      <div class="user-area">
        <template v-if="isLoggedIn">
          <span class="user-id">{{ currentUser?.id }}</span>
          <button class="ghost-btn" @click="handleLogout">로그아웃</button>
        </template>
        <RouterLink v-else class="ghost-btn" to="/signin" @click="closeNav">로그인</RouterLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { currentUser, isLoggedIn, logout } = useAuth()
const isScrolled = ref(false)
const isNavOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40
}

function handleLogout() {
  closeNav()
  logout()
  router.push('/signin')
}

function toggleNav() {
  isNavOpen.value = !isNavOpen.value
}

function closeNav() {
  isNavOpen.value = false
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

.menu-toggle {
  display: none;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.menu-toggle .menu-icon {
  font-size: 24px;
  color: #fff;
  transition: transform 0.2s ease;
}

.menu-icon::before {
  content: '☰';
  display: inline-block;
}

.menu-icon.open::before {
  content: '✕';
  transform: rotate(0deg);
}

.nav {
  display: flex;
  gap: 18px;
  align-items: center;
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

  .menu-toggle {
    display: flex;
  }

  .nav {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: flex-start;
    background: rgba(0, 0, 0, 0.95);
    padding: 16px;
    gap: 12px;
    display: none;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
  }

  .nav.is-open {
    display: flex;
  }

  .nav a {
    width: 100%;
  }

  .user-area {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
