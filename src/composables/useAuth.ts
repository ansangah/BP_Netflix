import { computed, reactive, ref } from 'vue'

const USERS_KEY = 'wsd-users'
const AUTH_USER_KEY = 'wsd-auth-user'
const REMEMBER_EMAIL_KEY = 'wsd-remember-email'
const TMDB_KEY_STORAGE = 'TMDb-Key'

export interface StoredUser {
  id: string
  password: string
  createdAt: string
}

interface AuthResult {
  ok: boolean
  message?: string
}

const users = ref<StoredUser[]>(loadUsers())
const currentUser = ref<StoredUser | null>(loadCurrentUser())
const rememberedEmail = ref<string>(loadRememberedEmail())

function loadUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as StoredUser[]
  } catch (error) {
    console.warn('저장된 사용자 정보를 불러오는데 실패했습니다.', error)
    return []
  }
}

function loadCurrentUser(): StoredUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY)
  if (!raw) return null
  try {
    const user = JSON.parse(raw) as StoredUser
    if (user?.password) {
      localStorage.setItem(TMDB_KEY_STORAGE, user.password)
    }
    return user
  } catch (error) {
    console.warn('로그인 세션 복구 실패', error)
    localStorage.removeItem(AUTH_USER_KEY)
    return null
  }
}

function loadRememberedEmail(): string {
  return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? ''
}

function persistUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(users.value))
}

function persistCurrentUser(user: StoredUser | null) {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    localStorage.setItem(TMDB_KEY_STORAGE, user.password)
  } else {
    localStorage.removeItem(AUTH_USER_KEY)
    localStorage.removeItem(TMDB_KEY_STORAGE)
  }
}

function persistRememberedEmail(email: string) {
  if (email) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email)
  } else {
    localStorage.removeItem(REMEMBER_EMAIL_KEY)
  }
}

export function useAuth() {
  const state = reactive({
    loading: false,
    error: ''
  })

  async function register(email: string, password: string): Promise<AuthResult> {
    if (!validateEmail(email)) {
      return { ok: false, message: '유효한 이메일 주소를 입력해주세요.' }
    }

    if (password.length < 6) {
      return { ok: false, message: '비밀번호는 6자 이상 입력해주세요.' }
    }

    const exists = users.value.some((user) => user.id === email)
    if (exists) {
      return { ok: false, message: '이미 가입된 이메일입니다.' }
    }

    const newUser: StoredUser = {
      id: email,
      password,
      createdAt: new Date().toISOString()
    }

    users.value.push(newUser)
    persistUsers()

    return { ok: true }
  }

  async function login(
    email: string,
    password: string,
    options?: { remember?: boolean }
  ): Promise<AuthResult> {
    const user = users.value.find((item) => item.id === email && item.password === password)
    if (!user) {
      return { ok: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' }
    }

    currentUser.value = user
    persistCurrentUser(user)

    if (options?.remember) {
      rememberedEmail.value = email
      persistRememberedEmail(email)
    } else {
      rememberedEmail.value = ''
      persistRememberedEmail('')
    }

    return { ok: true }
  }

  function logout() {
    currentUser.value = null
    persistCurrentUser(null)
  }

  return {
    state,
    currentUser: computed(() => currentUser.value),
    isLoggedIn: computed(() => !!currentUser.value),
    rememberedEmail: computed(() => rememberedEmail.value),
    register,
    login,
    logout
  }
}

export function validateEmail(email: string) {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)
}

export function isAuthenticated() {
  return !!localStorage.getItem(AUTH_USER_KEY)
}
