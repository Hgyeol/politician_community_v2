<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
      <p class="text-gray-600">내가 작성한 건의사항과 댓글을 확인하세요</p>
    </div>

    <!-- 사용자 정보 -->
    <div v-if="user" class="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <span class="text-2xl font-bold text-gray-800">
            {{ user.email?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-gray-900">{{ user.email }}</h2>
          <p class="text-gray-600">가입일: {{ formatDate(user.created_at) }}</p>
        </div>
      </div>
    </div>

    <!-- 탭 -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-8">
        <button
          @click="activeTab = 'suggestions'"
          :class="[
            'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'suggestions'
              ? 'border-gray-800 text-gray-800'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          내 건의사항 ({{ mySuggestions.length }})
        </button>
        <button
          @click="activeTab = 'comments'"
          :class="[
            'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'comments'
              ? 'border-gray-800 text-gray-800'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          내 댓글 ({{ myComments.length }})
        </button>
      </nav>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="text-center py-16">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
    </div>

    <!-- 내 건의사항 -->
    <div v-else-if="activeTab === 'suggestions'">
      <div class="space-y-4">
        <div
          v-for="suggestion in mySuggestions"
          :key="suggestion.id"
          class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="router.push(`/suggestions/${suggestion.id}`)"
        >
          <div class="flex justify-between items-start mb-3">
            <h2 class="text-xl font-semibold text-gray-900 flex-1">
              {{ suggestion.title }}
            </h2>
            <span class="ml-4 px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm font-medium">
              {{ suggestion.category }}
            </span>
          </div>

          <p class="text-gray-600 mb-4 line-clamp-2">
            {{ suggestion.content }}
          </p>

          <div class="flex items-center justify-between text-sm text-gray-500">
            <div class="flex items-center space-x-4">
              <span class="font-medium text-gray-800">{{ suggestion.politicians?.name }}</span>
              <span>({{ suggestion.politicians?.region }})</span>
            </div>
            <div class="flex items-center space-x-4">
              <span>조회 {{ suggestion.view_count || 0 }}</span>
              <span>{{ formatDate(suggestion.created_at) }}</span>
            </div>
          </div>
        </div>

        <div v-if="mySuggestions.length === 0" class="text-center py-16">
          <p class="text-gray-500 text-lg mb-4">작성한 건의사항이 없습니다</p>
          <NuxtLink
            to="/suggestions/new"
            class="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
          >
            건의사항 작성하기
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 내 댓글 -->
    <div v-else-if="activeTab === 'comments'">
      <div class="space-y-4">
        <div
          v-for="comment in myComments"
          :key="comment.id"
          class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="router.push(`/suggestions/${comment.suggestion_id}`)"
        >
          <div class="mb-3">
            <span class="text-sm text-gray-500">
              건의사항: <span class="font-medium text-gray-700">{{ comment.suggestions?.title || '제목 없음' }}</span>
            </span>
          </div>

          <p class="text-gray-800 mb-3">{{ comment.content }}</p>

          <div class="text-sm text-gray-500">
            {{ formatDate(comment.created_at) }}
          </div>
        </div>

        <div v-if="myComments.length === 0" class="text-center py-16">
          <p class="text-gray-500 text-lg">작성한 댓글이 없습니다</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const router = useRouter()
const supabase = useSupabaseClient()
const { user } = useAuth()

const activeTab = ref('suggestions')
const loading = ref(true)
const mySuggestions = ref([])
const myComments = ref([])

onMounted(async () => {
  await loadMyData()
})

async function loadMyData() {
  if (!user.value) return

  loading.value = true

  try {
    // 내 건의사항 로드
    const userId = user.value.id || user.value.sub

    const { data: suggestions } = await supabase
      .from('suggestions')
      .select(`
        *,
        politicians:politician_id (id, name, region, party)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    mySuggestions.value = suggestions || []

    // 내 댓글 로드
    const { data: comments } = await supabase
      .from('comments')
      .select(`
        *,
        suggestions:suggestion_id (id, title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    myComments.value = comments || []
  } catch (error) {
    console.error('Failed to load user data:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
