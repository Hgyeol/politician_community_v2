<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div class="w-16 h-16 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 font-medium">로딩 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="bg-white rounded-2xl shadow-xl p-12 text-center">
        <p class="text-6xl mb-4">❌</p>
        <p class="text-xl text-gray-700 mb-6">{{ error }}</p>
        <NuxtLink
          to="/suggestions"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          목록으로 돌아가기
        </NuxtLink>
      </div>

      <!-- 건의사항 상세 -->
      <div v-else-if="suggestion" class="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
        <!-- 헤더 -->
        <div class="mb-8">
          <div class="flex justify-between items-start mb-4">
            <span
              class="px-4 py-2 rounded-full text-sm font-semibold"
              :class="getCategoryStyle(suggestion.category)"
            >
              {{ getCategoryIcon(suggestion.category) }} {{ suggestion.category }}
            </span>
            <button
              v-if="user && user.id === suggestion.user_id"
              @click="handleDelete"
              class="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
            >
              삭제
            </button>
          </div>

          <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {{ suggestion.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span class="flex items-center gap-1.5">
              <span class="text-lg">👤</span>
              <span class="font-medium">{{ suggestion.profiles?.nickname || '익명' }}</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="text-lg">→</span>
              <span class="font-medium text-primary-600">{{ suggestion.politicians?.name }}</span>
              <span class="text-xs text-gray-400">({{ suggestion.politicians?.region }})</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="text-lg">👁</span>
              <span>조회 {{ suggestion.view_count }}</span>
            </span>
            <span class="text-gray-400">{{ formatDate(suggestion.created_at) }}</span>
          </div>
        </div>

        <!-- 내용 -->
        <div class="prose max-w-none mb-8">
          <p class="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
            {{ suggestion.content }}
          </p>
        </div>

        <!-- 구분선 -->
        <div class="border-t-2 border-gray-200 my-8"></div>

        <!-- 댓글 섹션 -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            댓글 <span class="text-primary-500">{{ comments.length }}</span>
          </h2>

          <!-- 댓글 작성 폼 -->
          <div v-if="isAuthenticated" class="mb-8">
            <textarea
              v-model="newComment"
              placeholder="댓글을 입력하세요..."
              rows="3"
              maxlength="500"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors resize-y mb-2"
            ></textarea>
            <div class="flex justify-between items-center">
              <p class="text-sm text-gray-400">{{ newComment.length }} / 500</p>
              <button
                @click="handleAddComment"
                :disabled="!newComment.trim() || commentLoading"
                class="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {{ commentLoading ? '작성 중...' : '댓글 작성' }}
              </button>
            </div>
          </div>

          <div v-else class="bg-gray-50 rounded-xl p-8 text-center mb-8">
            <p class="text-gray-600 mb-4">로그인하여 댓글을 작성하세요</p>
            <NuxtLink
              to="/auth/login"
              class="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-all"
            >
              로그인하기
            </NuxtLink>
          </div>

          <!-- 댓글 목록 -->
          <div class="space-y-4">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="bg-gray-50 rounded-xl p-6"
            >
              <div class="flex justify-between items-start mb-3">
                <span class="font-semibold text-gray-900">
                  {{ comment.profiles?.nickname || '익명' }}
                </span>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-400">{{ formatDate(comment.created_at) }}</span>
                  <button
                    v-if="user && user.id === comment.user_id"
                    @click="handleDeleteComment(comment.id)"
                    class="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ comment.content }}</p>
            </div>
          </div>

          <!-- 댓글 없음 -->
          <div v-if="comments.length === 0 && !isAuthenticated" class="text-center py-12">
            <p class="text-4xl mb-3">💬</p>
            <p class="text-gray-500">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
          </div>
        </div>

        <!-- 하단 버튼 -->
        <div class="mt-8 pt-8 border-t border-gray-200 text-center">
          <NuxtLink
            to="/suggestions"
            class="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-xl font-semibold hover:bg-primary-600 hover:text-white transition-all"
          >
            <span>←</span>
            목록으로
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const { getSuggestion, deleteSuggestion } = useSuggestions()
const { user, isAuthenticated } = useAuth()

const suggestionId = parseInt(route.params.id)
const { comments, loading: commentsLoading, loadComments, createComment, deleteComment } = useComments(suggestionId)

const suggestion = ref(null)
const loading = ref(true)
const error = ref('')

const newComment = ref('')
const commentLoading = ref(false)

// 건의사항 로드
onMounted(async () => {
  const { data, error: fetchError } = await getSuggestion(suggestionId)

  if (fetchError || !data) {
    error.value = '건의사항을 찾을 수 없습니다.'
    loading.value = false
    return
  }

  suggestion.value = data
  loading.value = false

  // 댓글 로드
  await loadComments()
})

// 건의사항 삭제
const handleDelete = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return

  const { error: deleteError } = await deleteSuggestion(suggestionId)

  if (deleteError) {
    alert('삭제 중 오류가 발생했습니다.')
    return
  }

  alert('삭제되었습니다.')
  router.push('/suggestions')
}

// 댓글 작성
const handleAddComment = async () => {
  if (!newComment.value.trim()) return

  commentLoading.value = true

  const { error: commentError } = await createComment(newComment.value)

  if (commentError) {
    alert('댓글 작성 중 오류가 발생했습니다.')
    commentLoading.value = false
    return
  }

  newComment.value = ''
  commentLoading.value = false
}

// 댓글 삭제
const handleDeleteComment = async (commentId) => {
  if (!confirm('댓글을 삭제하시겠습니까?')) return

  const { error: deleteError } = await deleteComment(commentId)

  if (deleteError) {
    alert('댓글 삭제 중 오류가 발생했습니다.')
  }
}

// 카테고리 스타일
const getCategoryStyle = (category) => {
  const styles = {
    '정책': 'bg-blue-100 text-blue-700',
    '민원': 'bg-orange-100 text-orange-700',
    '기타': 'bg-gray-200 text-gray-700'
  }
  return styles[category] || 'bg-gray-200 text-gray-700'
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

// 날짜 포맷
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

useHead({
  title: suggestion.value ? `${suggestion.value.title} - 정치인 커뮤니티` : '건의사항 - 정치인 커뮤니티'
})
</script>
