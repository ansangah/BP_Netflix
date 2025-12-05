import { computed, ref } from 'vue'
import type { Movie } from './useTmdb'

const WISHLIST_KEY = 'movieWishlist'

export type WishlistMovie = Pick<
  Movie,
  'id' | 'title' | 'poster_path' | 'vote_average' | 'release_date' | 'overview'
> & {
  addedAt: string
}

interface WishlistStats {
  total: number
  averageRating: number
  latestTitle: string
  latestAddedAt: string
}

const wishlist = ref<WishlistMovie[]>(loadWishlist())

function loadWishlist(): WishlistMovie[] {
  const raw = localStorage.getItem(WISHLIST_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as WishlistMovie[]
    return parsed.map((item) => ({
      ...item,
      addedAt: item.addedAt ?? new Date().toISOString()
    }))
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
    overview: movie.overview,
    addedAt: new Date().toISOString()
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

  function exportWishlist() {
    return JSON.stringify(wishlist.value, null, 2)
  }

  function replaceWishlist(nextList: WishlistMovie[]) {
    wishlist.value = nextList
    persistWishlist()
  }

  const stats = computed<WishlistStats>(() => {
    const total = wishlist.value.length
    const averageRating = total
      ? Number((wishlist.value.reduce((sum, item) => sum + (item.vote_average || 0), 0) / total).toFixed(1))
      : 0
    const latest = [...wishlist.value].sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    )[0]
    return {
      total,
      averageRating,
      latestTitle: latest?.title ?? '',
      latestAddedAt: latest?.addedAt ?? ''
    }
  })

  return {
    wishlist: computed(() => wishlist.value),
    stats,
    isWishlisted: (movieId: number) => wishlist.value.some((item) => item.id === movieId),
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    exportWishlist,
    replaceWishlist
  }
}
