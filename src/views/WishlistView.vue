<template>
  <section class="wishlist-page">
    <header class="wishlist-header">
      <div>
        <p class="eyebrow">MY LIST</p>
        <h1>내가 찜한 리스트</h1>
        <p class="description">
          추천으로 저장한 영화는 이곳에 보관돼요. 필터와 정렬을 조합해 나만의 콘텐츠 라이브러리를 관리해보세요.
        </p>
      </div>
      <div class="actions">
        <RouterLink class="ghost-btn" to="/popular">대세 콘텐츠 보기</RouterLink>
        <button class="ghost-btn" type="button" @click="copyWishlist" :disabled="!wishlist.length">
          JSON 내보내기
        </button>
        <button class="ghost-btn danger" type="button" @click="handleClear" :disabled="!wishlist.length">
          전체 비우기
        </button>
      </div>
    </header>

    <section class="stats" v-if="wishlist.length">
      <article class="stat-card">
        <p class="label">총 추천 수</p>
        <p class="value">{{ stats.total }}</p>
        <p class="hint">즐겨찾기에 담긴 타이틀 개수</p>
      </article>
      <article class="stat-card">
        <p class="label">평균 평점</p>
        <p class="value">{{ stats.averageRating.toFixed(1) }}</p>
        <p class="hint">추천 영화의 평균 TMDB 점수</p>
      </article>
      <article class="stat-card">
        <p class="label">최근 추가</p>
        <p class="value">{{ stats.latestTitle || '-' }}</p>
        <p class="hint">{{ formattedLatest }}</p>
      </article>
    </section>

    <section class="toolbar" v-if="wishlist.length">
      <label class="input-field search">
        <span>검색</span>
        <div class="input-wrapper">
          <span class="icon">🔎</span>
          <input v-model="filters.search" type="text" placeholder="제목이나 줄거리로 검색" />
        </div>
      </label>

      <label class="input-field slider">
        <span>최소 평점: <strong>{{ filters.minRating.toFixed(1) }}+</strong></span>
        <input v-model.number="filters.minRating" type="range" min="0" max="10" step="0.5" />
      </label>

      <label class="input-field">
        <span>정렬 기준</span>
        <select v-model="filters.sortBy">
          <option value="recent">최근 추가 순</option>
          <option value="rating">평점 높은 순</option>
          <option value="title">제목 (A-Z)</option>
          <option value="release">개봉 최신 순</option>
        </select>
      </label>

      <div class="view-toggle">
        <span>보기</span>
        <div class="segmented">
          <button type="button" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">Grid</button>
          <button type="button" :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'">Table</button>
        </div>
      </div>
    </section>

    <div v-if="!filteredWishlist.length" class="empty-state">
      <p>검색 조건에 맞는 추천 영화가 없습니다. 필터를 조정하거나 새로운 영화를 추가해 보세요.</p>
      <RouterLink class="primary-link" to="/">홈으로 이동하기</RouterLink>
    </div>

    <div v-else>
      <div v-if="viewMode === 'grid'" class="wishlist-grid">
        <article v-for="movie in filteredWishlist" :key="movie.id" class="wishlist-card">
          <div class="poster">
            <img :src="getPoster(movie.poster_path)" :alt="movie.title" />
            <span class="badge">{{ formatDate(movie.addedAt) }} 저장</span>
          </div>
          <div class="info">
            <h2>{{ movie.title }}</h2>
            <p class="meta">
              ⭐ {{ movie.vote_average.toFixed(1) }} · {{ movie.release_date || '개봉일 정보 없음' }}
            </p>
            <p class="overview">
              {{ movie.overview || '간단한 소개 정보가 없습니다.' }}
            </p>
            <div class="card-actions">
              <button class="remove-btn" type="button" @click="removeFromWishlist(movie.id)">제거</button>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="wishlist-table">
        <table>
          <thead>
            <tr>
              <th>제목</th>
              <th>평점</th>
              <th>개봉일</th>
              <th>저장일</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="movie in filteredWishlist" :key="movie.id">
              <td>
                <p class="title">{{ movie.title }}</p>
                <p class="overview-sm">{{ truncate(movie.overview) }}</p>
              </td>
              <td>{{ movie.vote_average.toFixed(1) }}</td>
              <td>{{ movie.release_date || '정보 없음' }}</td>
              <td>{{ formatDate(movie.addedAt) }}</td>
              <td>
                <button class="remove-btn" type="button" @click="removeFromWishlist(movie.id)">제거</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <transition name="toast">
      <div v-if="toast.visible" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useWishlist, type WishlistMovie } from '../composables/useWishlist'

type ViewMode = 'grid' | 'table'
type SortOption = 'recent' | 'rating' | 'title' | 'release'
type ToastType = 'success' | 'error'

