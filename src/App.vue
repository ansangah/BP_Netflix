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
  background: transparent;
  color: #fff;
  position: relative;
}
body {
  margin: 0;
}

.app-main {
  flex: 1;
  width: 100%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 90px 0 24px;
  box-sizing: border-box;
  min-height: calc(100vh - 72px);
  overflow: hidden;
  position: relative;
}

#app::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 25% 25%, #982236, #44070f 32%, #1a0307 65%, #050104 100%),
    radial-gradient(circle at 75% 60%, #58206f, #1a0307 35%, #050104 75%);
  z-index: -1;
}
</style>
