# 프로젝트 계획: 정치인 건의사항 게시판

## 1. 프로젝트 개요

- **프로젝트명**: 정치인 커뮤니티 (Politician Community)
- **주제**: 정치인에게 건의사항을 작성하는 시민 참여형 게시판
- **목표**: 사용자가 지도에서 지역별 정치인을 찾고, 해당 정치인에게 직접 건의사항을 작성하고 공유할 수 있는 투명한 정치 참여 플랫폼 구축
- **제출 마감**: 2025년 12월 18일 23:59
- **디자인**: 현대적이고 세련된 UI/UX를 적용하여 사용성을 높입니다.

## 2. 기존 gc-board의 아쉬운 점과 개선 방향

| 아쉬운 점 | 개선 방향 | 적용 기술 |
|----------|----------|----------|
| **페이지네이션 성능 문제** | LIMIT OFFSET 방식은 데이터가 많아질수록 성능이 저하됨. 건의사항이 계속 누적되는 서비스 특성상 효율적인 목록 조회가 필요함. | **커서 기반 무한 스크롤** (lastId 활용) - Supabase에서 range()와 lt() 필터를 사용한 커서 기반 쿼리 + Nuxt.js Intersection Observer |
| **코드의 재사용성 부족** | 각 모듈마다 환경 설정을 반복하고 있음. | Nuxt.js의 Composables와 Supabase 클라이언트를 활용한 중앙 집중식 데이터 관리 및 재사용 가능한 로직 구현 |

## 3. 핵심 기술 스택

- **프레임워크**: **Nuxt.js 3** (풀스택 프레임워크 - SSR, API Routes 지원)
- **언어**: JavaScript/TypeScript
- **백엔드/데이터베이스**: **Supabase** (PostgreSQL, 실시간 API, Row Level Security, 사용자 인증)
- **UI/UX**: **Tailwind CSS** (모던 디자인 시스템)
- **배포**: **Vercel** 또는 **Netlify** (Nuxt.js 자동 배포)

## 4. 필수 구현 기능

### 4.1 핵심 도메인

#### 건의사항 (suggestions 테이블)
- **생성**: 로그인한 사용자가 특정 정치인에게 건의사항 작성
  - 필드: title, content, category, politician_id, user_id, view_count, created_at
- **조회**: 건의사항 상세 보기 (조회수 증가 - Supabase RPC 함수)
- **목록 조회**: **커서 기반 무한 스크롤**로 건의사항 목록 표시
  - Supabase에서 `id < lastId` 조건으로 효율적인 페이지네이션
  - 필터링: 정치인별, 카테고리별, 지역별
  - 정렬: 최신순 (id DESC)
- **수정**: 작성자 본인만 수정 가능 (Supabase RLS 정책)
- **삭제**: 작성자 본인만 삭제 가능 (Supabase RLS 정책)

#### 댓글 (comments 테이블)
- **생성**: 로그인한 사용자가 건의사항에 댓글 작성
  - 필드: content, suggestion_id, user_id, created_at
- **조회**: 건의사항별 댓글 목록 조회
- **수정**: 작성자 본인만 수정 가능 (Supabase RLS 정책)
- **삭제**: 작성자 본인만 삭제 가능 (Supabase RLS 정책)

### 4.2 사용자 인증 (Supabase Auth)
- **회원가입**: 이메일, 비밀번호 (Supabase Auth)
  - 추가 정보는 profiles 테이블에 저장 (닉네임, 거주 지역)
- **로그인/로그아웃**: Supabase Auth 활용
- **권한 검증**: Supabase Row Level Security (RLS) 정책으로 자동 처리

### 4.3 주요 페이지
1. **메인 페이지**: `/` - 정치인 지도 (완료)
2. **건의사항 목록**: `/suggestions` - 커서 기반 무한 스크롤
3. **건의사항 상세**: `/suggestions/:id` - 내용, 댓글 표시
4. **건의사항 작성**: `/suggestions/new` - 폼 입력
5. **회원가입/로그인**: `/auth/signup`, `/auth/login`
6. **마이페이지**: `/profile` - 내가 쓴 글/댓글

## 5. 주요 기능 개발 계획

