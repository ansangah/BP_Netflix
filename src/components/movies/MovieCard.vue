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
    </div>
    <div class="card-body">
      <h3 class="title">{{ movie.title }}</h3>
      <p class="meta">
        ⭐ {{ movie.vote_average.toFixed(1) }}
        · {{ movie.release_date || '개봉일 정보 없음' }}
      </p>
      <p class="overview">
        {{ movie.overview || '줄거리 정보가 없습니다.' }}
      </p>
      <button class="wishlist-btn" type="button" @click.stop="handleToggle">
        {{ isWishlisted(movie.id) ? '추천 해제' : '추천 등록' }}
      </button>
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
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  min-height: 360px;
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.02);
}

.movie-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
}

.movie-card.is-recommended {
  border-color: rgba(229, 9, 20, 0.65);
  box-shadow: 0 12px 30px rgba(229, 9, 20, 0.25);
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

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 4px;
}

.title {
  font-size: 14px;
  margin: 4px 0 0;
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
  flex: 1;
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
}

.wishlist-btn {
  margin-top: auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: transparent;
  color: #fff;
  padding: 4px 0;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease, border 0.2s ease;
}

.wishlist-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}
</style>
