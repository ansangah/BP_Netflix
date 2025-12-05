<template>
  <div class="home">
    <section v-if="featuredMovie" class="hero" :style="heroStyle">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="hero-kicker">지금 뜨는 콘텐츠</p>
        <h1>{{ featuredMovie.title }}</h1>
        <p class="hero-overview">
          {{ heroOverview }}
        </p>
        <div class="hero-meta">
          <span>⭐ {{ featuredMovie.vote_average.toFixed(1) }}</span>
          <span>{{ formatDate(featuredMovie.release_date) }}</span>
        </div>
        <div class="hero-actions">
          <button class="primary" type="button" @click="scrollToCollections">
            컬렉션 보기
          </button>
          <button class="secondary" type="button" @click="handleHeroWishlist">
            {{ heroWishlistLabel }}
          </button>
        </div>
      </div>
    </section>

    <section v-if="stats.length" class="stats">
      <article
        v-for="stat in stats"
        :key="stat.title"
        class="stat-card"
        role="button"
        tabindex="0"
        @click="scrollToSection(stat.target)"
        @keyup.enter="scrollToSection(stat.target)"
      >
        <p class="value">{{ stat.title }}</p>
        <p class="label">{{ stat.subtitle }}</p>
      </article>
    </section>

    <div ref="collectionsRef" class="collections">
      <section ref="popularSection" class="collection-block">
        <MovieList
          title="인기 영화"
          :movies="popular"
          :loading="loading"
          :limit="sectionLimit"
          @see-more="() => goTo('/popular')"
        />
      </section>
      <section ref="nowPlayingSection" class="collection-block">
        <MovieList
          title="현재 상영작"
          :movies="nowPlaying"
          :loading="loading"
          :limit="sectionLimit"
          @see-more="() => goTo('/popular')"
        />
      </section>
      <section ref="upcomingSection" class="collection-block">
        <MovieList
          title="개봉 예정작"
          :movies="upcoming"
          :loading="loading"
          :limit="sectionLimit"
          @see-more="() => goTo('/popular')"
        />
      </section>
      <section ref="topRatedSection" class="collection-block">
        <MovieList
          title="높은 평점"
          :movies="topRated"
          :loading="loading"
          :limit="sectionLimit"
          @see-more="() => goTo('/popular')"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MovieList from '../components/movies/MovieList.vue'
import {
  fetchPopularMovies,
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
  fetchTopRatedMovies,
  type Movie
} from '../composables/useTmdb'
import { useWishlist } from '../composables/useWishlist'

const popular = ref<Movie[]>([])
const nowPlaying = ref<Movie[]>([])
const upcoming = ref<Movie[]>([])
const topRated = ref<Movie[]>([])
const loading = ref<boolean>(false)
const collectionsRef = ref<HTMLElement | null>(null)
const popularSection = ref<HTMLElement | null>(null)
const nowPlayingSection = ref<HTMLElement | null>(null)
const upcomingSection = ref<HTMLElement | null>(null)
const topRatedSection = ref<HTMLElement | null>(null)
const viewportWidth = ref(
  typeof window === 'undefined' ? 1440 : window.innerWidth
)
const updateViewport = () => {
  if (typeof window === 'undefined') return
  viewportWidth.value = window.innerWidth
}

const router = useRouter()
const { toggleWishlist, isWishlisted } = useWishlist()
const imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL as string

const featuredMovie = computed(() => nowPlaying.value[0] ?? popular.value[0] ?? null)

const heroStyle = computed(() => {
  const movie = featuredMovie.value
  if (!movie) return {}
  const backgroundPath = movie.backdrop_path || movie.poster_path
  if (!backgroundPath) return {}
  return {
    backgroundImage: `url(${imageBaseUrl}${backgroundPath})`
  }
})

const heroOverview = computed(() => {
  const overview = featuredMovie.value?.overview ?? '선택된 영화의 줄거리가 준비 중입니다.'
  return overview.length > 160 ? `${overview.slice(0, 160)}...` : overview
})

