<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 p-4">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Logo & Title -->
        <div class="text-center mb-8">
          <div class="text-5xl mb-4">🏛️</div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">로그인</h1>
          <p class="text-gray-600">정치인 커뮤니티에 오신 것을 환영합니다</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSignIn" class="space-y-6">
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
              placeholder="비밀번호를 입력하세요"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div v-if="error" class="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {{ loading ? '로그인 중...' : '로그인' }}
          </button>
        </form>

        <!-- Links -->
        <div class="mt-6 space-y-3 text-center text-sm">
          <p class="text-gray-600">
            계정이 없으신가요?
            <NuxtLink to="/auth/signup" class="text-primary-600 hover:text-primary-700 font-semibold">
              회원가입
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

const { signIn } = useAuth()
const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleSignIn = async () => {
  error.value = ''
  loading.value = true

  try {
    const { data, error: signInError } = await signIn(
      form.value.email,
      form.value.password
    )

    if (signInError) {
      error.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
      return
    }

    // 로그인 성공 - 건의사항 목록으로 이동
    router.push('/suggestions')
  } catch (err) {
    error.value = '로그인 중 오류가 발생했습니다.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

useHead({
  title: '로그인 - 정치인 커뮤니티'
})
</script>
