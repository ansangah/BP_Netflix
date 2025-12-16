<template>
  <section class="popular-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Trending Now</p>
        <h1>대세 콘텐츠</h1>
        <p class="description">
          최근 TMDB에서 가장 핫한 작품들을 살펴보고, 테이블 또는 무한 스크롤 뷰로 탐색해 보세요.
        </p>
      </div>
      <div class="view-switch">
        <button
          class="switch-btn"
          :class="{ active: viewMode === 'table' }"
          type="button"
          @click="setView('table')"
        >
          Table View
        </button>
        <button
          class="switch-btn"
          :class="{ active: viewMode === 'infinite' }"
          type="button"
          @click="setView('infinite')"
        >
          Infinite Scroll
        </button>
      </div>
    </header>

    <div v-if="initialError" class="error-box">
      데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.<br />
      {{ initialError }}
    </div>

    <div v-else-if="!initialLoaded" class="loading-state">
      불러오는 중...
    </div>

    <template v-else>
      <div v-show="viewMode === 'table'" class="table-view">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th class="poster-col">포스터</th>
                <th>제목</th>
                <th>장르</th>
                <th class="rating-col">평점</th>
                <th class="detail-col" aria-label="상세 보기 버튼"></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="movie in tableMovies" :key="movie.id">
                <tr>
                  <td class="poster-cell">
                    <div class="poster-thumb">
                      <img
                        v-if="getPosterUrl(movie)"
                        :src="getPosterUrl(movie)"
                        :alt="movie.title"
                      />
                      <div v-else class="poster-placeholder">
                        이미지 없음
                      </div>
                    </div>
                  </td>
                  <td>
                    <p class="title">{{ movie.title }}</p>
                  </td>
                  <td>{{ formatGenres(movie.genre_ids) }}</td>
                  <td class="rating-cell">
                    {{ movie.vote_average.toFixed(1) }}
                  </td>
                  <td class="detail-btn-cell">
                    <button
                      class="detail-toggle"
                      type="button"
                      :aria-expanded="expandedMovieId === movie.id"
                      :aria-label="`${movie.title} 상세 설명 ${expandedMovieId === movie.id ? '숨기기' : '보기'}`"
                      @click="toggleDetails(movie.id)"
                    >
                      {{ expandedMovieId === movie.id ? '↓' : '→' }}
                    </button>
                  </td>
                </tr>
                <tr
                  v-if="expandedMovieId === movie.id"
                  :key="`${movie.id}-detail`"
                  class="detail-row"
                >
                  <td colspan="5">
                    <p class="detail-release">
                      개봉일: {{ formatDate(movie.release_date) }}
                    </p>
                    <p class="detail-overview">
                      {{ movie.overview || fallbackOverview }}
                    </p>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div v-if="tableLoading" class="table-loading">페이지 로딩 중...</div>
        <div class="pagination">
          <button type="button" @click="changeTablePage(tablePage - 1)" :disabled="tablePage <= 1 || tableLoading">
            이전
          </button>
          <span>{{ tablePage }} / {{ tableTotalPages }}</span>
          <button
            type="button"
            @click="changeTablePage(tablePage + 1)"
            :disabled="tablePage >= tableTotalPages || tableLoading"
          >
            다음
          </button>
        </div>
      </div>

      <div v-show="viewMode === 'infinite'" class="infinite-view">
        <div class="card-grid">
          <MovieCard
            v-for="movie in infiniteMovies"
            :key="movie.id"
            :movie="movie"
          />
        </div>
        <div class="infinite-indicator">
          <div v-if="isLoadingMore" class="loading-more">더 불러오는 중...</div>
          <p v-else-if="!hasMore" class="end-message">모든 콘텐츠를 확인했습니다.</p>
        </div>
        <div ref="sentinelRef" class="sentinel"></div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MovieCard from '../components/movies/MovieCard.vue'
import {
  fetchMovieGenres,
  fetchPopularMovies,
  type Genre,
  type Movie
} from '../composables/useTmdb'
import { useAuth } from '../composables/useAuth'

type ViewMode = 'table' | 'infinite'

const viewMode = ref<ViewMode>('table')
const genres = ref<Genre[]>([])
const genresMap = computed(() =>
  genres.value.reduce<Record<number, string>>((acc, genre) => {
    acc[genre.id] = genre.name
    return acc
  }, {})
)

const initialLoaded = ref(false)
const initialError = ref('')

// Table view state
const tableMovies = ref<Movie[]>([])
const tablePage = ref(1)
const tableTotalPages = ref(1)
const tableLoading = ref(false)

// Infinite view state
const infiniteMovies = ref<Movie[]>([])
const infinitePage = ref(1)
const infiniteTotalPages = ref(1)
const isLoadingMore = ref(false)
const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const hasMore = computed(() => infinitePage.value <= infiniteTotalPages.value)
const fallbackOverview =
  "실직한 가장 '벤 리처즈'가 거액의 상금을 위해 30일간 잔인한 추격자들로부터 살아남아야 하는 글로벌 서바이벌 프로그램에 참가하며 펼쳐지는 추격..."

const expandedMovieId = ref<number | null>(null)

function toggleDetails(movieId: number) {
  expandedMovieId.value = expandedMovieId.value === movieId ? null : movieId
}

const imageBaseUrl =
  (import.meta.env.VITE_TMDB_IMAGE_BASE_URL as string) ||
  'https://image.tmdb.org/t/p/w500'
const { tmdbKey } = useAuth()

