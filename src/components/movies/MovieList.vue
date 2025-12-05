<!-- src/components/movies/MovieList.vue -->
<template>
  <section class="section">
    <header class="section-head">
      <div>
        <p class="eyebrow">{{ helperLabel }}</p>
        <h2 class="section-title">{{ title }}</h2>
      </div>
      <button v-if="limit && movies.length > limit" class="see-more" type="button" @click="$emit('see-more')">
        모두 보기
      </button>
    </header>

    <div v-if="loading" class="loading">
      로딩 중입니다...
    </div>

    <div v-else class="movies-grid">
      <MovieCard
        v-for="movie in displayMovies"
        :key="movie.id"
        :movie="movie"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Movie } from '../../composables/useTmdb'
import MovieCard from './MovieCard.vue'

const props = defineProps<{
  title: string
  movies: Movie[]
  loading?: boolean
  limit?: number
}>()

defineEmits<{
  (event: 'see-more'): void
}>()

const displayMovies = computed(() =>
  props.limit ? props.movies.slice(0, props.limit) : props.movies
)

const helperLabel = computed(() => {
  if (props.title.includes('인기')) return 'Popular Picks'
  if (props.title.includes('현재')) return 'Now Showing'
  if (props.title.includes('개봉')) return 'Coming Soon'
  if (props.title.includes('평점')) return 'Top Rated'
  return 'Curated'
})
</script>

<style scoped>
.section {
  margin-bottom: 48px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  gap: 12px;
}

.section-title {
  font-size: clamp(20px, 2vw, 28px);
  font-weight: 700;
  margin: 4px 0 0;
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 0.3em;
  color: #e50914;
  margin: 0;
  text-transform: uppercase;
}

.see-more {
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  background: transparent;
  color: #fff;
  padding: 6px 16px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.see-more:hover {
  border-color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
  justify-items: center;
}

.loading {
  font-size: 14px;
  color: #ccc;
}

@media (max-width: 640px) {
  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  }
}
</style>
