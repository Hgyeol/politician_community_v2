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
      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="text-center py-16">
      <p class="text-red-600 text-lg mb-4">{{ error }}</p>
      <button
        @click="router.back()"
        class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
      >
        돌아가기
      </button>
    </div>

    <!-- 건의사항 상세 -->
    <div v-else-if="suggestion">
      <!-- 헤더 -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <button
            @click="goToList"
            class="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← 목록으로
          </button>
          <div v-if="isOwner" class="flex gap-2">
            <button
              @click="handleEdit"
              class="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              수정
            </button>
            <button
              @click="handleDelete"
              class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      </div>

      <!-- 건의사항 본문 -->
      <div class="bg-white border border-gray-200 rounded-lg p-8 mb-6">
        <div class="mb-4">
          <span class="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm font-medium">
            {{ suggestion.category }}
          </span>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-6">
          {{ suggestion.title }}
        </h1>

        <div class="flex items-center justify-between text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
          <div class="flex items-center space-x-4">
            <span class="font-medium text-gray-700">{{ suggestion.profiles?.nickname || '익명' }}</span>
            <span>→</span>
            <NuxtLink
              :to="`/politicians/${suggestion.politician_id}/suggestions`"
              class="font-medium text-gray-800 hover:text-blue-800"
            >
              {{ suggestion.politicians?.name }}
            </NuxtLink>
            <span>({{ suggestion.politicians?.region }})</span>
          </div>
          <div class="flex items-center space-x-4">
            <span>조회 {{ suggestion.view_count || 0 }}</span>
            <span>{{ formatDate(suggestion.created_at) }}</span>
          </div>
        </div>

        <div class="prose max-w-none">
          <p class="text-gray-800 whitespace-pre-wrap leading-relaxed">{{ suggestion.content }}</p>
        </div>
      </div>

      <!-- 댓글 섹션 -->
      <div class="bg-white border border-gray-200 rounded-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          댓글 {{ comments.length }}
        </h2>



        <!-- New Top-Level Comment Input -->
        <div v-if="isAuthenticated" class="mb-8">
          <textarea
            v-model="newComment"
            rows="3"
            placeholder="새 댓글을 작성하세요"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2"
          ></textarea>
          <div class="flex justify-end">
            <button
              @click="handleCreateComment(null)"
              :disabled="!newComment.trim() || commentSubmitting"
              class="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              댓글 작성
            </button>
          </div>
        </div>

        <div v-else class="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p class="text-gray-600 mb-2">댓글을 작성하려면 로그인이 필요합니다</p>
          <NuxtLink
            to="/auth/login"
            class="text-gray-800 hover:text-blue-800 font-medium"
          >
            로그인하기 →
          </NuxtLink>
        </div>

        <!-- 댓글 목록 -->
        <div class="space-y-4">
          <template v-if="comments.length > 0">
            <div
              v-for="comment in threadedComments"
              :key="comment.id"
              class="border-b border-gray-200 pb-4 last:border-0"
            >
                            <div> <!-- NEW WRAPPING DIV START -->
                              <!-- Parent Comment -->
                              <div>
                                <div class="flex justify-between items-start mb-2">
                                  <div class="flex items-center space-x-3">
                                    <span class="font-medium text-gray-900">{{ getCommentNickname(comment) }}</span>
                                    <span class="text-sm text-gray-500">{{ formatDate(comment.created_at) }}</span>
                                  </div>
                                  <div class="flex gap-2">
                                    <button
                                      v-if="isAuthenticated"
                                      @click="replyToComment(comment)"
                                      class="text-sm text-gray-600 hover:text-blue-700"
                                    >
                                      답글
                                    </button>
                                    <template v-if="user && (user.id || user.sub) === comment.user_id">
                                      <button
                                        @click="handleEditComment(comment)"
                                        class="text-sm text-gray-800 hover:text-blue-800"
                                      >
                                        수정
                                      </button>
                                      <button
                                        @click="handleDeleteComment(comment.id)"
                                        class="text-sm text-red-600 hover:text-red-800"
                                      >
                                      삭제
                                      </button>
                                    </template>
                                  </div>
                                </div>
              
                                <div v-if="editingCommentId === comment.id">
                                  <textarea
                                    v-model="editingCommentContent"
                                    rows="3"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2"
                                  ></textarea>
                                  <div class="flex justify-end gap-2">
                                    <button
                                      @click="handleUpdateComment(comment.id)"
                                      class="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900"
                                    >
                                      저장
                                    </button>
                                    <button
                                      @click="cancelEditComment"
                                      class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                                    >
                                      취소
                                    </button>
                                  </div>
                                </div>
                                <p v-else class="text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>
              
                                <!-- REPLY INPUT FORM FOR TOP-LEVEL COMMENT -->
                                <div v-if="isAuthenticated && replyingToCommentId === comment.id" class="mt-4">
                                  <textarea
                                    v-model="newReplyContent"
                                    rows="3"
                                    placeholder="답글을 작성하세요"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2"
                                  ></textarea>
                                  <div class="flex justify-end gap-2">
                                    <button
                                      @click="handleCreateComment(comment.id)"
                                      :disabled="!newReplyContent.trim() || commentSubmitting"
                                      class="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                      답글 작성
                                    </button>
                                    <button
                                      @click="cancelReply"
                                      class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                                    >
                                      취소
                                    </button>
                                  </div>
                                </div>
                              </div>
              
              
                              <!-- Replies -->
                              <div
                                v-if="comment.replies && comment.replies.length > 0"
                                class="ml-8 mt-4 space-y-4 border-t border-gray-200 pt-4"
                              >
                                <div
                                  v-for="reply in comment.replies"
                                  :key="reply.id"
                                >
                                  <div class="flex justify-between items-start mb-2">
                                    <div class="flex items-center space-x-3">
                                      <span class="font-medium text-gray-900">{{ getCommentNickname(reply) }}</span>
                                      <span class="text-sm text-gray-500">{{ formatDate(reply.created_at) }}</span>
                                    </div>
                                                        <div class="flex gap-2">
                                                          <template v-if="user && (user.id || user.sub) === reply.user_id">
                                                            <button
                                                              @click="handleEditComment(reply)"
                                                              class="text-sm text-gray-800 hover:text-blue-800"
                                                            >
                                                              수정
                                                            </button>
                                                            <button
                                                              @click="handleDeleteComment(reply.id)"
                                                              class="text-sm text-red-600 hover:text-red-800"
                                                            >
                                                              삭제
                                                            </button>
                                                          </template>
                                                        </div>                                  </div>
              
                                  <div v-if="editingCommentId === reply.id">
                                    <textarea
                                      v-model="editingCommentContent"
                                      rows="3"
                                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2"
                                    ></textarea>
                                    <div class="flex justify-end gap-2">
                                      <button
                                        @click="handleUpdateComment(reply.id)"
                                        class="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900"
                                      >
                                        저장
                                      </button>
                                      <button
                                        @click="cancelEditComment"
                                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  </div>
                                  <p v-else class="text-gray-700 whitespace-pre-wrap">{{ reply.content }}</p>
              
                                                                  </div>
                              </div>
                            </div> <!-- NEW WRAPPING DIV END -->
            </div>
          </template>

          <div v-else class="text-center py-8 text-gray-500">
            아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated, signOut } = useAuth()