### Phase 1: Supabase 프로젝트 설정 및 데이터베이스 설계

- **[ ] Task 1-1: Supabase 프로젝트 생성**
  - Supabase 대시보드에서 새 프로젝트 생성
  - API URL 및 anon key 확인
  - `.env` 파일에 환경변수 설정
- **[ ] Task 1-2: 데이터베이스 테이블 생성 (SQL Editor 사용)**
  ```sql
  -- profiles 테이블 (사용자 추가 정보)
  CREATE TABLE profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    nickname TEXT NOT NULL,
    region TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- politicians 테이블 (정치인 정보)
  CREATE TABLE politicians (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    party TEXT,
    committee TEXT,
    election_count TEXT,
    election_method TEXT
  );

  -- suggestions 테이블 (건의사항)
  CREATE TABLE suggestions (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT CHECK (category IN ('정책', '민원', '기타')),
    politician_id BIGINT REFERENCES politicians(id),
    user_id UUID REFERENCES auth.users NOT NULL,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- comments 테이블 (댓글)
  CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    suggestion_id BIGINT REFERENCES suggestions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- 인덱스 생성 (커서 기반 쿼리 최적화)
  CREATE INDEX idx_suggestions_id_desc ON suggestions (id DESC);
  CREATE INDEX idx_suggestions_politician ON suggestions (politician_id);
  CREATE INDEX idx_comments_suggestion ON comments (suggestion_id);
  ```
- **[ ] Task 1-3: Row Level Security (RLS) 정책 설정**
  ```sql
  -- suggestions 테이블 RLS 활성화
  ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

  -- 모든 사용자가 조회 가능
  CREATE POLICY "Everyone can read suggestions"
    ON suggestions FOR SELECT
    USING (true);

  -- 로그인한 사용자만 작성 가능
  CREATE POLICY "Authenticated users can insert suggestions"
    ON suggestions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  -- 작성자만 수정 가능
  CREATE POLICY "Users can update own suggestions"
    ON suggestions FOR UPDATE
    USING (auth.uid() = user_id);

  -- 작성자만 삭제 가능
  CREATE POLICY "Users can delete own suggestions"
    ON suggestions FOR DELETE
    USING (auth.uid() = user_id);

  -- comments 테이블도 동일하게 RLS 설정
  ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Everyone can read comments" ON comments FOR SELECT USING (true);
  CREATE POLICY "Authenticated users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
  ```
- **[ ] Task 1-4: Supabase Auth 설정**
  - 이메일 인증 활성화 (또는 테스트용으로 비활성화)
  - 사용자 가입 시 자동으로 profiles 테이블에 행 추가되도록 트리거 설정

### Phase 2: Nuxt.js - Supabase 연동 및 인증 구현

- **[ ] Task 2-1: Supabase 클라이언트 설정**
  - `@nuxtjs/supabase` 모듈 설치
  - `nuxt.config.ts`에서 Supabase 설정
  ```bash
  npm install @nuxtjs/supabase
  ```
  ```javascript
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: ['@nuxtjs/supabase'],
    supabase: {
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_KEY,
    }
  })
  ```
- **[ ] Task 2-2: 회원가입/로그인 페이지 구현**
  - `/auth/signup.vue`, `/auth/login.vue` 페이지 작성
  - Supabase Auth API 사용 (`signUp`, `signInWithPassword`)
  - 로그인 성태 확인 및 리다이렉트
- **[ ] Task 2-3: 인증 미들웨어 구현**
  - `middleware/auth.js` 작성
  - 로그인 필요한 페이지 보호
- **[ ] Task 2-4: 사용자 정보 composable 작성**
  - `composables/useAuth.js` - 현재 로그인 사용자 정보 관리

### Phase 3: 메인 페이지 및 지도 연동
- **[x] Task 3-1: 정치인 지도 구현 완료**
  - 지역 클릭 시 정치인 정보 사이드 패널 표시
  - D3.js 기반 SVG 지도 줌/팬 기능
- **[ ] Task 3-2: 정치인 데이터를 Supabase로 마이그레이션**
  - 현재 CSV 데이터를 Supabase politicians 테이블에 삽입
  - 지도 컴포넌트에서 Supabase에서 정치인 정보 조회하도록 수정

