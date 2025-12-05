<!-- src/components/movies/MovieCard.vue -->
<template>
  <article
    class="movie-card"
    :class="{ 'is-recommended': isWishlisted(movie.id) }"
    @click="handleToggle"
  >
    <span v-if="isWishlisted(movie.id)" class="badge">추천됨</span>
    <div class="poster-wrapper">
      <img
        v-if="posterUrl"
        :src="posterUrl"
        :alt="movie.title"
      />
      <div v-else class="poster-placeholder">
        이미지 없음
      </div>

      <div class="overlay">
        <div class="overlay-content">
          <h3 class="title">{{ movie.title }}</h3>
          <p class="meta">
            ⭐ {{ movie.vote_average.toFixed(1) }}
            · {{ movie.release_date || '개봉일 정보 없음' }}
          </p>
          <p class="overview">
            {{ movie.overview || '줄거리 정보가 없습니다.' }}
          </p>
        </div>
        <button class="wishlist-btn" type="button" @click.stop="handleToggle">
          {{ isWishlisted(movie.id) ? '추천 해제' : '추천 등록' }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Movie } from '../../composables/useTmdb'
import { useWishlist } from '../../composables/useWishlist'

const props = defineProps<{
  movie: Movie
}>()

const imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL as string

const posterUrl = computed(() =>
  props.movie.poster_path ? `${imageBaseUrl}${props.movie.poster_path}` : ''
)

const { toggleWishlist, isWishlisted } = useWishlist()

function handleToggle() {
  toggleWishlist(props.movie)
}
</script>

<style scoped>
.movie-card {
  width: 150px;
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border 0.25s ease;
  margin: 0 auto;
}

.movie-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.movie-card.is-recommended {
  border-color: rgba(229, 9, 20, 0.8);
}

.movie-card.is-recommended:hover {
  box-shadow: 0 20px 40px rgba(229, 9, 20, 0.35);
}

.poster-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: #111;
}

.poster-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.movie-card:hover .poster-wrapper img {
  transform: scale(1.08);
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

.overlay {
  position: absolute;
  inset: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 20%, rgba(0, 0, 0, 0.95) 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.movie-card:hover .overlay {
  opacity: 1;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
  margin-bottom: 12px;
}

.title {
  font-size: 14px;
  margin: 0;
}

.meta {
  font-size: 12px;
  color: #ccc;
  margin: 0;
}

.overview {
  font-size: 11px;
  color: #ddd;
  max-height: 4.5em;
  overflow: hidden;
}

.badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(229, 9, 20, 0.85);
  color: #fff;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 999px;
  z-index: 2;
}

.wishlist-btn {
  align-self: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease, border 0.2s ease;
}

.wishlist-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}
</style>
