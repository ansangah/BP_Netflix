<template>
  <div id="app">
    <AppHeader />
    <main class="app-main">
      <RouterView />
    </main>
    <ScrollTopButton />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import ScrollTopButton from './components/common/ScrollTopButton.vue'
</script>

<style>
#app {
  min-height: 100vh;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at top, #0a0a0a, #050505 50%);
  color: #fff;
}
.app-main {
  flex: 1;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 70px 0 24px;
  box-sizing: border-box;
}
</style>
