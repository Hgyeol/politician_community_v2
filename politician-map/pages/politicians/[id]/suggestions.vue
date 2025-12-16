<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 로딩 상태 -->
    <div v-if="politicianLoading" class="text-center py-16">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
    </div>

    <div v-else-if="politician">
      <!-- 정치인 정보 헤더 -->
      <div class="bg-white border border-gray-200 rounded-lg p-8 mb-8 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ politician.의원명 }} 의원 게시판</h1>
            <p class="text-gray-600">{{ politician.지역 }} | {{ politician.정당 }} | {{ politician.소속위원회 }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">당선횟수</p>
            <p class="text-2xl font-bold text-gray-800">{{ politician.당선횟수 }}회</p>
          </div>
        </div>
      </div>

      <!-- 작성 버튼 -->
      <div class="mb-6 flex justify-between items-center">
        <button
          @click="router.back()"
          class="text-gray-600 hover:text-gray-900 font-medium"
        >
          ← 돌아가기
        </button>
        <NuxtLink
          v-if="isAuthenticated"
          :to="`/suggestions/new?politician_id=${politicianId}`"
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
            @click="loadMore({ politician_id: politicianId })"
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

    <div v-else class="text-center py-16">
      <p class="text-gray-500 text-lg">정치인 정보를 찾을 수 없습니다</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()
const { suggestions, hasMore, loading, loadMore, reset } = useSuggestions()
const { politicians, loadPoliticians } = usePoliticians()

const politicianId = parseInt(route.params.id as string)
const politician = ref(null)
const politicianLoading = ref(true)
const loadMoreTrigger = ref(null)
let observer = null

onMounted(async () => {
  // 정치인 정보 로드
  await loadPoliticians()
  politician.value = politicians.value.find(p => p.id === politicianId)
  politicianLoading.value = false

  // 건의사항 로드
  await loadMore({ politician_id: politicianId })

  // Intersection Observer 설정 (무한 스크롤)
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore.value && !loading.value) {
          loadMore({ politician_id: politicianId })
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
