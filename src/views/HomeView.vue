<!-- src/views/HomeView.vue -->
<template>
  <div class="home">
    <MovieList
      title="인기 영화"
      :movies="popular"
      :loading="loading"
    />
    <MovieList
      title="현재 상영작"
      :movies="nowPlaying"
      :loading="loading"
    />
    <MovieList
      title="개봉 예정작"
      :movies="upcoming"
      :loading="loading"
    />
    <MovieList
      title="높은 평점"
      :movies="topRated"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import MovieList from '../components/movies/MovieList.vue'
import {
  fetchPopularMovies,
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
  fetchTopRatedMovies,
  type Movie
} from '../composables/useTmdb'

const popular = ref<Movie[]>([])
const nowPlaying = ref<Movie[]>([])
const upcoming = ref<Movie[]>([])
const topRated = ref<Movie[]>([])
const loading = ref<boolean>(false)

onMounted(async () => {
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
</script>

<style scoped>
.home {
  padding: 24px;
}
</style>