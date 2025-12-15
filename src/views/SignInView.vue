<template>
  <section class="auth-page">
    <div class="bg-overlay"></div>
    <div class="aurora aurora-1"></div>
    <div class="aurora aurora-2"></div>
    <div class="aurora aurora-3"></div>

    <div class="planet"></div>
    <div class="particles"></div>

    <div class="flip-wrapper" :class="{ 'show-signup': isSignUpMode }">
      <div class="mode-tabs">
        <button type="button" :class="{ active: !isSignUpMode }" @click="mode = 'signin'">로그인</button>
        <button type="button" :class="{ active: isSignUpMode }" @click="mode = 'signup'">회원가입</button>
      </div>
      <div class="flip-card">
        <div class="card-face card-front">
          <form class="form" @submit.prevent="handleLogin">
            <h2>다시 만나서 반가워요!</h2>
            <p class="subtitle">저장해둔 선호작을 이어서 감상해 보세요.</p>

            <label>
              <span>이메일</span>
              <div class="input-frame">
                <span class="icon">✉️</span>
                <input v-model="form.signinEmail" type="email" placeholder="you@example.com" />
              </div>
            </label>

            <label>
              <span>비밀번호 (TMDB API Key)</span>
              <div class="input-frame">
                <span class="icon">🔒</span>
                <input v-model="form.signinPassword" type="password" placeholder="영문+숫자 6자 이상" />
              </div>
            </label>

            <div class="form-row">
              <label class="checkbox">
                <input v-model="form.remember" type="checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" class="link-btn" @click="mode = 'signup'">
                계정이 없나요?
              </button>
            </div>

            <button class="primary-btn" type="submit">
              로그인
            </button>
          </form>
        </div>

        <div class="card-face card-back">
          <form class="form" @submit.prevent="handleRegister">
            <h2>첫 방문을 환영해요</h2>
            <p class="subtitle">TMDB Key를 비밀번호로 등록하면 추천 기능을 바로 쓸 수 있어요.</p>

            <label>
              <span>이메일</span>
              <div class="input-frame">
                <span class="icon">✉️</span>
                <input v-model="form.signupEmail" type="email" placeholder="new@example.com" />
              </div>
            </label>

            <label>
              <span>비밀번호 (TMDB API Key)</span>
              <div class="input-frame">
                <span class="icon">🔒</span>
                <input v-model="form.signupPassword" type="password" placeholder="최소 6자" />
              </div>
            </label>

            <label>
              <span>비밀번호 확인</span>
              <div class="input-frame">
                <span class="icon">🔁</span>
                <input v-model="form.signupPasswordConfirm" type="password" placeholder="다시 입력" />
              </div>
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(32px, 5vw, 72px) clamp(16px, 4vw, 48px);
  gap: clamp(24px, 3vw, 48px);
  position: relative;
  overflow: visible;
  color: #fff;
  background: radial-gradient(circle at top, #0a0a0a, #050505 50%);
  width: min(100%, 1200px);
  margin-inline: auto;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(229, 9, 20, 0.35), transparent),
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.08), transparent 50%);
  filter: blur(160px);
  z-index: 0;
}

.aurora {
  position: absolute;
  border-radius: 50%;
  opacity: 0.45;
  filter: blur(80px);
  animation: float 12s infinite ease-in-out alternate;
}

.aurora-1 {
  width: 300px;
  height: 300px;
  background: #f06292;
  top: -40px;
  left: -60px;
}

.aurora-2 {
  width: 260px;
  height: 260px;
  background: #512da8;
  bottom: 80px;
  right: -60px;
  animation-delay: 2s;
}

.aurora-3 {
  width: 220px;
  height: 220px;
  background: #00bcd4;
  bottom: -60px;
  left: 30%;
  animation-delay: 4s;
}

@keyframes float {
  0% {
    transform: translateY(0) scale(1);
  }
  100% {
    transform: translateY(-40px) scale(1.1);
  }
}

.flip-wrapper {
  width: min(520px, 95vw);
  max-width: 560px;
  min-height: min(760px, 90vh);
  perspective: 1600px;
  position: relative;
  z-index: 1;
  margin-block: clamp(18px, 3vw, 48px);
}

.mode-tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: clamp(16px, 2vw, 28px);
  background: rgba(0, 0, 0, 0.35);
  border-radius: 999px;
  padding: 4px;
  backdrop-filter: blur(10px);
}

.mode-tabs button {
  flex: 1;
  border: none;
  background: transparent;
  color: #d0d0d0;
  font-weight: 600;
  font-size: 14px;
  border-radius: 999px;
  padding: 10px;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
}

.mode-tabs button.active {
  background: linear-gradient(120deg, #f43f5e, #b91c1c);
  color: #fff;
  box-shadow: 0 10px 20px rgba(244, 63, 94, 0.3);
}

.flip-card {
  width: 100%;
  min-height: 640px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s ease;
}

.flip-wrapper.show-signup .flip-card {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 10, 0.85);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  padding-block: clamp(32px, 3vw, 48px);
  padding-inline: clamp(34px, 4vw, 48px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  min-height: 620px;
  overflow: hidden;
}

.card-back {
  transform: rotateY(180deg);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

@media (max-width: 640px) {
  .flip-wrapper {
    width: 100%;
  }

  .mode-tabs button {
    font-size: 13px;
  }

  .card-face {
    padding: 28px;
    border-radius: 24px;
    min-height: 520px;
  }
}

@media (max-width: 960px) {
  .auth-page {
    align-items: stretch;
    justify-content: center;
  }

  .flip-wrapper {
    max-width: 520px;
    min-height: 680px;
  }

  .card-face {
    padding-block: clamp(28px, 4vw, 40px);
    padding-inline: clamp(30px, 6vw, 40px);
    min-height: 600px;
  }

  .form {
    gap: 16px;
  }

  .form-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .form-row .link-btn {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .auth-page {
    padding: 24px 16px;
  }

  .flip-wrapper {
    min-height: 600px;
  }

  .card-face {
    min-height: 560px;
  }

  .primary-btn {
    font-size: 15px;
    padding: 12px;
  }

  .input-frame {
    padding: 10px 12px;
  }
}

.form h2 {
  margin-bottom: 6px;
  font-size: 28px;
}

.subtitle {
  color: #d5d5d5;
  font-size: 14px;
  margin-bottom: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

.input-frame {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
  transition: border 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}

.icon {
  font-size: 16px;
  opacity: 0.7;
  transition: opacity 0.25s ease;
}

.input-frame input {
  flex: 1;
  border: none;
  background: transparent;
  color: #fff;
  font-size: 14px;
}

.input-frame input:focus {
  outline: none;
}

.input-frame:focus-within {
  border-color: rgba(229, 9, 20, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(229, 9, 20, 0.15);
}

.input-frame:focus-within .icon {
  opacity: 1;
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
  background: linear-gradient(120deg, #ec4899, #e50914, #8b5cf6);
  border: none;
  color: #fff;
  padding: 14px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 12px 30px rgba(226, 41, 72, 0.3);
  margin-top: clamp(12px, 2vw, 22px);
}

.primary-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.4), transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.primary-btn:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 18px 32px rgba(226, 41, 72, 0.35);
}

.primary-btn:hover::after {
  opacity: 1;
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
