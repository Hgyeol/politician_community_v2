<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 로딩 상태 -->
    <div v-if="politicianLoading" class="text-center py-16">
      <div class="inline-block animate-spin h-12 w-12 border-b-2 border-gray-800"></div>
    </div>

    <div v-else-if="politician">
      <!-- 정치인 정보 헤더 -->
      <div class="bg-white border border-gray-200 p-8 mb-8">
        <div class="flex items-start gap-8">
          <!-- 왼쪽: 국회의원 사진과 정보 -->
          <div class="flex-1 flex gap-6">
            <!-- Politician Image -->
            <div class="flex-shrink-0 w-[200px] h-[240px] overflow-hidden border border-gray-200">
              <img
                v-if="!imageFailed"
                :src="politicianImageSrc"
                :alt="politician.의원명"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                사진 없음
              </div>
            </div>

            <!-- 국회의원 정보 -->
            <div class="flex-1">
              <h2 class="text-3xl font-bold text-gray-900 mb-6">{{ politician.의원명 }} 의원</h2>
              <div class="space-y-2">
                <div class="flex py-4">
                  <span class="font-semibold text-gray-600 min-w-[100px] text-base">지역</span>
                  <span class="flex-1 text-gray-800 text-base leading-relaxed">{{ politician.지역 }}</span>
                </div>
                <div class="flex py-4">
                  <span class="font-semibold text-gray-600 min-w-[100px] text-base">정당</span>
                  <span class="flex-1 text-gray-800 text-base leading-relaxed">{{ politician.정당 }}</span>
                </div>
                <div class="flex py-4">
                  <span class="font-semibold text-gray-600 min-w-[100px] text-base">소속위원회</span>
                  <span class="flex-1 text-gray-800 text-base leading-relaxed">{{ politician.소속위원회 }}</span>
                </div>
                <div class="flex py-4">
                  <span class="font-semibold text-gray-600 min-w-[100px] text-base">당선</span>
                  <span class="flex-1 text-gray-800 text-base leading-relaxed">{{ politician.당선횟수 }}<template v-if="politician.당선방법"> ({{ politician.당선방법 }})</template></span>
                </div>
              </div>
            </div>
          </div>

          <!-- 오른쪽: 정당 사진 -->
          <div class="flex-shrink-0 w-[300px] h-[300px] flex items-center justify-center bg-white p-4">
            <img
              v-if="partyImageSrc"
              :src="partyImageSrc"
              :alt="politician.정당"
              class="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </div>

      <!-- 검색/필터 및 작성 버튼 -->
      <div class="mb-6 flex justify-between items-center gap-4">
        <!-- 검색 및 필터 -->
        <div class="flex items-center gap-3 flex-1">
          <!-- 카테고리 필터 -->
          <select
            v-model="selectedCategory"
            @change="handleFilterChange"
            class="px-4 py-2 border border-gray-300 bg-white focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            <option value="">전체 카테고리</option>
            <option value="경제">경제</option>
            <option value="교육">교육</option>
            <option value="환경">환경</option>
            <option value="복지">복지</option>
            <option value="안전">안전</option>
            <option value="교통">교통</option>
            <option value="문화">문화</option>
            <option value="기타">기타</option>
          </select>

          <!-- 제목 검색 -->
          <div class="flex items-center flex-1 max-w-md">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="제목으로 검색..."
              class="flex-1 px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              @keyup.enter="handleSearch"
            />
            <button
              @click="handleSearch"
              class="px-4 py-2 bg-gray-800 text-white font-medium hover:bg-gray-900 transition-colors border border-gray-800"
            >
              검색
            </button>
            <button
              v-if="searchKeyword || selectedCategory"
              @click="handleReset"
              class="ml-2 px-4 py-2 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
            >
              초기화
            </button>
          </div>
        </div>

        <!-- 작성 버튼 -->
        <NuxtLink
          v-if="isAuthenticated"
          :to="`/suggestions/new?politician_id=${politicianId}`"
          class="px-6 py-2 bg-gray-800 text-white font-medium hover:bg-gray-900 transition-colors whitespace-nowrap"
        >
          건의사항 작성
        </NuxtLink>
        <NuxtLink
          v-else
          to="/auth/login"
          class="px-6 py-2 bg-gray-600 text-white font-medium hover:bg-gray-700 transition-colors whitespace-nowrap"
        >
          로그인하여 작성하기
        </NuxtLink>
      </div>

      <!-- 건의사항 목록 -->
      <div class="bg-white border border-gray-200">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-center text-sm font-semibold text-gray-700 w-28">카테고리</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">제목</th>
              <th class="px-6 py-3 text-center text-sm font-semibold text-gray-700 w-28">작성자</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-20">조회</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-20">댓글</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-28">작성일</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="suggestion in filteredSuggestions"
              :key="suggestion.id"
              class="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              @click="navigateToDetail(suggestion.id)"
            >
              <td class="px-6 py-4 text-center">
                <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded whitespace-nowrap">
                  {{ suggestion.category }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-gray-900 font-medium hover:text-blue-600">
                  {{ suggestion.title }}
                </span>
              </td>
              <td class="px-6 py-4 text-center text-sm text-gray-600">
                {{ suggestion.profiles?.nickname || '익명' }}
              </td>
              <td class="px-6 py-4 text-center text-sm text-gray-600">
                {{ suggestion.view_count || 0 }}
              </td>
              <td class="px-6 py-4 text-center text-sm text-gray-600">
                {{ suggestion.comment_count || 0 }}
              </td>
              <td class="px-6 py-4 text-center text-sm text-gray-500 whitespace-nowrap">
                {{ formatDate(suggestion.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>

      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin h-8 w-8 border-b-2 border-gray-800"></div>
      </div>

      <!-- 더 보기 -->
      <div v-if="hasMore && !loading" ref="loadMoreTrigger" class="text-center py-8">
        <button
          @click="handleLoadMore"
          class="px-6 py-3 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
        >
          더 보기
        </button>
      </div>

      <!-- 빈 상태 -->
      <div v-if="!loading && filteredSuggestions.length === 0 && suggestions.length > 0" class="bg-white border border-gray-200 text-center py-16">
        <p class="text-gray-500 text-lg">검색 결과가 없습니다</p>
      </div>
      <div v-if="!loading && suggestions.length === 0" class="bg-white border border-gray-200 text-center py-16">
        <p class="text-gray-500 text-lg">아직 작성된 건의사항이 없습니다</p>
      </div>
    </div>

    <div v-else class="text-center py-16">
      <p class="text-gray-500 text-lg">정치인 정보를 찾을 수 없습니다</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'


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

// 검색 및 필터
const selectedCategory = ref('')
const searchKeyword = ref('')
const allSuggestions = ref<any[]>([]) // 모든 건의사항을 저장

// 필터링된 건의사항 목록
const filteredSuggestions = computed(() => {
  let result = suggestions.value

  // 제목 검색 필터
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    result = result.filter(s => s.title.toLowerCase().includes(keyword))
  }

  return result
})

// Image handling
const availableImageExtensions = ['jpg', 'png', 'gif', 'jpeg'];
const currentImageExtensionIndex = ref(0);
const politicianImageSrc = computed(() => {
  if (!politician.value) return '';
  const name = politician.value.의원명;
  const ext = availableImageExtensions[currentImageExtensionIndex.value];
  return `/image/${name}.${ext}`;
});
const imageFailed = ref(false);

const handleImageError = () => {
  if (currentImageExtensionIndex.value < availableImageExtensions.length - 1) {
    currentImageExtensionIndex.value++; // Try next extension
  } else {
    imageFailed.value = true; // All extensions tried, set to failed
  }
};

// 정당 이미지 매핑
const partyImageSrc = computed(() => {
  if (!politician.value || !politician.value.정당) return '';

  const partyImageMap = {
    '무소속': '/party_image/무소속.svg',
    '민주당': '/party_image/민주당.svg',
    '더불어민주당': '/party_image/민주당.svg',
    '진보당': '/party_image/진보당.svg',
    '개혁신당': '/party_image/개혁신당.png',
    '국민의힘': '/party_image/국민의힘.png',
    '새로운미래': '/party_image/새로운미래.png',
    '조국혁신당': '/party_image/조국혁신당.png'
  };

  return partyImageMap[politician.value.정당] || '';
});

// 검색 및 필터 핸들러
async function handleFilterChange() {
  // 카테고리 필터가 변경되면 목록 초기화 후 다시 로드
  reset()
  const filters: any = { politician_id: politicianId }
  if (selectedCategory.value) {
    filters.category = selectedCategory.value
  }
  await loadMore(filters)
}

function handleSearch() {
  // 제목 검색은 프론트엔드에서 필터링 (computed 사용)
  // 별도 액션 필요 없음
}

async function handleReset() {
  // 모든 필터 초기화
  selectedCategory.value = ''
  searchKeyword.value = ''
  reset()
  await loadMore({ politician_id: politicianId })
}

function navigateToDetail(id: number) {
  router.push(`/suggestions/${id}`)
}

async function handleLoadMore() {
  // 현재 선택된 필터를 유지하면서 더 로드
  const filters: any = { politician_id: politicianId }
  if (selectedCategory.value) {
    filters.category = selectedCategory.value
  }
  await loadMore(filters)
}

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
          handleLoadMore()
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

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()

  // 오늘 작성된 글이면 시간만 표시
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // 올해 작성된 글이면 월/일 표시
  if (date.getFullYear() === now.getFullYear()) {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}/${day}`
  }

  // 작년 이전 글이면 년.월.일 표시
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}
</script>
