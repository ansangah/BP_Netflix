<template>
  <transition name="scroll-top">
    <button
      v-if="visible"
      class="scroll-top-button"
      type="button"
      aria-label="맨 위로 이동"
      @click="scrollToTop"
    >
      ↑
    </button>
  </transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const visible = ref(false)

const handleScroll = () => {
  visible.value = window.scrollY > 320
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
.scroll-top-button {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: none;
  background: rgba(229, 9, 20, 0.85);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  z-index: 120;
  transition: background 0.2s ease;
}

.scroll-top-button:hover {
  background: rgba(229, 9, 20, 0.95);
}

.scroll-top-enter-active,
.scroll-top-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.scroll-top-enter-from,
.scroll-top-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 640px) {
  .scroll-top-button {
    bottom: 20px;
    right: 20px;
  }
}
</style>
