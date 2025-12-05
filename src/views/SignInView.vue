<template>
  <section class="auth-page">
    <div class="bg-overlay"></div>
    <div class="auth-container" :class="{ 'is-signup': isSignUpMode }">
      <div class="form-side">
        <form class="form signin" :class="{ 'is-active': !isSignUpMode }" @submit.prevent="handleLogin">
          <h2>다시 만나서 반가워요!</h2>
          <p class="subtitle">저장해둔 선호작을 이어서 감상해 보세요.</p>

          <label>
            <span>이메일</span>
            <input v-model="form.signinEmail" type="email" placeholder="you@example.com" />
          </label>

          <label>
            <span>비밀번호 (TMDB API Key)</span>
            <input v-model="form.signinPassword" type="password" placeholder="영문+숫자 6자 이상" />
          </label>

          <div class="form-row">
            <label class="checkbox">
              <input v-model="form.remember" type="checkbox" />
              <span>Remember me</span>
            </label>
            <button type="button" class="link-btn" @click="mode = 'signup'">
              아직 계정이 없나요?
            </button>
          </div>

          <button class="primary-btn" type="submit">
            로그인
          </button>
        </form>

        <form class="form signup" :class="{ 'is-active': isSignUpMode }" @submit.prevent="handleRegister">
          <h2>간편하게 가입하고 찜 목록을 저장하세요</h2>
          <p class="subtitle">TMDB Key를 비밀번호로 입력해야 로그인/추천 기능을 사용할 수 있습니다.</p>

          <label>
            <span>이메일</span>
            <input v-model="form.signupEmail" type="email" placeholder="new@example.com" />
          </label>

          <label>
            <span>비밀번호 (TMDB API Key)</span>
            <input v-model="form.signupPassword" type="password" placeholder="최소 6자" />
          </label>

          <label>
            <span>비밀번호 확인</span>
            <input v-model="form.signupPasswordConfirm" type="password" placeholder="다시 입력" />
          </label>

          <label class="checkbox terms">
            <input v-model="form.agree" type="checkbox" />
            <span>서비스 이용 약관 및 개인정보 처리 방침에 동의합니다.</span>
          </label>

          <button class="primary-btn" type="submit">
            회원가입
          </button>
        </form>
      </div>

      <div class="switcher">
        <div class="panel panel-signin">
          <h3>가입한 계정이 있으신가요?</h3>
          <p>로그인 화면으로 전환하고, 저장된 찜 목록을 불러오세요.</p>
          <button class="ghost-btn" @click="mode = 'signin'">로그인으로 이동</button>
        </div>
        <div class="panel panel-signup">
          <h3>새로운 계정을 만들고 싶나요?</h3>
          <p>TMDB API Key를 발급받아 비밀번호로 등록하세요.</p>
          <button class="ghost-btn" @click="mode = 'signup'">회원가입으로 이동</button>
        </div>
      </div>
    </div>

    <transition name="toast">
      <div v-if="toast.visible" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth, validateEmail } from '../composables/useAuth'

type ToastType = 'success' | 'error'

const { login, register, rememberedEmail } = useAuth()
const router = useRouter()
const route = useRoute()

const mode = ref<'signin' | 'signup'>('signin')
const toast = reactive({
  visible: false,
  message: '',
  type: 'success' as ToastType
})

const form = reactive({
  signinEmail: '',
  signinPassword: '',
  remember: false,
  signupEmail: '',
  signupPassword: '',
  signupPasswordConfirm: '',
  agree: false
})

const isSignUpMode = computed(() => mode.value === 'signup')

onMounted(() => {
  if (rememberedEmail.value) {
    form.signinEmail = rememberedEmail.value
    form.remember = true
  }
})

function showToast(type: ToastType, message: string) {
  toast.type = type
  toast.message = message
  toast.visible = true
  setTimeout(() => {
    toast.visible = false
  }, 2500)
}

