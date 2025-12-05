<!-- src/components/layout/AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="logo" @click="$router.push('/')">
      WSD Movie
    </div>
    <nav class="nav">
      <RouterLink to="/">홈</RouterLink>
      <RouterLink to="/popular">대세 콘텐츠</RouterLink>
      <RouterLink to="/search">찾아보기</RouterLink>
      <RouterLink to="/wishlist">내가 찜한 리스트</RouterLink>
      <RouterLink to="/signin">로그인</RouterLink>
    </nav>
  </header>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.logo {
  font-weight: 700;
  font-size: 20px;
  cursor: pointer;
}

.nav {
  display: flex;
  gap: 16px;
}

.nav a {
  text-decoration: none;
  color: #fff;
  font-size: 14px;
}
</style>