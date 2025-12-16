<template>
  <div>
    <!-- 상단 네비게이션 -->
    <nav class="bg-white border-b border-gray-200 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <NuxtLink to="/" class="flex items-center space-x-2 group">
            <div class="text-2xl">🏛️</div>
            <span class="text-xl font-bold text-gray-900">
              제 22대 국회의원
            </span>
          </NuxtLink>

          <div class="flex items-center space-x-4">
            <NuxtLink
              v-if="!isAuthenticated"
              to="/auth/login"
              class="px-6 py-2 bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all"
            >
              로그인
            </NuxtLink>

            <button
              v-else
              @click="handleSignOut"
              class="px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-all"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 메인 컨텐츠 -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">건의사항 작성</h1>
        <p class="text-gray-600">정치인에게 전달할 건의사항을 작성해주세요</p>
      </div>

    <form @submit.prevent="handleSubmit" class="bg-white border border-gray-200 p-8">
      <!-- 정치인 정보 (읽기 전용) -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          건의 대상 정치인
        </label>
        <div v-if="selectedPolitician" class="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 font-medium">
          {{ selectedPolitician.의원명 }} ({{ selectedPolitician.지역 }}, {{ selectedPolitician.정당 }})
        </div>
        <div v-else class="w-full px-4 py-3 bg-red-50 border border-red-300 text-red-700">
          정치인 정보를 불러오지 못했습니다. 지도에서 지역을 선택해주세요.
        </div>
      </div>

      <!-- 카테고리 -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          카테고리 *
        </label>
        <select
          v-model="form.category"
          required
          class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">카테고리를 선택하세요</option>
          <option value="경제">경제</option>
          <option value="교육">교육</option>
          <option value="환경">환경</option>
          <option value="복지">복지</option>
          <option value="안전">안전</option>
          <option value="교통">교통</option>
          <option value="문화">문화</option>
          <option value="기타">기타</option>
        </select>
      </div>

      <!-- 제목 -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          제목 *
        </label>
        <input
          v-model="form.title"
          type="text"
          required
          maxlength="100"
          placeholder="건의사항 제목을 입력하세요"
          class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p class="mt-1 text-sm text-gray-500">{{ form.title.length }}/100</p>
      </div>

      <!-- 내용 -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          내용 *
        </label>
        <textarea
          v-model="form.content"
          required
          rows="10"
          maxlength="2000"
          placeholder="건의사항 내용을 상세히 작성해주세요"
          class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        ></textarea>
        <p class="mt-1 text-sm text-gray-500">{{ form.content.length }}/2000</p>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200">
        <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- 버튼 -->
      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="submitting || !selectedPolitician"
          class="flex-1 px-6 py-3 bg-gray-800 text-white font-semibold hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ submitting ? '작성 중...' : '작성 완료' }}
        </button>
        <button
          type="button"
          @click="router.back()"
          class="px-6 py-3 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: false
})

const router = useRouter()
const route = useRoute()
const { isAuthenticated, signOut } = useAuth()
const { politicians, loadPoliticians } = usePoliticians()
const { createSuggestion } = useSuggestions()

const handleSignOut = async () => {
  await signOut()
  router.push('/')
}

const form = ref({
  politician_id: '',
  category: '',
  title: '',
  content: ''
})

const submitting = ref(false)
const error = ref('')

// 선택된 정치인 정보
const selectedPolitician = computed(() => {
  if (!form.value.politician_id) return null
  return politicians.value.find(p => p.id === parseInt(form.value.politician_id))
})

// New function to reset the form and submitting state
function resetForm() {
  form.value = {
    politician_id: route.query.politician_id as string || '', // Re-apply from query if present
    category: '',
    title: '',
    content: ''
  }
  submitting.value = false
  error.value = '' // Also clear any previous errors
}

onMounted(async () => {
  await loadPoliticians()
  resetForm() // Ensure clean state on initial mount
})

// Add onActivated hook for potential component reuse
onActivated(() => {
  resetForm() // Ensure clean state when component is re-activated (e.g., via keep-alive)
})

// Watch route changes to ensure reset when navigating back to this specific page
watch(() => route.fullPath, (newPath) => {
  if (newPath === '/suggestions/new') {
    resetForm() // Ensure a full reset when navigating specifically to this page
  }
}, { immediate: true })

async function handleSubmit() {
  if (submitting.value) return

  error.value = ''
  submitting.value = true

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

    if (data) {
      resetForm() // Explicitly reset on success before navigation
      router.push(`/suggestions/${data.id}`)
    }
  } catch (err: any) {
    error.value = err.message || '건의사항 작성 중 오류가 발생했습니다'
  } finally {
    // 버튼이 다시 활성화되도록 보장합니다. 특히 에러가 발생한 경우.
    // (submitting.value가 현재 true인 경우에만 false로 설정)
    if (submitting.value === true) {
      submitting.value = false
    }
  }
}
</script>
