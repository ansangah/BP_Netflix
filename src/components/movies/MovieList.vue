<!-- src/components/movies/MovieList.vue -->
<template>
  <section class="section">
    <h2 class="section-title">{{ title }}</h2>

    <div v-if="loading" class="loading">
      로딩 중입니다...
    </div>

    <div v-else class="movies-row">
      <MovieCard
        v-for="movie in movies"
        :key="movie.id"
        :movie="movie"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Movie } from '../../composables/useTmdb'
import MovieCard from './MovieCard.vue'

const props = defineProps<{
  title: string
  movies: Movie[]
  loading?: boolean
}>()
</script>

<style scoped>
.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
}

.movies-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.loading {
  font-size: 14px;
  color: #ccc;
}
</style>