const heroWishlistLabel = computed(() => {
  const movie = featuredMovie.value
  if (!movie) return '추천 등록'
  return isWishlisted(movie.id) ? '추천 해제' : '추천 등록'
})

type SectionKey = 'popular' | 'nowPlaying' | 'upcoming' | 'topRated'

const stats = computed(() => {
  return [
    { title: '인기 콘텐츠', subtitle: '라인업 둘러보기', target: 'popular' as SectionKey },
    { title: '현재 상영작', subtitle: '상영 중인 작품', target: 'nowPlaying' as SectionKey },
    { title: '곧 개봉 예정', subtitle: '예정작 미리보기', target: 'upcoming' as SectionKey },
    { title: '평점 8.0+ 작품', subtitle: '떠오르는 추천작', target: 'topRated' as SectionKey }
  ]
})

const sectionLimit = computed(() => {
  const width = viewportWidth.value
  if (width >= 1600) return 14
  if (width >= 1280) return 12
  if (width >= 1024) return 10
  if (width >= 768) return 8
  return 6
})

onMounted(async () => {
  updateViewport()
  window.addEventListener('resize', updateViewport)

  try {
    loading.value = true

    const [popularRes, nowPlayingRes, upcomingRes, topRatedRes] =
      await Promise.all([
        fetchPopularMovies(),
        fetchNowPlayingMovies(),
        fetchUpcomingMovies(),
        fetchTopRatedMovies()
      ])

    popular.value = popularRes.results
    nowPlaying.value = nowPlayingRes.results
    upcoming.value = upcomingRes.results
    topRated.value = topRatedRes.results
  } catch (error) {
    console.error('TMDB 호출 오류:', error)
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', updateViewport)
})

function scrollToCollections() {
  collectionsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToSection(target?: SectionKey) {
  const map: Record<SectionKey, typeof popularSection> = {
    popular: popularSection,
    nowPlaying: nowPlayingSection,
    upcoming: upcomingSection,
    topRated: topRatedSection
  }
  if (!target) return
  map[target].value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleHeroWishlist() {
  if (featuredMovie.value) {
    toggleWishlist(featuredMovie.value)
  }
}

function goTo(path: string) {
  router.push(path)
}

function formatDate(date: string) {
  if (!date) return '개봉일 정보 없음'
  return new Intl.DateTimeFormat('ko', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}
</script>

<style scoped>
.home {
  padding: 32px 32px 64px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  background: radial-gradient(circle at top, rgba(229, 9, 20, 0.12), transparent 55%);
}

.hero {
  position: relative;
  min-height: 420px;
  border-radius: 32px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 40px;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000 100%);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, rgba(0, 0, 0, 0.2), transparent 50%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-kicker {
  font-size: 12px;
  letter-spacing: 0.3em;
  color: #e50914;
  margin: 0;
  text-transform: uppercase;
}

.hero-overview {
  color: #ddd;
  line-height: 1.6;
  margin: 0;
}

.hero-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #bbb;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.primary,
.secondary {
  border-radius: 999px;
  padding: 12px 24px;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary {
  border: none;
  background: linear-gradient(120deg, #e50914, #f40612);
  color: #fff;
}

.secondary {
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: transparent;
  color: #fff;
}

.primary:hover,
.secondary:hover {
  transform: translateY(-2px);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 18px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.stat-card {
  padding: 26px;
  border-radius: 28px;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: box-shadow 0.2s ease, border 0.2s ease;
}

.stat-card:hover {
  border-color: rgba(229, 9, 20, 0.4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
}

.value {
  font-size: 18px;
  margin: 0;
  font-weight: 700;
}

.label {
  margin: 6px 0 0;
  color: #aaa;
  font-size: 13px;
}

.collections {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

@media (max-width: 768px) {
  .home {
    padding: 24px 16px 48px;
  }

  .hero {
    padding: 28px;
    min-height: 360px;
  }

  .hero-content {
    max-width: 100%;
  }

  .stats {
    grid-template-columns: repeat(4, minmax(220px, 260px));
  }
}
</style>
