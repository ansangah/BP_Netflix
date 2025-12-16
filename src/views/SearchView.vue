<template>
  <section class="search-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Explore</p>
        <h1>찾아보기</h1>
        <p class="description">
          TMDB 데이터베이스에서 원하는 영화를 검색하거나 장르, 평점, 정렬 기준을 조합해 내 취향의 작품을 탐색하세요.
        </p>
      </div>
      <button class="reset-btn" type="button" @click="resetFilters">
        초기화
      </button>
    </header>

    <div class="filters">
      <label class="input-field">
        <span>영화 검색</span>
        <div class="input-wrapper">
          <span class="icon">🔍</span>
          <input
            v-model="filters.keyword"
            type="text"
            placeholder="제목 또는 키워드를 입력하세요"
          />
        </div>
      </label>

      <label class="input-field">
        <span>장르</span>
        <select v-model="filters.genre">
          <option value="">전체</option>
          <option v-for="genre in genres" :key="genre.id" :value="String(genre.id)">
            {{ genre.name }}
          </option>
        </select>
      </label>

      <label class="input-field">
        <span>평점 이상</span>
        <input v-model.number="filters.minVote" type="number" min="0" max="10" step="0.5" />
      </label>

      <label class="input-field">
        <span>정렬 기준</span>
        <select v-model="filters.sort">
          <option value="popularity.desc">인기순</option>
          <option value="vote_average.desc">평점 높은 순</option>
          <option value="release_date.desc">최신 개봉 순</option>
          <option value="release_date.asc">오래된 순</option>
          <option value="original_title.asc">제목 (A-Z)</option>
        </select>
      </label>

      <label class="input-field">
        <span>개봉 연도</span>
        <input v-model.number="filters.year" type="number" min="1950" max="2030" placeholder="예: 2024" />
      </label>
    </div>

    <div class="results-area">
      <div v-if="isLoading" class="loading">검색 중입니다...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!movies.length" class="empty">
        조건에 맞는 영화가 없습니다.<br />
        검색어나 필터를 바꿔보세요.
      </div>

      <div v-else class="movies-grid">
        <MovieCard
          v-for="movie in movies"
          :key="movie.id"
          :movie="movie"
        />
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button type="button" @click="goPage(currentPage - 1)" :disabled="currentPage <= 1 || isLoading">
        이전
      </button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button type="button" @click="goPage(currentPage + 1)" :disabled="currentPage >= totalPages || isLoading">
        다음
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import MovieCard from '../components/movies/MovieCard.vue'
import {
  discoverMovies,
  fetchMovieGenres,
  searchMovies,
  type Genre,
  type Movie
} from '../composables/useTmdb'
import { useAuth } from '../composables/useAuth'

const genres = ref<Genre[]>([])
const movies = ref<Movie[]>([])
const totalPages = ref(1)
const currentPage = ref(1)
const error = ref('')
const isLoading = ref(false)

const filters = reactive({
  keyword: '',
  genre: '',
  minVote: 0,
  sort: 'popularity.desc',
  year: undefined as number | undefined
})

const queryPayload = computed(() => ({
  keyword: filters.keyword.trim(),
  genre: filters.genre,
  minVote: filters.minVote,
  sort: filters.sort,
  year: filters.year
}))

async function fetchGenres() {
  try {
    genres.value = await fetchMovieGenres()
  } catch (err) {
    console.error('장르를 가져오지 못했습니다.', err)
  }
}

async function fetchMovies(page = 1) {
  try {
    isLoading.value = true
    error.value = ''
    let response

    if (queryPayload.value.keyword) {
      response = await searchMovies(queryPayload.value.keyword, page)
    } else {
      response = await discoverMovies({
        with_genres: queryPayload.value.genre || undefined,
        sort_by: queryPayload.value.sort,
        'vote_average.gte': queryPayload.value.minVote || undefined,
        year: queryPayload.value.year || undefined,
        page
      })
    }

    movies.value = response.results
    totalPages.value = Math.min(response.total_pages, 100)
    currentPage.value = response.page
  } catch (err) {
    console.error(err)
    error.value = '영화 데이터를 불러오는데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

function goPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  fetchMovies(page)
}

function resetFilters() {
  filters.keyword = ''
  filters.genre = ''
  filters.minVote = 0
  filters.sort = 'popularity.desc'
  filters.year = undefined
}

watch(
  () => ({ ...queryPayload.value }),
  () => {
    currentPage.value = 1
    fetchMovies(1)
  }
)

onMounted(async () => {
  await fetchGenres()
  fetchMovies()
})

const { tmdbKey } = useAuth()

watch(
  tmdbKey,
  (key, previous) => {
    if (!key || key === previous) return
    fetchGenres()
    fetchMovies()
  }
)
</script>

<style scoped>
.search-page {
  padding: 96px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.description {
  color: #aaa;
  max-width: 540px;
  margin-top: 12px;
}

.reset-btn {
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: #fff;
  border-radius: 999px;
  padding: 10px 24px;
  cursor: pointer;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  padding: 24px;
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
  font-size: 16px;
}

input,
select {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  padding: 12px 16px;
  font-size: 14px;
  font-family: inherit;
}

input:focus,
select:focus {
  outline: none;
  border-color: #e50914;
}

.results-area {
  min-height: 240px;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 48px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  color: #bbb;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.pagination button {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #fff;
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .search-page {
    padding: 96px 16px 48px;
  }

  .filters {
    padding: 16px;
    border-radius: 18px;
  }
}
</style>
