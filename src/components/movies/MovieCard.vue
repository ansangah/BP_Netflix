<!-- src/components/movies/MovieCard.vue -->
<template>
  <article class="movie-card">
    <div class="poster-wrapper">
      <img
        v-if="posterUrl"
        :src="posterUrl"
        :alt="movie.title"
      />
      <div v-else class="poster-placeholder">
        이미지 없음
      </div>
    </div>
    <h3 class="title">{{ movie.title }}</h3>
    <p class="meta">
      ⭐ {{ movie.vote_average.toFixed(1) }}
      · {{ movie.release_date || '개봉일 정보 없음' }}
    </p>
    <p class="overview">
      {{ movie.overview || '줄거리 정보가 없습니다.' }}
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Movie } from '../../composables/useTmdb'

const props = defineProps<{
  movie: Movie
}>()

const imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL as string

const posterUrl = computed(() =>
  props.movie.poster_path ? `${imageBaseUrl}${props.movie.poster_path}` : ''
)
</script>

<style scoped>
.movie-card {
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.movie-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
}

.poster-wrapper {
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border-radius: 8px;
  background: #111;
}

.poster-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
}

.title {
  font-size: 14px;
  margin-top: 4px;
}

.meta {
  font-size: 12px;
  color: #ccc;
}

.overview {
  font-size: 11px;
  color: #aaa;
  max-height: 4.5em;
  overflow: hidden;
}
</style>