### Phase 4: 건의사항 CRUD 기능 구현

- **[ ] Task 4-1: 건의사항 작성 페이지 구현**
  - `/suggestions/new.vue` 페이지 작성
  - 제목, 내용, 카테고리, 정치인 선택 폼
  - Supabase insert 쿼리
  ```javascript
  const { data, error } = await supabase
    .from('suggestions')
    .insert({
      title: form.title,
      content: form.content,
      category: form.category,
      politician_id: form.politicianId,
      user_id: user.id
    })
  ```
- **[ ] Task 4-2: 건의사항 상세 페이지 구현**
  - `/suggestions/[id].vue` 페이지 작성
  - 건의사항 내용 표시
  - 조회수 증가 (Supabase RPC 함수 호출)
  - 댓글 목록 표시
  - 수정/삭제 버튼 (작성자만 - RLS로 자동 처리)
- **[ ] Task 4-3: 건의사항 수정 페이지 구현**
  - `/suggestions/[id]/edit.vue` 페이지
  - 기존 데이터 불러오기
  - Supabase update 쿼리

### Phase 4-4: 커서 기반 무한 스크롤 구현 (핵심 심화 기술)

- **[ ] Task 4-4-1: useSuggestions composable 작성**
  ```javascript
  // composables/useSuggestions.js
  export const useSuggestions = () => {
    const supabase = useSupabaseClient()
    const suggestions = ref([])
    const lastId = ref(null)
    const hasMore = ref(true)
    const loading = ref(false)

    const loadMore = async () => {
      if (loading.value || !hasMore.value) return

      loading.value = true
      try {
        let query = supabase
          .from('suggestions')
          .select('*, profiles(nickname), politicians(name, region)')
          .order('id', { ascending: false })
          .limit(20)

        // 커서 기반 쿼리 (lastId보다 작은 ID만 조회)
        if (lastId.value) {
          query = query.lt('id', lastId.value)
        }

        const { data, error } = await query

        if (error) throw error

        if (data && data.length > 0) {
          suggestions.value.push(...data)
          lastId.value = data[data.length - 1].id
          hasMore.value = data.length === 20
        } else {
          hasMore.value = false
        }
      } catch (error) {
        console.error('Failed to load suggestions:', error)
      } finally {
        loading.value = false
      }
    }

    return { suggestions, loadMore, hasMore, loading }
  }
  ```
- **[ ] Task 4-4-2: 건의사항 목록 페이지에 무한 스크롤 적용**
  - `/suggestions/index.vue` 페이지 작성
  - Intersection Observer를 사용하여 스크롤 끝 감지
  - `loadMore()` 자동 호출
  - 로딩 상태 표시
  - "모든 게시글을 불러왔습니다" 메시지
- **[ ] Task 4-4-3: 필터링 기능 추가**
  - 정치인별 필터
  - 카테고리별 필터
  - 지역별 필터
  - composable에 필터 파라미터 추가

### Phase 5: 댓글 기능 구현

- **[ ] Task 5-1: 댓글 CRUD 구현**
  - 댓글 목록 조회 (Supabase select with join)
  - 댓글 작성 폼
  - 댓글 수정/삭제 (작성자만)
- **[ ] Task 5-2: 실시간 댓글 업데이트 (선택)**
  - Supabase Realtime 구독으로 새 댓글 자동 표시

### Phase 6: 전체 스타일링 및 UX 고도화

- **[ ] Task 6-1: Tailwind CSS 반응형 디자인 적용**
  - 모바일, 태블릿, 데스크탑 대응
- **[ ] Task 6-2: 전역 UI 컴포넌트 제작**
  - Button, Input, Card, Modal 등
  - 디자인 시스템 일관성
- **[ ] Task 6-3: 사용자 피드백 개선**
  - 로딩 스피너
  - 토스트 알림 (성공/에러)
  - 빈 상태 메시지

### Phase 7: 배포 및 문서화

- **[ ] Task 7-1: Vercel/Netlify 배포**
  - Nuxt.js 프로젝트 배포
  - 환경변수 설정 (SUPABASE_URL, SUPABASE_KEY)
  - 도메인 연결
