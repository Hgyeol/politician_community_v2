<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Logo & Title -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">회원가입</h1>
          <p class="text-gray-600">정치인 커뮤니티에 가입하세요</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSignUp" class="space-y-5">
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
              이메일
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              placeholder="example@email.com"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              placeholder="최소 6자 이상"
              minlength="6"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label for="passwordConfirm" class="block text-sm font-semibold text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              v-model="form.passwordConfirm"
              type="password"
              required
              placeholder="비밀번호를 다시 입력하세요"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label for="nickname" class="block text-sm font-semibold text-gray-700 mb-2">
              닉네임
            </label>
            <input
              id="nickname"
              v-model="form.nickname"
              type="text"
              required
              placeholder="닉네임을 입력하세요"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label for="region" class="block text-sm font-semibold text-gray-700 mb-2">
              거주 지역 <span class="text-gray-400 text-xs">(선택)</span>
            </label>
            <input
              id="region"
              v-model="form.region"
              type="text"
              placeholder="예: 서울 강남구"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div v-if="error" class="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '처리 중...' : '회원가입' }}
          </button>
        </form>

        <!-- Links -->
        <div class="mt-6 space-y-3 text-center text-sm">
          <p class="text-gray-600">
            이미 계정이 있으신가요?
            <NuxtLink to="/auth/login" class="text-gray-800 hover:text-gray-900 font-semibold">
              로그인
            </NuxtLink>
          </p>
          <p>
            <NuxtLink to="/" class="text-gray-600 hover:text-gray-800 font-medium">
              ← 홈으로 돌아가기
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const { signUp } = useAuth()
const router = useRouter()

const form = ref({
  email: '',
  password: '',
  passwordConfirm: '',
  nickname: '',
  region: ''
})

const loading = ref(false)
const error = ref('')

const handleSignUp = async () => {
  error.value = ''

  // 비밀번호 확인
  if (form.value.password !== form.value.passwordConfirm) {
    error.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  loading.value = true

  try {
    console.log('📝 회원가입 시도:', {
      email: form.value.email,
      nickname: form.value.nickname,
      region: form.value.region
    })

    const { data, error: signUpError } = await signUp(
      form.value.email,
      form.value.password,
      form.value.nickname,
      form.value.region
    )

    console.log('📝 회원가입 응답:', { data, error: signUpError })

    if (signUpError) {
      error.value = `회원가입 실패: ${signUpError}`
      console.error('❌ 회원가입 에러:', signUpError)
      return
    }

    // 회원가입 성공
    console.log('✅ 회원가입 성공')
    alert('회원가입이 완료되었습니다! 로그인해주세요.')
    router.push('/auth/login')
  } catch (err) {
    error.value = '회원가입 중 오류가 발생했습니다.'
    console.error('❌ Exception:', err)
  } finally {
    loading.value = false
  }
}

useHead({
  title: '회원가입 - 정치인 커뮤니티'
})
</script>
