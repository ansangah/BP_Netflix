import { computed, ref } from 'vue'
import type { Movie } from './useTmdb'

const WISHLIST_KEY = 'movieWishlist'

export type WishlistMovie = Pick<
  Movie,
  'id' | 'title' | 'poster_path' | 'vote_average' | 'release_date' | 'overview'
>

const wishlist = ref<WishlistMovie[]>(loadWishlist())

function loadWishlist(): WishlistMovie[] {
  const raw = localStorage.getItem(WISHLIST_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as WishlistMovie[]
  } catch (error) {
    console.warn('위시리스트를 불러오는데 실패했습니다.', error)
    return []
  }
}

function persistWishlist() {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist.value))
}

function mapMovie(movie: Movie): WishlistMovie {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
    overview: movie.overview
  }
}

export function useWishlist() {
  function toggleWishlist(movie: Movie) {
    const index = wishlist.value.findIndex((item) => item.id === movie.id)
    if (index === -1) {
      wishlist.value.push(mapMovie(movie))
    } else {
      wishlist.value.splice(index, 1)
    }
    persistWishlist()
  }

  function removeFromWishlist(movieId: number) {
    const index = wishlist.value.findIndex((item) => item.id === movieId)
    if (index !== -1) {
      wishlist.value.splice(index, 1)
      persistWishlist()
    }
  }

  function clearWishlist() {
    wishlist.value = []
    persistWishlist()
  }

  return {
    wishlist: computed(() => wishlist.value),
    isWishlisted: (movieId: number) => wishlist.value.some((item) => item.id === movieId),
    toggleWishlist,
    removeFromWishlist,
    clearWishlist
  }
}