- **[ ] Task 7-2: `README.md` 작성**
  - 프로젝트 소개
  - 기존 gc-board 대비 개선 사항 (커서 기반 무한 스크롤, Supabase 활용)
  - 기술 스택 (Nuxt.js + Supabase)
  - 주요 기능
  - 데이터베이스 스키마 (ERD)
  - 실행 방법
  - 배포 URL
- **[ ] Task 7-3: 시연 영상 제작**
  - 회원가입 → 로그인
  - 지도에서 정치인 선택
  - 건의사항 작성
  - **건의사항 목록에서 무한 스크롤 동작** (핵심!)
  - 댓글 작성
  - 권한 검증 시연 (타인의 글 수정 불가)
- **[ ] Task 7-4: 최종 제출**
  - 구글 클래스룸 제출 (12월 18일 23:59까지)

## 6. 커서 기반 무한 스크롤 구현 상세 설명 (Supabase + Nuxt.js)

### 왜 LIMIT OFFSET 대신 커서 방식인가?

#### LIMIT OFFSET 방식의 문제점
```sql
-- 1000번째 페이지 조회 시
SELECT * FROM suggestions
ORDER BY id DESC
LIMIT 20 OFFSET 1000;
-- 데이터베이스가 1020개의 행을 스캔한 후 20개만 반환 → 비효율적
```

#### 커서 방식의 이점
```sql
-- lastId=5000 이후 데이터 조회
SELECT * FROM suggestions
WHERE id < 5000
ORDER BY id DESC
LIMIT 20;
-- 인덱스를 활용하여 20개의 행만 스캔 → 효율적
```

### Supabase에서 커서 기반 쿼리 구현

Supabase는 PostgreSQL 기반이므로 `.lt()` (less than) 필터를 사용하여 커서 기반 페이지네이션을 구현합니다.

```javascript
// composables/useSuggestions.js
export const useSuggestions = () => {
  const supabase = useSupabaseClient()
  const suggestions = ref([])
  const lastId = ref(null)
  const hasMore = ref(true)
  const loading = ref(false)

  const loadMore = async () => {
    // 중복 요청 방지
    if (loading.value || !hasMore.value) return

    loading.value = true
    try {
      let query = supabase
        .from('suggestions')
        .select(`
          *,
          profiles:user_id (nickname),
          politicians:politician_id (name, region)
        `)
        .order('id', { ascending: false })
        .limit(20)

      // 커서 기반: lastId보다 작은 ID만 조회
      if (lastId.value) {
        query = query.lt('id', lastId.value)
      }

      const { data, error } = await query

      if (error) throw error

      if (data && data.length > 0) {
        suggestions.value.push(...data)
        lastId.value = data[data.length - 1].id
        hasMore.value = data.length === 20 // 20개 미만이면 더 이상 없음
      } else {
        hasMore.value = false
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    suggestions.value = []
    lastId.value = null
    hasMore.value = true
  }

  return { suggestions, loadMore, hasMore, loading, reset }
}
```

### 프론트엔드 무한 스크롤 구현

```vue
<!-- pages/suggestions/index.vue -->
<template>
  <div class="suggestions-page">
    <h1 class="text-3xl font-bold mb-8">건의사항 목록</h1>

    <div class="suggestions-list space-y-4">
      <SuggestionCard
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        :suggestion="suggestion"
      />
    </div>

    <!-- 무한 스크롤 감지 영역 (보이지 않는 요소) -->
    <div ref="sentinel" class="h-10"></div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="text-center py-8">
      <div class="loading-spinner">로딩 중...</div>
    </div>

    <!-- 모든 데이터 로드 완료 -->
    <div v-if="!hasMore && suggestions.length > 0" class="text-center py-8 text-gray-500">
      모든 게시글을 불러왔습니다.
    </div>

    <!-- 데이터 없음 -->
    <div v-if="!loading && suggestions.length === 0" class="text-center py-16 text-gray-500">
      아직 건의사항이 없습니다.
    </div>
  </div>
</template>

<script setup>
const { suggestions, loadMore, hasMore, loading } = useSuggestions()
const sentinel = ref(null)

// Intersection Observer를 사용한 무한 스크롤
onMounted(async () => {
  // 초기 데이터 로드
  await loadMore()

  // 스크롤 끝 감지
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    },
    {
      threshold: 0.1, // 10%만 보여도 트리거
      rootMargin: '100px' // 100px 전에 미리 로드
    }
  )

  if (sentinel.value) {
    observer.observe(sentinel.value)
  }

  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>

<style scoped>
.suggestions-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
```