function getPosterUrl(movie: Movie) {
  if (!imageBaseUrl) return ''
  return movie.poster_path ? `${imageBaseUrl}${movie.poster_path}` : ''
}

async function bootstrap() {
  try {
    const [genreList, firstPage] = await Promise.all([
      fetchMovieGenres(),
      fetchPopularMovies(1)
    ])
    genres.value = genreList

    applyTableData(firstPage)
    resetInfinite(firstPage)
    initialLoaded.value = true
  } catch (error) {
    console.error(error)
    initialError.value = error instanceof Error ? error.message : String(error)
  }
}

watch(
  tmdbKey,
  (key, previous) => {
    if (!key || key === previous) return
    bootstrap()
  }
)

function applyTableData(payload: { results: Movie[]; page: number; total_pages: number }) {
  tableMovies.value = payload.results
  tablePage.value = payload.page
  tableTotalPages.value = Math.min(payload.total_pages, 100)
}

function resetInfinite(payload: { results: Movie[]; page: number; total_pages: number }) {
  infiniteMovies.value = payload.results
  infinitePage.value = payload.page + 1
  infiniteTotalPages.value = payload.total_pages
}

async function changeTablePage(page: number) {
  if (page < 1 || page > tableTotalPages.value || tableLoading.value) return

  try {
    tableLoading.value = true
    const data = await fetchPopularMovies(page)
    applyTableData(data)
  } catch (error) {
    console.error('table page fetch error', error)
  } finally {
    tableLoading.value = false
  }
}

async function loadMoreInfinite() {
  if (!hasMore.value || isLoadingMore.value) return
  try {
    isLoadingMore.value = true
    const data = await fetchPopularMovies(infinitePage.value)
    infiniteMovies.value = [...infiniteMovies.value, ...data.results]
    infinitePage.value = data.page + 1
    infiniteTotalPages.value = data.total_pages
  } catch (error) {
    console.error('infinite fetch error', error)
  } finally {
    isLoadingMore.value = false
  }
}

function createObserver() {
  if (observer || !sentinelRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadMoreInfinite()
        }
      })
    },
    { threshold: 0.5 }
  )
  observer.observe(sentinelRef.value)
}

function destroyObserver() {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

function setView(mode: ViewMode) {
  viewMode.value = mode
}

function formatGenres(ids?: number[]) {
  if (!ids?.length) return '장르 정보 없음'
  return ids.map((id) => genresMap.value[id]).filter(Boolean).join(', ') || '장르 정보 없음'
}

function formatDate(date: string) {
  if (!date) return '정보 없음'
  return new Intl.DateTimeFormat('ko', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

watch(
  () => viewMode.value,
  async (mode) => {
    if (mode === 'infinite') {
      await nextTick()
      createObserver()
    } else {
      destroyObserver()
    }
  }
)

watch(
  () => sentinelRef.value,
  () => {
    if (viewMode.value === 'infinite') {
      nextTick(() => createObserver())
    }
  }
)

watch(
  () => hasMore.value,
  (more) => {
    if (!more) destroyObserver()
  }
)

onMounted(async () => {
  await bootstrap()
  if (viewMode.value === 'infinite') {
    createObserver()
  }
})

onBeforeUnmount(() => {
  destroyObserver()
})
</script>

<style scoped>
.popular-page {
  padding: 96px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.eyebrow {
  color: #e50914;
  letter-spacing: 0.3em;
  font-size: 12px;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(32px, 5vw, 48px);
}

.view-switch {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 999px;
  padding: 4px;
  gap: 4px;
}

.switch-btn {
  border: none;
  background: transparent;
  color: #bbb;
  padding: 10px 20px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease, color 0.2s ease;
}

.switch-btn.active {
  background: #e50914;
  color: #fff;
}

.error-box,
.loading-state {
  padding: 40px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  text-align: center;
}

.table-view {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.table-wrapper {
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th,
td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

th {
  font-weight: 600;
  color: #ccc;
  font-size: 13px;
  letter-spacing: 0.05em;
}

.poster-col {
  width: 96px;
}

.poster-cell {
  padding: 10px 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-col {
  width: 80px;
}

.rating-cell {
  font-weight: 600;
  font-size: 16px;
  text-align: right;
}

.detail-col {
  width: 60px;
}

.detail-btn-cell {
  text-align: center;
}

.detail-toggle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.detail-toggle:hover,
.detail-toggle:focus-visible {
  border-color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

.detail-row td {
  background: rgba(255, 255, 255, 0.02);
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-release {
  font-size: 13px;
  color: #ccc;
  margin: 0 0 6px;
}

.detail-overview {
  margin: 0;
  color: #bbb;
  font-size: 13px;
  line-height: 1.5;
}

.poster-thumb {
  width: 96px;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  background: #0f0f0f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.poster-placeholder {
  font-size: 11px;
  color: #777;
  text-align: center;
  padding: 8px;
}

.table-loading {
  margin-top: 12px;
  text-align: center;
  color: #ccc;
}

.pagination {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.pagination button {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: transparent;
  color: #fff;
  padding: 6px 12px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.infinite-view .card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 18px;
}

.loading-more,
.end-message {
  text-align: center;
  margin-top: 20px;
  color: #bbb;
}

.sentinel {
  height: 1px;
}

@media (max-width: 768px) {
  .popular-page {
    padding: 96px 16px 48px;
  }

  .table-view {
    padding: 16px;
  }

  th,
  td {
    padding: 12px 8px;
  }
}
.description {
  color: #aaa;
  max-width: 520px;
  margin-top: 12px;
}
</style>
