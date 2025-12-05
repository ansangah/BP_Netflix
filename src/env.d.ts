/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // Provides TypeScript typings for SFC imports such as AppHeader.vue
  const component: DefineComponent<{}, {}, any>
  export default component
}