### SuggestionCard 컴포넌트 예시

```vue
<!-- components/SuggestionCard.vue -->
<template>
  <NuxtLink
    :to="`/suggestions/${suggestion.id}`"
    class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
  >
    <div class="flex justify-between items-start mb-2">
      <h2 class="text-xl font-semibold">{{ suggestion.title }}</h2>
      <span class="text-sm text-gray-500">{{ formatCategory(suggestion.category) }}</span>
    </div>

    <p class="text-gray-600 mb-4 line-clamp-2">{{ suggestion.content }}</p>

    <div class="flex items-center justify-between text-sm text-gray-500">
      <div class="flex items-center space-x-4">
        <span>{{ suggestion.profiles?.nickname || '익명' }}</span>
        <span>→ {{ suggestion.politicians?.name }}</span>
      </div>
      <div class="flex items-center space-x-2">
        <span>조회 {{ suggestion.view_count }}</span>
        <span>{{ formatDate(suggestion.created_at) }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  suggestion: Object
})

const formatCategory = (category) => {
  const map = { '정책': '📋', '민원': '📢', '기타': '💬' }
  return `${map[category] || ''} ${category}`
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR')
}
</script>
```

## 7. 데이터베이스 ERD

```
auth.users (Supabase Auth)
├─ id (UUID, PK)
├─ email
└─ encrypted_password

profiles (사용자 추가 정보)
├─ id (UUID, PK, FK → auth.users)
├─ nickname
├─ region
└─ created_at

politicians (정치인 정보)
├─ id (BIGSERIAL, PK)
├─ name
├─ region
├─ party
├─ committee
├─ election_count
└─ election_method

suggestions (건의사항)
├─ id (BIGSERIAL, PK)
├─ title
├─ content
├─ category
├─ politician_id (FK → politicians)
├─ user_id (FK → auth.users)
├─ view_count
├─ created_at
└─ updated_at

comments (댓글)
├─ id (BIGSERIAL, PK)
├─ content
├─ suggestion_id (FK → suggestions)
├─ user_id (FK → auth.users)
├─ created_at
└─ updated_at
```

## 8. 예상 결과물

1. **접속 가능한 웹사이트 URL**
   - `https://politician-community.vercel.app`

2. **GitHub 저장소**
   - 현재 저장소 (Nuxt.js 풀스택 프로젝트)

3. **시연 동영상** (핵심 포함 사항)
   - 회원가입 → 로그인 (Supabase Auth)
   - 지도에서 정치인 선택
   - 건의사항 작성
   - **건의사항 목록에서 무한 스크롤 동작** (화면 아래로 스크롤 시 자동 데이터 로드) - 핵심!
   - 댓글 작성
   - 권한 검증 (Supabase RLS로 타인의 글 수정/삭제 불가)

4. **프로젝트 문서**
   - README.md (프로젝트 소개, 개선 사항, 실행 방법)
   - ERD 다이어그램
   - Supabase 테이블 스키마 문서

## 9. 성공 기준 체크리스트

- [ ] 모든 필수 구현 기능 완성 (건의사항/댓글 CRUD, 인증)
- [ ] **커서 기반 무한 스크롤 정상 작동** (Supabase `.lt()` 필터 활용) - 핵심!
- [ ] Supabase Row Level Security (RLS) 정책 적용 (권한 검증)
- [ ] Supabase Auth를 통한 사용자 인증 구현
- [ ] Nuxt.js 프로젝트 배포 완료 (Vercel/Netlify)
- [ ] 접속 가능한 URL 제공
- [ ] 시연 동영상에서 무한 스크롤 명확히 확인 가능
- [ ] README.md 작성 완료 (개선 사항 명시)

**제출 마감: 2025년 12월 18일 23:59**
**오늘 완료 목표!**