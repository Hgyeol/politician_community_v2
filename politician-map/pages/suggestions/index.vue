<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">전체 건의사항</h1>
      <p class="text-gray-600">모든 정치인에게 전달된 건의사항을 확인하세요</p>
    </div>

    <!-- 작성 버튼 -->
    <div class="mb-6 flex justify-end">
      <NuxtLink
        v-if="isAuthenticated"
        to="/suggestions/new"
        class="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
      >
        건의사항 작성
      </NuxtLink>
      <NuxtLink
        v-else
        to="/auth/login"
        class="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
      >
        로그인하여 작성하기
      </NuxtLink>
    </div>

    <!-- 건의사항 목록 -->
    <div class="space-y-4">
      <div
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
        @click="navigateToDetail(suggestion.id)"
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
            <span class="font-medium">{{ suggestion.profiles?.nickname || '익명' }}</span>
            <span>→</span>
            <span class="font-medium text-gray-800">{{ suggestion.politicians?.name }}</span>
            <span>({{ suggestion.politicians?.region }})</span>
          </div>
          <div class="flex items-center space-x-4">
            <span>조회 {{ suggestion.view_count || 0 }}</span>
            <span>{{ formatDate(suggestion.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
      </div>

      <!-- 더 보기 -->
      <div v-if="hasMore && !loading" ref="loadMoreTrigger" class="text-center py-8">
        <button
          @click="loadMore()"
          class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          더 보기
        </button>
      </div>

      <!-- 빈 상태 -->
      <div v-if="!loading && suggestions.length === 0" class="text-center py-16">
        <p class="text-gray-500 text-lg">아직 작성된 건의사항이 없습니다</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'default'
})

const { suggestions, hasMore, loading, loadMore, reset } = useSuggestions()
const { isAuthenticated } = useAuth()
const router = useRouter()

const loadMoreTrigger = ref(null)
let observer = null

onMounted(async () => {
  // 초기 데이터 로드
  await loadMore()

  // Intersection Observer 설정 (무한 스크롤)
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore.value && !loading.value) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreTrigger.value) {
      observer.observe(loadMoreTrigger.value)
    }
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  reset()
})

function navigateToDetail(id: number) {
  router.push(`/suggestions/${id}`)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return '방금 전'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`

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