const { wishlist, stats, removeFromWishlist, clearWishlist, exportWishlist } = useWishlist()
const imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL as string

const viewMode = ref<ViewMode>('grid')
const filters = reactive({
  search: '',
  minRating: 0,
  sortBy: 'recent' as SortOption
})

const toast = reactive({
  visible: false,
  message: '',
  type: 'success' as ToastType
})

const filteredWishlist = computed(() => {
  let list = [...wishlist.value]

  if (filters.search.trim()) {
    const keyword = filters.search.trim().toLowerCase()
    list = list.filter(
      (movie) =>
        movie.title.toLowerCase().includes(keyword) ||
        (movie.overview ?? '').toLowerCase().includes(keyword)
    )
  }

  if (filters.minRating > 0) {
    list = list.filter((movie) => movie.vote_average >= filters.minRating)
  }

  const sorter: Record<SortOption, (a: WishlistMovie, b: WishlistMovie) => number> = {
    recent: (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    rating: (a, b) => b.vote_average - a.vote_average,
    title: (a, b) => a.title.localeCompare(b.title),
    release: (a, b) =>
      new Date(b.release_date || '1970-01-01').getTime() -
      new Date(a.release_date || '1970-01-01').getTime()
  }

  return list.sort(sorter[filters.sortBy])
})

const formattedLatest = computed(() => {
  if (!stats.value.latestAddedAt) return '-'
  return formatDate(stats.value.latestAddedAt)
})

function getPoster(posterPath: string | null) {
  if (!posterPath) return 'https://placehold.co/300x450?text=No+Image'
  return `${imageBaseUrl}${posterPath}`
}

function truncate(text: string | undefined, length = 80) {
  if (!text) return ''
  return text.length > length ? `${text.slice(0, length)}...` : text
}

function formatDate(date: string) {
  if (!date) return '정보 없음'
  return new Intl.DateTimeFormat('ko', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

function showToast(type: ToastType, message: string) {
  toast.type = type
  toast.message = message
  toast.visible = true
  setTimeout(() => (toast.visible = false), 2500)
}

async function copyWishlist() {
  try {
    await navigator.clipboard?.writeText(exportWishlist())
    showToast('success', 'JSON 데이터가 클립보드에 복사되었습니다.')
  } catch (error) {
    console.error(error)
    showToast('error', '복사에 실패했습니다. 브라우저 권한을 확인해주세요.')
  }
}

function handleClear() {
  if (confirm('위시리스트를 모두 삭제할까요?')) {
    clearWishlist()
    showToast('success', '리스트가 초기화되었습니다.')
  }
}
</script>

<style scoped>
.wishlist-page {
  padding: 96px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.wishlist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  flex-wrap: wrap;
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
  flex-wrap: wrap;
}

.ghost-btn {
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  padding: 10px 18px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: border 0.2s ease, color 0.2s ease;
}

.ghost-btn.danger {
  border-color: rgba(229, 9, 20, 0.7);
  color: #f78a8f;
}

.ghost-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-card .label {
  margin: 0;
  font-size: 13px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.stat-card .value {
  margin: 8px 0 0;
  font-size: 26px;
  font-weight: 700;
}

.stat-card .hint {
  margin: 6px 0 0;
  color: #888;
  font-size: 13px;
}

.toolbar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  align-items: end;
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #ddd;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.input-wrapper .icon {
  font-size: 15px;
}

input[type='text'],
select {
  width: 100%;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 14px;
}

input[type='range'] {
  width: 100%;
}

.view-toggle {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.segmented {
  display: inline-flex;
  border-radius: 999px;
  padding: 2px;
  background: rgba(255, 255, 255, 0.05);
  width: max-content;
}

.segmented button {
  border: none;
  background: transparent;
  color: #bbb;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
}

.segmented button.active {
  background: #e50914;
  color: #fff;
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

.poster {
  position: relative;
}

.poster img {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
}

.poster .badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
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

.card-actions {
  display: flex;
  gap: 12px;
}

.remove-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  color: #fff;
  padding: 6px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  border-color: #e50914;
  color: #e50914;
}

.wishlist-table {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-align: left;
}

th {
  font-size: 13px;
  color: #999;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.overview-sm {
  margin: 4px 0 0;
  color: #888;
  font-size: 12px;
}

.toast {
  position: fixed;
  bottom: 32px;
  right: 32px;
  background: rgba(0, 0, 0, 0.8);
  padding: 14px 18px;
  border-radius: 12px;
  border-left: 4px solid transparent;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}

.toast.success {
  border-left-color: #2ecc71;
}

.toast.error {
  border-left-color: #e50914;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
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
    justify-content: flex-start;
  }

  .ghost-btn {
    flex: 1;
    text-align: center;
  }
}
</style>