async function handleLogin() {
  if (!validateEmail(form.signinEmail)) {
    return showToast('error', '유효한 이메일을 입력해주세요.')
  }
  if (!form.signinPassword) {
    return showToast('error', '비밀번호를 입력해주세요.')
  }

  const result = await login(form.signinEmail, form.signinPassword, {
    remember: form.remember
  })

  if (!result.ok) {
    return showToast('error', result.message ?? '로그인에 실패했습니다.')
  }

  showToast('success', '로그인 성공! 잠시 후 메인으로 이동합니다.')
  const redirect = (route.query.redirect as string) || '/'
  setTimeout(() => {
    router.push(redirect)
  }, 600)
}

async function handleRegister() {
  if (!validateEmail(form.signupEmail)) {
    return showToast('error', '이메일 형식을 다시 확인해주세요.')
  }
  if (form.signupPassword.length < 6) {
    return showToast('error', 'TMDB Key 또는 비밀번호는 6자 이상이어야 합니다.')
  }
  if (form.signupPassword !== form.signupPasswordConfirm) {
    return showToast('error', '비밀번호가 일치하지 않습니다.')
  }
  if (!form.agree) {
    return showToast('error', '약관에 동의하셔야 가입할 수 있습니다.')
  }

  const result = await register(form.signupEmail, form.signupPassword)
  if (!result.ok) {
    return showToast('error', result.message ?? '회원가입에 실패했습니다.')
  }

  showToast('success', '회원가입 완료! 로그인 화면으로 이동합니다.')
  mode.value = 'signin'
  form.signinEmail = form.signupEmail
  form.signinPassword = ''
  form.signupPassword = ''
  form.signupPasswordConfirm = ''
  form.agree = false
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  position: relative;
  overflow: hidden;
  color: #fff;
  background: #000;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top, rgba(229, 9, 20, 0.35), transparent),
    radial-gradient(circle at bottom, rgba(255, 255, 255, 0.1), transparent);
  filter: blur(120px);
  z-index: 0;
}

.auth-container {
  width: min(960px, 100%);
  background: rgba(14, 14, 14, 0.85);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  position: relative;
  z-index: 1;
  overflow: hidden;
  transition: transform 0.4s ease;
}

.auth-container.is-signup {
  transform: translateY(-6px);
}

.form-side {
  position: relative;
  min-height: 600px;
}

.form {
  position: absolute;
  inset: 0;
  padding: 48px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  opacity: 0;
  transform: translateX(30px);
  transition: opacity 0.35s ease, transform 0.35s ease;
  pointer-events: none;
  overflow-y: auto;
}

.form.is-active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.form h2 {
  margin-bottom: 6px;
  font-size: 28px;
}

.subtitle {
  color: #bbb;
  font-size: 14px;
  margin-bottom: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

input[type='email'],
input[type='password'] {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  color: #fff;
  transition: border 0.2s ease, background 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #e50914;
  background: rgba(229, 9, 20, 0.08);
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  cursor: pointer;
}

.checkbox input {
  accent-color: #e50914;
}

.terms {
  font-size: 13px;
  line-height: 1.5;
}

.primary-btn {
  background: linear-gradient(120deg, #e50914, #f6121d);
  border: none;
  color: #fff;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(229, 9, 20, 0.3);
}

.ghost-btn {
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: transparent;
  color: #fff;
  padding: 10px 24px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-btn:hover {
  border-color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.link-btn {
  background: none;
  border: none;
  color: #bbb;
  font-size: 13px;
  cursor: pointer;
}

.switcher {
  position: relative;
  background: linear-gradient(180deg, rgba(229, 9, 20, 0.9), rgba(22, 22, 22, 0.8));
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 48px;
  text-align: center;
  color: #fff;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel h3 {
  font-size: 22px;
  margin: 0;
}

.panel p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.toast {
  position: fixed;
  bottom: 32px;
  right: 32px;
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 14px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
  background: rgba(0, 0, 0, 0.8);
  border-left: 4px solid transparent;
}

.toast.success {
  border-left-color: #2ecc71;
}
.toast.error {
  border-left-color: #e50914;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 960px) {
  .auth-container {
    grid-template-columns: 1fr;
  }
  .switcher {
    order: -1;
    flex-direction: row;
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .auth-container {
    border-radius: 20px;
  }

  .form-side {
    padding: 32px 24px;
  }

  .switcher {
    flex-direction: column;
  }

  .toast {
    left: 16px;
    right: 16px;
    bottom: 16px;
  }
}
</style>