const { getSuggestion, deleteSuggestion } = useSuggestions()

const handleSignOut = async () => {
  await signOut()
  router.push('/')
}

const suggestionId = parseInt(route.params.id as string)
const { comments, loadComments, createComment, updateComment, deleteComment } = useComments(suggestionId)

const suggestion = ref(null)
const loading = ref(true)
const error = ref('')

const newComment = ref('')
const commentSubmitting = ref(false)

const editingCommentId = ref<number | null>(null)
const editingCommentContent = ref('')

const replyingToCommentId = ref<number | null>(null)
const newReplyContent = ref('')
const replyingToNickname = ref<string | null>(null)

const isOwner = computed(() => {
  const userId = user.value?.id || user.value?.sub
  return user.value && suggestion.value && userId === suggestion.value.user_id
})

// Helper to get nickname from comment or profile
const getCommentNickname = (comment: any) => {
  return comment.profiles?.nickname || '익명'
}

const threadedComments = computed(() => {
  const topLevelComments = comments.value.filter(comment => !comment.parent_id);
  const replies = comments.value.filter(comment => comment.parent_id);

  const commentsMap = new Map(comments.value.map(comment => [comment.id, { ...comment, replies: [] }]));

  replies.forEach(reply => {
    const parent = commentsMap.get(reply.parent_id);
    if (parent) {
      parent.replies.push(reply);
    }
  });

  // Sort top-level comments by creation date
  topLevelComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Sort replies for each top-level comment by creation date
  commentsMap.forEach(comment => {
    if (comment.replies) {
      comment.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
  });

  // Only return top-level comments with their direct replies
  // This structure currently supports one level of nesting (original comment + direct replies)
  return topLevelComments.map(comment => commentsMap.get(comment.id));
})


onMounted(async () => {
  await loadSuggestion()
  await loadComments()
})

async function loadSuggestion() {
  loading.value = true
  error.value = ''

  const { data, error: loadError } = await getSuggestion(suggestionId)

  if (loadError) {
    error.value = loadError
  } else {
    suggestion.value = data
  }

  loading.value = false
}

async function handleCreateComment(parentId: number | null = null) {
  let content = '';
  if (parentId === null) { // This is a top-level comment
    content = newComment.value;
  } else { // This is an inline reply
    content = newReplyContent.value;
  }

  if (!content.trim() || commentSubmitting.value) return;

  commentSubmitting.value = true;

  const { error: createError } = await createComment(content, parentId);

  if (createError) {
    alert('댓글 작성에 실패했습니다: ' + createError);
  } else {
    if (parentId === null) { // Clear top-level comment input
      newComment.value = '';
    } else { // Clear inline reply input
      newReplyContent.value = '';
    }
    cancelReply(); // Clear reply state (replyingToCommentId) after successful comment
    await loadComments();
  }

  commentSubmitting.value = false;
}

function handleEditComment(comment: any) {
  editingCommentId.value = comment.id
  editingCommentContent.value = comment.content
  cancelReply() // Exit reply mode when editing
}

function cancelEditComment() {
  editingCommentId.value = null
  editingCommentContent.value = ''
}

function cancelReply() {
  replyingToCommentId.value = null
  newReplyContent.value = '' // Clear the reply input content
  replyingToNickname.value = null
}

function replyToComment(comment: any) {
  replyingToCommentId.value = comment.id
  replyingToNickname.value = getCommentNickname(comment)
  cancelEditComment() // Exit edit mode when replying
}

function goToList() {
  // 건의사항의 정치인 ID로 해당 정치인의 건의사항 목록 페이지로 이동
  if (suggestion.value && suggestion.value.politician_id) {
    router.push(`/politicians/${suggestion.value.politician_id}/suggestions`)
  } else {
    // politician_id가 없으면 뒤로 가기
    router.back()
  }
}

async function handleEdit() {
  // 수정 기능은 추후 구현
  alert('수정 기능은 현재 준비 중입니다')
}

async function handleUpdateComment(commentId: number) {
  if (!editingCommentContent.value.trim()) return

  const { error: updateError } = await updateComment(commentId, editingCommentContent.value)

  if (updateError) {
    alert('댓글 수정에 실패했습니다: ' + updateError)
  } else {
    cancelEditComment()
  }
}

async function handleDeleteComment(commentId: number) {
  if (!confirm('댓글을 삭제하시겠습니까?')) return

  const { error: deleteError } = await deleteComment(commentId)

  if (deleteError) {
    alert('댓글 삭제에 실패했습니다: ' + deleteError)
  } else {
    // After deleting a comment, reload all comments to ensure the threaded structure is updated
    await loadComments()
  }
}

async function handleDelete() {
  if (!confirm('건의사항을 삭제하시겠습니까?')) return

  const { error: deleteError } = await deleteSuggestion(suggestionId)

  if (deleteError) {
    alert('삭제에 실패했습니다: ' + deleteError)
  } else {
    router.push('/suggestions')
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
