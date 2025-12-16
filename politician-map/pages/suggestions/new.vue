<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-8">
          건의사항 작성
        </h1>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 정치인 선택 -->
          <div>
            <label for="politician" class="block text-sm font-semibold text-gray-700 mb-2">
              정치인 선택 <span class="text-red-500">*</span>
            </label>
            <select
              id="politician"
              v-model="form.politician_id"
              required
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="">정치인을 선택하세요</option>
              <option
                v-for="politician in politicians"
                :key="politician.id"
                :value="politician.id"
              >
                {{ politician.name }} ({{ politician.region }})
              </option>
            </select>
          </div>

          <!-- 카테고리 -->
          <div>
            <label for="category" class="block text-sm font-semibold text-gray-700 mb-2">
              카테고리 <span class="text-red-500">*</span>
            </label>
            <select
              id="category"
              v-model="form.category"
              required
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="">카테고리를 선택하세요</option>
              <option value="정책">📋 정책</option>
              <option value="민원">📢 민원</option>
              <option value="기타">💬 기타</option>
            </select>
          </div>

          <!-- 제목 -->
          <div>
            <label for="title" class="block text-sm font-semibold text-gray-700 mb-2">
              제목 <span class="text-red-500">*</span>
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              placeholder="건의사항 제목을 입력하세요"
              maxlength="100"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
            />
            <p class="text-right text-sm text-gray-400 mt-1">{{ form.title.length }} / 100</p>
          </div>

          <!-- 내용 -->
          <div>
            <label for="content" class="block text-sm font-semibold text-gray-700 mb-2">
              내용 <span class="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              v-model="form.content"
              required
              placeholder="건의사항 내용을 자세히 작성해주세요"
              rows="12"
              maxlength="2000"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors resize-y"
            ></textarea>
            <p class="text-right text-sm text-gray-400 mt-1">{{ form.content.length }} / 2000</p>
          </div>

          <!-- 에러 메시지 -->
          <div v-if="error" class="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>

          <!-- 버튼 -->
          <div class="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              @click="router.back()"
              class="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {{ loading ? '작성 중...' : '작성 완료' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const { createSuggestion } = useSuggestions()
const { user, isAuthenticated } = useAuth()
const router = useRouter()

// 로그인 체크
if (!isAuthenticated.value) {
  router.push('/auth/login')
}

const form = ref({
  politician_id: '',
  category: '',
  title: '',
  content: ''
})

const loading = ref(false)
const error = ref('')

// 정치인 목록 로드
const politicians = ref([])
const supabase = useSupabaseClient()

onMounted(async () => {
  try {
    const { data } = await supabase
      .from('politicians')
      .select('id, name, region')
      .order('name', { ascending: true })

    politicians.value = data || []
  } catch (err) {
    console.error('Failed to load politicians:', err)
  }
})

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    const { data, error: submitError } = await createSuggestion({
      title: form.value.title,
      content: form.value.content,
      category: form.value.category,
      politician_id: parseInt(form.value.politician_id)
    })

    if (submitError) {
      error.value = submitError
      return
    }

    // 작성 성공 - 상세 페이지로 이동
    alert('건의사항이 작성되었습니다!')
    router.push(`/suggestions/${data.id}`)
  } catch (err) {
    error.value = '건의사항 작성 중 오류가 발생했습니다.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

useHead({
  title: '건의사항 작성 - 정치인 커뮤니티'
})
</script>
