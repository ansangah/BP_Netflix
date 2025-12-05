<template>
  <section class="wishlist-page">
    <header class="wishlist-header">
      <div>
        <p class="eyebrow">MY LIST</p>
        <h1>내가 찜한 리스트</h1>
        <p class="description">
          추천으로 저장한 영화는 이곳에 보관돼요. 기기와 브라우저가 달라도 Local Storage 동기화를 통해 언제든 확인할 수 있습니다.
        </p>
      </div>
      <div class="actions">
        <RouterLink class="ghost-btn" to="/popular">대세 콘텐츠 보기</RouterLink>
        <button class="ghost-btn" type="button" @click="clearWishlist" :disabled="!wishlist.length">
          전체 비우기
        </button>
      </div>
    </header>

    <div v-if="!wishlist.length" class="empty-state">
      <p>아직 추천한 영화가 없어요! 마음에 드는 영화를 클릭하면 자동으로 추가됩니다.</p>
      <RouterLink class="primary-link" to="/">홈으로 이동하기</RouterLink>
    </div>

    <div v-else class="wishlist-grid">
      <article v-for="movie in wishlist" :key="movie.id" class="wishlist-card">
        <div class="poster">
          <img :src="getPoster(movie.poster_path)" :alt="movie.title" />
        </div>
        <div class="info">
          <h2>{{ movie.title }}</h2>
          <p class="meta">
            ⭐ {{ movie.vote_average.toFixed(1) }} · {{ movie.release_date || '개봉일 정보 없음' }}
          </p>
          <p class="overview">
            {{ movie.overview || '간단한 소개 정보가 없습니다.' }}
          </p>
          <button class="remove-btn" type="button" @click="removeFromWishlist(movie.id)">리스트에서 제거</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useWishlist } from '../composables/useWishlist'

const { wishlist, removeFromWishlist, clearWishlist } = useWishlist()
const imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL as string

function getPoster(posterPath: string | null) {
  if (!posterPath) return 'https://placehold.co/300x450?text=No+Image'
  return `${imageBaseUrl}${posterPath}`
}
</script>

<style scoped>
.wishlist-page {
  padding: 96px 32px 48px;
}

.wishlist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.eyebrow {
  color: #e50914;
  font-size: 13px;
  letter-spacing: 0.2em;
  margin: 0 0 8px;
}

h1 {
  margin: 0;
  font-size: clamp(32px, 4vw, 48px);
}

.description {
  max-width: 560px;
  color: #aaa;
  margin-top: 12px;
}

.actions {
  display: flex;
  gap: 12px;
}

.ghost-btn {
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  padding: 10px 18px;
  background: transparent;
  color: #fff;
  cursor: pointer;
}

.ghost-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

.primary-link {
  display: inline-block;
  margin-top: 16px;
  padding: 12px 20px;
  background: #e50914;
  color: #fff;
  border-radius: 999px;
}

.wishlist-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.wishlist-card {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 20px;
  padding: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.poster img {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
}

.info h2 {
  margin: 0 0 6px;
}

.meta {
  color: #ccc;
  margin: 0 0 12px;
}

.overview {
  color: #aaa;
  line-height: 1.6;
  margin-bottom: 18px;
}

.remove-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  color: #fff;
  padding: 8px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  border-color: #e50914;
  color: #e50914;
}

@media (max-width: 768px) {
  .wishlist-page {
    padding: 96px 16px 48px;
  }

  .wishlist-card {
    grid-template-columns: 1fr;
  }

  .poster {
    max-width: 200px;
    margin: 0 auto;
  }

  .actions {
    width: 100%;
    justify-content: space-between;
  }

  .ghost-btn {
    flex: 1;
    text-align: center;
  }
}
</style>
