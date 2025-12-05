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
                <th>제목</th>
                <th>개봉일</th>
                <th>평점</th>
                <th>장르</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="movie in tableMovies" :key="movie.id">
                <td>
                  <p class="title">{{ movie.title }}</p>
                  <p class="overview">{{ truncate(movie.overview) }}</p>
                </td>
                <td>{{ formatDate(movie.release_date) }}</td>
                <td>{{ movie.vote_average.toFixed(1) }}</td>
                <td>{{ formatGenres(movie.genre_ids) }}</td>
              </tr>
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
        <button v-show="showTopButton" class="top-btn" type="button" @click="scrollToTop">Top</button>
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

const showTopButton = ref(false)

const hasMore = computed(() => infinitePage.value <= infiniteTotalPages.value)

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

function truncate(text: string, length = 80) {
  if (!text) return '줄거리 정보가 없습니다.'
  return text.length > length ? `${text.slice(0, length)}...` : text
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

function handleScroll() {
  showTopButton.value = window.scrollY > 400 && viewMode.value === 'infinite'
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  () => viewMode.value,
  async (mode) => {
    if (mode === 'infinite') {
      await nextTick()
      createObserver()
      handleScroll()
    } else {
      destroyObserver()
      showTopButton.value = false
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
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  if (viewMode.value === 'infinite') {
    createObserver()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
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

.description {
  color: #aaa;
  max-width: 520px;
  margin-top: 12px;
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

td .title {
  margin: 0;
  font-weight: 600;
}

td .overview {
  margin: 4px 0 0;
  color: #888;
  font-size: 12px;
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

.top-btn {
  position: fixed;
  bottom: 32px;
  right: 32px;
  border: none;
  background: rgba(229, 9, 20, 0.85);
  color: #fff;
  border-radius: 999px;
  padding: 12px 24px;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
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
</style>
