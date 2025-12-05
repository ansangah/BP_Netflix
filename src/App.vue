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
  background: #000;
  color: #fff;
}
.app-main {
  padding-top: 90px;
}
</style>
