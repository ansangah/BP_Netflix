// src/composables/useTmdb.ts
import axios from 'axios'

const apiKey = import.meta.env.VITE_TMDB_API_KEY as string
const baseUrl = import.meta.env.VITE_TMDB_BASE_URL as string

if (!apiKey || !baseUrl) {
  console.warn('TMDB 환경변수(VITE_TMDB_API_KEY, VITE_TMDB_BASE_URL)가 설정되지 않았습니다.')
}

export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date: string
  genre_ids?: number[]
}

export interface Genre {
  id: number
  name: string
}

interface TmdbListResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

const tmdb = axios.create({
  baseURL: baseUrl,
  params: {
    api_key: apiKey,
    language: 'ko-KR'
  }
})

export async function fetchPopularMovies(page = 1): Promise<TmdbListResponse> {
  const { data } = await tmdb.get<TmdbListResponse>('/movie/popular', {
    params: { page }
  })
  return data
}

export async function fetchNowPlayingMovies(page = 1): Promise<TmdbListResponse> {
  const { data } = await tmdb.get<TmdbListResponse>('/movie/now_playing', {
    params: { page }
  })
  return data
}

export async function fetchTopRatedMovies(page = 1): Promise<TmdbListResponse> {
  const { data } = await tmdb.get<TmdbListResponse>('/movie/top_rated', {
    params: { page }
  })
  return data
}

export async function fetchUpcomingMovies(page = 1): Promise<TmdbListResponse> {
  const { data } = await tmdb.get<TmdbListResponse>('/movie/upcoming', {
    params: { page }
  })
  return data
}

interface GenreResponse {
  genres: Genre[]
}

export async function fetchMovieGenres(): Promise<Genre[]> {
  const { data } = await tmdb.get<GenreResponse>('/genre/movie/list')
  return data.genres
}

interface DiscoverOptions {
  with_genres?: string
  sort_by?: string
  'vote_average.gte'?: number
  'vote_average.lte'?: number
  with_original_language?: string
  year?: number
  page?: number
}

export async function discoverMovies(options: DiscoverOptions = {}): Promise<TmdbListResponse> {
  const { data } = await tmdb.get<TmdbListResponse>('/discover/movie', {
    params: options
  })
  return data
}

export async function searchMovies(query: string, page = 1): Promise<TmdbListResponse> {
  const { data } = await tmdb.get<TmdbListResponse>('/search/movie', {
    params: { query, page, include_adult: false }
  })
  return data
}
