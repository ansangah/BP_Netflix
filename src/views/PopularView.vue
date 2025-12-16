<template>
  <section class="popular-page">
    <header class="page-header">
      <div class="heading">
        <p class="eyebrow">Trending Now</p>
        <h1>대세 콘텐츠</h1>
        <p class="description">
          최근 TMDB에서 가장 핫한 작품들을 살펴보고, 테이블 또는 무한 스크롤 뷰로 탐색해 보세요.
        </p>
      </div>
      <div class="controls-row">
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
        <div v-if="viewMode === 'table'" class="pagination inline">
          <button
            type="button"
            @click="changeTablePage(tablePage - 1)"
            :disabled="tablePage <= 1 || tableLoading"
          >
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
    </header>

    <div v-if="initialError" class="error-box">
      데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.<br />
      {{ initialError }}
    </div>

    <div v-else-if="!initialLoaded" class="loading-state">
      불러오는 중...
    </div>

    <template v-else>
      <div v-if="viewMode === 'table'" ref="tableViewRef" class="table-view">
        <div class="grid-view">
          <article
            v-for="movie in gridMovies"
            :key="movie.id"
            class="grid-card"
            :class="{ 'is-expanded': expandedMovieId === movie.id }"
            @click="toggleDetails(movie.id)"
            @keyup.enter.space.prevent="toggleDetails(movie.id)"
            tabindex="0"
          >
            <div class="grid-poster">
              <img
                v-if="getPosterUrl(movie)"
                :src="getPosterUrl(movie)"
                :alt="movie.title"
              />
              <div v-else class="poster-placeholder">
                이미지 없음
              </div>
            </div>
            <div class="grid-overlay">
              <div class="overlay-content">
                <h3>{{ movie.title }}</h3>
                <p class="overlay-meta">
                  ⭐ {{ movie.vote_average.toFixed(1) }} · {{ formatDate(movie.release_date) }}
                </p>
                <p class="overlay-genres">{{ formatGenres(movie.genre_ids) }}</p>
                <p>{{ movie.overview || fallbackOverview }}</p>
              </div>
            </div>
          </article>
        </div>
        <div v-if="tableLoading" class="table-loading">페이지 로딩 중...</div>
      </div>

      <div v-else class="infinite-view">
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

const tableColumns = ref(5)
const tableRows = 2
const minCardWidth = 180
const gridMovies = computed(() =>
  tableMovies.value.slice(0, Math.max(tableColumns.value * tableRows, tableRows))
)

// Infinite view state
const infiniteMovies = ref<Movie[]>([])
const infinitePage = ref(1)
const infiniteTotalPages = ref(1)
const isLoadingMore = ref(false)
const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
const tableViewRef = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null

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

function setBodyOverflow(value: string) {
  if (typeof document === 'undefined') return
  document.body.style.overflow = value
}

function disableBodyScroll() {
  setBodyOverflow('hidden')
}

function enableBodyScroll() {
  setBodyOverflow('')
}

function getPosterUrl(movie: Movie) {
  if (!imageBaseUrl) return ''
  return movie.poster_path ? `${imageBaseUrl}${movie.poster_path}` : ''
}

function updateColumnCount() {
  if (!tableViewRef.value) return
  const padding = 40
  const gap = 8
  const availableWidth = Math.max(tableViewRef.value.clientWidth - padding, minCardWidth)
  const columns = Math.max(Math.floor((availableWidth + gap) / (minCardWidth + gap)), 1)
  tableColumns.value = columns
}

function observeTableSize() {
  if (typeof ResizeObserver === 'undefined' || resizeObserver || !tableViewRef.value) return
  resizeObserver = new ResizeObserver(() => {
    updateColumnCount()
  })
  resizeObserver.observe(tableViewRef.value)
}

function disconnectTableObserver() {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
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
      enableBodyScroll()
      await nextTick()
      createObserver()
    } else {
      disableBodyScroll()
      destroyObserver()
    }
  },
  { immediate: true }
)

watch(
  () => tableViewRef.value,
  (el) => {
    if (el) {
      nextTick(() => {
        updateColumnCount()
        observeTableSize()
      })
    } else {
      disconnectTableObserver()
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
  enableBodyScroll()
  disconnectTableObserver()
})
</script>

<style scoped>
.popular-page {
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100vh;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
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

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
}

.pagination.inline {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
}

.pagination.inline span {
  font-weight: 600;
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
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow: hidden;
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 180px));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  gap: 10px;
  height: 100%;
  justify-items: stretch;
  justify-content: center;
}

.grid-card {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  max-height: 260px;
  transition: transform 0.3s ease;
}

.grid-card:hover {
  transform: translateY(-4px);
}

.grid-poster {
  width: 100%;
  aspect-ratio: 3 / 4;
  background: #111;
  flex: 1;
  min-height: 0;
}

.grid-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.95));
  padding: 16px;
  display: flex;
  align-items: flex-start;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.grid-card.is-expanded .grid-overlay,
.grid-card:hover .grid-overlay {
  opacity: 1;
  pointer-events: auto;
}

.overlay-content {
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.overlay-content h3 {
  margin: 0;
  font-size: 16px;
}

.overlay-content p {
  margin: 0;
  font-size: 12px;
  color: #ccc;
  line-height: 1.4;
}

.overlay-genres {
  font-size: 12px;
  color: #bbb;
}

.grid-wrapper {
  overflow: hidden;
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

@media (max-width: 1200px) {
  .grid-view {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .grid-view {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .grid-view {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 576px) {
  .grid-view {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
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
    padding: 64px 16px 32px;
  }

  .table-view {
    padding: 16px;
    gap: 12px;
  }
}
.description {
  color: #aaa;
  max-width: 520px;
  margin-top: 0;
}
</style>
