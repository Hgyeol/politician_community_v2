<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">건의사항 작성</h1>
      <p class="text-gray-600">정치인에게 전달할 건의사항을 작성해주세요</p>
    </div>

    <form @submit.prevent="handleSubmit" class="bg-white border border-gray-200 p-8">
      <!-- 정치인 선택 -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          정치인 선택 *
        </label>
        <select
          v-model="form.politician_id"
          required
          class="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">정치인을 선택하세요</option>
          <option
            v-for="politician in politicians"
            :key="politician.id"
            :value="politician.id"
          >
            {{ politician.의원명 }} ({{ politician.지역 }}, {{ politician.정당 }})
          </option>
        </select>
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
          :disabled="submitting"
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const router = useRouter()
const route = useRoute()
const { politicians, loadPoliticians } = usePoliticians()
const { createSuggestion } = useSuggestions()

const form = ref({
  politician_id: '',
  category: '',
  title: '',
  content: ''
})

const submitting = ref(false)
const error = ref('')

onMounted(async () => {
  await loadPoliticians()

  // URL 파라미터로 politician_id가 있으면 자동 선택
  const politicianIdParam = route.query.politician_id
  if (politicianIdParam) {
    form.value.politician_id = politicianIdParam as string
  }
})

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
      // 성공 시 상세 페이지로 이동
      router.push(`/suggestions/${data.id}`)
    }
  } catch (err: any) {
    error.value = err.message || '건의사항 작성 중 오류가 발생했습니다'
  } finally {
    submitting.value = false
  }
}
</script>
