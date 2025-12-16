<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 헤더 -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">
              건의사항 목록
            </h1>
            <p class="text-gray-600">정치인에게 직접 건의하고 소통하세요</p>
          </div>

          <NuxtLink
            v-if="isAuthenticated"
            to="/suggestions/new"
            class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all whitespace-nowrap"
          >
            <span class="text-xl">✍️</span>
            건의사항 작성
          </NuxtLink>
          <NuxtLink
            v-else
            to="/auth/login"
            class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all whitespace-nowrap"
          >
            <span class="text-xl">🔐</span>
            로그인하여 작성하기
          </NuxtLink>
        </div>

        <!-- 필터 -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-700">카테고리:</span>
            <select
              v-model="selectedCategory"
              @change="handleFilterChange"
              class="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
            >
              <option value="">전체 카테고리</option>
              <option value="정책">📋 정책</option>
              <option value="민원">📢 민원</option>
              <option value="기타">💬 기타</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 건의사항 목록 -->
      <div class="space-y-4">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          @click="navigateTo(`/suggestions/${suggestion.id}`)"
          class="bg-white rounded-xl shadow hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-primary-300 group"
        >
          <div class="p-6">
            <!-- 헤더 -->
            <div class="flex justify-between items-start mb-3 gap-4">
              <h2 class="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors flex-1">
                {{ suggestion.title }}
              </h2>
              <span
                class="px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap"
                :class="getCategoryStyle(suggestion.category)"
              >
                {{ getCategoryIcon(suggestion.category) }} {{ suggestion.category }}
              </span>
            </div>

            <!-- 내용 -->
            <p class="text-gray-600 mb-4 line-clamp-2">
              {{ truncateText(suggestion.content, 150) }}
            </p>

            <!-- 메타 정보 -->
            <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
              <div class="flex flex-wrap items-center gap-4">
                <span class="flex items-center gap-1">
                  <span class="text-base">👤</span>
                  <span class="font-medium">{{ suggestion.profiles?.nickname || '익명' }}</span>
                </span>
                <span class="flex items-center gap-1">
                  <span class="text-base">→</span>
                  <span class="font-medium text-primary-600">{{ suggestion.politicians?.name }}</span>
                  <span class="text-xs text-gray-400">({{ suggestion.politicians?.region }})</span>
                </span>
              </div>
              <div class="flex items-center gap-4">
                <span class="flex items-center gap-1">
                  <span class="text-base">👁</span>
                  <span>{{ suggestion.view_count }}</span>
                </span>
                <span class="text-gray-400">{{ formatDate(suggestion.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 무한 스크롤 감지 영역 -->
      <div ref="sentinel" class="h-4"></div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <div class="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
        <p class="text-gray-600 font-medium">로딩 중...</p>
      </div>

      <!-- 모든 데이터 로드 완료 -->
      <div v-if="!hasMore && suggestions.length > 0" class="text-center py-12">
        <div class="text-4xl mb-3">📚</div>
        <p class="text-gray-500 font-medium">모든 게시글을 불러왔습니다.</p>
      </div>

      <!-- 데이터 없음 -->
      <div v-if="!loading && suggestions.length === 0" class="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div class="text-6xl mb-4">📝</div>
        <p class="text-xl text-gray-700 font-semibold mb-2">아직 건의사항이 없습니다</p>
        <p class="text-gray-500 mb-6">첫 번째로 의견을 남겨보세요!</p>
        <NuxtLink
          v-if="isAuthenticated"
          to="/suggestions/new"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <span class="text-xl">✍️</span>
          첫 번째 건의사항 작성하기
        </NuxtLink>
      </div>

      <!-- 메인으로 돌아가기 -->
      <div class="text-center mt-8">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-xl font-semibold hover:bg-primary-600 hover:text-white transition-all"
        >
          <span>🗺️</span>
          지도로 돌아가기
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const { suggestions, hasMore, loading, loadMore, reset } = useSuggestions()
const { isAuthenticated } = useAuth()

const sentinel = ref(null)
const selectedCategory = ref('')

// 초기 데이터 로드
onMounted(async () => {
  await loadMore()

  // Intersection Observer를 사용한 무한 스크롤
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore({ category: selectedCategory.value })
      }
    },
    {
      threshold: 0.1,
      rootMargin: '100px'
    }
  )

  if (sentinel.value) {
    observer.observe(sentinel.value)
  }

  onUnmounted(() => {
    observer.disconnect()
  })
})

// 필터 변경 시
const handleFilterChange = () => {
  reset()
  loadMore({ category: selectedCategory.value })
}

// 카테고리 스타일
const getCategoryStyle = (category) => {
  const styles = {
    '정책': 'bg-blue-100 text-blue-700',
    '민원': 'bg-orange-100 text-orange-700',
    '기타': 'bg-gray-100 text-gray-700'
  }
  return styles[category] || 'bg-gray-100 text-gray-700'
}

// 카테고리 아이콘
const getCategoryIcon = (category) => {
  const icons = {
    '정책': '📋',
    '민원': '📢',
    '기타': '💬'
  }
  return icons[category] || '💬'
}

// 텍스트 자르기
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// 날짜 포맷
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}일 전`
  if (hours > 0) return `${hours}시간 전`
  if (minutes > 0) return `${minutes}분 전`
  return '방금 전'
}

useHead({
  title: '건의사항 목록 - 정치인 커뮤니티'
})
</script>
