# 정치인 커뮤니티 - 건의사항 게시판

> 지역 정치인에게 직접 건의사항을 작성하고 공유하는 시민 참여형 플랫폼

![Nuxt.js](https://img.shields.io/badge/Nuxt.js-3.x-00DC82?logo=nuxt.js)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)

## 프로젝트 소개

이 프로젝트는 시민들이 지역 정치인에게 직접 건의사항을 전달하고, 다른 시민들과 의견을 공유할 수 있는 참여형 게시판 서비스입니다.

### 주요 기능

- **정치인 지도**: D3.js 기반 인터랙티브 지도로 지역별 정치인 정보 확인
- **건의사항 작성**: 로그인한 사용자가 정치인에게 직접 건의사항 작성
- **커서 기반 무한 스크롤**: 효율적인 데이터 로딩으로 빠른 목록 조회
- **댓글 기능**: 건의사항에 대한 의견 공유
- **권한 관리**: Supabase RLS를 통한 자동 권한 검증 (작성자만 수정/삭제 가능)

## 기존 gc-board 대비 개선 사항

### 1. 페이지네이션 성능 개선

#### 문제점
```sql
-- LIMIT OFFSET 방식 (기존)
SELECT * FROM suggestions ORDER BY id DESC LIMIT 20 OFFSET 1000;
-- 데이터베이스가 1020개 행을 스캔 → 비효율적
```

#### 개선
```sql
-- 커서 기반 방식 (개선)
SELECT * FROM suggestions WHERE id < 5000 ORDER BY id DESC LIMIT 20;
-- 인덱스를 활용하여 20개 행만 스캔 → 효율적
```

**구현 방법:**
- Supabase의 `.lt()` 필터를 사용한 커서 기반 쿼리
- Nuxt.js Intersection Observer로 스크롤 끝 감지
- 자동으로 다음 데이터 로드

### 2. 코드 재사용성 향상

#### 개선 사항
- **Nuxt.js Composables**: `useAuth`, `useSuggestions`, `useComments` 등 재사용 가능한 로직 모듈화
- **Supabase 클라이언트**: 중앙 집중식 데이터베이스 연결 관리
- **환경 설정**: `.env` 파일로 환경변수 통합 관리

## 기술 스택

### 프론트엔드
- **Nuxt.js 3**: Vue.js 기반 풀스택 프레임워크 (SSR, API Routes 지원)
- **Vue 3**: Composition API
- **D3.js**: 인터랙티브 지도 시각화
- **CSS**: 커스텀 스타일링 (반응형 디자인)

### 백엔드/데이터베이스
- **Supabase**: PostgreSQL 기반 BaaS (Backend as a Service)
  - 데이터베이스 (PostgreSQL)
  - 실시간 API
  - Row Level Security (RLS)
  - 사용자 인증 (Auth)

### 배포
- **Vercel** 또는 **Netlify**: Nuxt.js 프로젝트 자동 배포

## 데이터베이스 ERD

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
└─ ...

suggestions (건의사항)
├─ id (BIGSERIAL, PK)
├─ title
├─ content
├─ category
├─ politician_id (FK → politicians)
├─ user_id (FK → auth.users)
└─ view_count

comments (댓글)
├─ id (BIGSERIAL, PK)
├─ content
├─ suggestion_id (FK → suggestions)
└─ user_id (FK → auth.users)
```

## 설치 및 실행 방법

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd politician-map
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Supabase 설정

자세한 Supabase 설정 방법은 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)를 참조하세요.

**요약:**
1. [Supabase](https://supabase.com) 프로젝트 생성
2. `supabase-schema.sql` 파일 실행 (SQL Editor)
3. 의원.csv 데이터를 politicians 테이블에 삽입
4. `.env` 파일 설정:

```bash
cp .env.example .env
# .env 파일을 열어 Supabase URL과 Key 입력
```

### 4. Supabase 모듈 설치

```bash
npm install @nuxtjs/supabase
```

### 5. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 6. 빌드 및 배포

```bash
npm run build
npm run preview  # 빌드 결과 미리보기
```

## 주요 페이지 구조

```
/                         # 메인 페이지 (정치인 지도)
/auth/signup             # 회원가입
/auth/login              # 로그인
/suggestions             # 건의사항 목록 (무한 스크롤)
/suggestions/new         # 건의사항 작성
/suggestions/[id]        # 건의사항 상세 (댓글 포함)
```

## 커서 기반 무한 스크롤 구현 (핵심 기능)

### Composable: `useSuggestions.ts`

```typescript
export function useSuggestions() {
  const supabase = useSupabaseClient()
  const suggestions = ref([])
  const lastId = ref(null)
  const hasMore = ref(true)
  const loading = ref(false)

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return

    loading.value = true
    let query = supabase
      .from('suggestions')
      .select('*, profiles(nickname), politicians(name, region)')
      .order('id', { ascending: false })
      .limit(20)

    // 커서 기반: lastId보다 작은 ID만 조회
    if (lastId.value) {
      query = query.lt('id', lastId.value)
    }

    const { data } = await query

    if (data && data.length > 0) {
      suggestions.value.push(...data)
      lastId.value = data[data.length - 1].id
      hasMore.value = data.length === 20
    } else {
      hasMore.value = false
    }

    loading.value = false
  }

  return { suggestions, loadMore, hasMore, loading }
}
```

### 페이지: `pages/suggestions/index.vue`

```vue
<script setup>
const { suggestions, loadMore, hasMore, loading } = useSuggestions()
const sentinel = ref(null)

onMounted(async () => {
  await loadMore()

  // Intersection Observer로 무한 스크롤
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMore()
    }
  })

  if (sentinel.value) {
    observer.observe(sentinel.value)
  }
})
</script>
```

## 보안 기능

### Row Level Security (RLS) 정책

Supabase RLS를 통해 데이터베이스 레벨에서 권한 자동 관리:

```sql
-- 작성자만 수정 가능
CREATE POLICY "Users can update own suggestions"
  ON suggestions FOR UPDATE
  USING (auth.uid() = user_id);

-- 작성자만 삭제 가능
CREATE POLICY "Users can delete own suggestions"
  ON suggestions FOR DELETE
  USING (auth.uid() = user_id);
```

## 파일 구조

```
politician-map/
├── pages/                    # Nuxt.js 페이지
│   ├── index.vue            # 메인 (지도)
│   ├── auth/
│   │   ├── signup.vue       # 회원가입
│   │   └── login.vue        # 로그인
│   └── suggestions/
│       ├── index.vue        # 목록 (무한 스크롤)
│       ├── new.vue          # 작성
│       └── [id].vue         # 상세 (댓글)
├── components/              # Vue 컴포넌트
│   ├── ElectionMap.vue      # 지도 컴포넌트
│   └── PoliticianModal.vue  # 사이드 패널
├── composables/             # 재사용 로직
│   ├── useAuth.ts           # 인증
│   ├── useSuggestions.ts    # 건의사항
│   ├── useComments.ts       # 댓글
│   └── usePoliticians.ts    # 정치인
├── public/                  # 정적 파일
│   ├── 의원.csv             # 정치인 데이터
│   ├── map_zoom.js          # 지도 스크립트
│   └── image/               # 정치인 이미지
├── supabase-schema.sql      # DB 스키마
├── SUPABASE_SETUP.md        # Supabase 설정 가이드
├── nuxt.config.ts           # Nuxt 설정
└── .env.example             # 환경변수 템플릿
```

## API 명세

### 건의사항 API

| Method | Endpoint | 설명 | 권한 |
|--------|---------|------|------|
| GET | `/api/suggestions?lastId={id}` | 목록 조회 (커서 기반) | 모두 |
| GET | `/api/suggestions/{id}` | 상세 조회 | 모두 |
| POST | `/api/suggestions` | 작성 | 로그인 필수 |
| PUT | `/api/suggestions/{id}` | 수정 | 작성자만 |
| DELETE | `/api/suggestions/{id}` | 삭제 | 작성자만 |

### 댓글 API

| Method | Endpoint | 설명 | 권한 |
|--------|---------|------|------|
| GET | `/api/comments?suggestion_id={id}` | 댓글 목록 | 모두 |
| POST | `/api/comments` | 댓글 작성 | 로그인 필수 |
| PUT | `/api/comments/{id}` | 댓글 수정 | 작성자만 |
| DELETE | `/api/comments/{id}` | 댓글 삭제 | 작성자만 |

## 시연 영상 체크리스트

- [ ] 회원가입 → 로그인
- [ ] 지도에서 정치인 선택
- [ ] 건의사항 작성
- [ ] **건의사항 목록에서 무한 스크롤 동작** (핵심!)
- [ ] 건의사항 상세 조회
- [ ] 댓글 작성
- [ ] 권한 검증 (타인의 글 수정 불가)

## 트러블슈팅

### Supabase 연결 오류
- `.env` 파일이 프로젝트 루트에 있는지 확인
- `SUPABASE_URL`과 `SUPABASE_KEY`가 올바른지 확인

### 무한 스크롤이 작동하지 않음
- Supabase 테이블에 인덱스가 생성되었는지 확인
- 브라우저 콘솔에서 네트워크 요청 확인

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 개발자

**김한결** - 제22대 국회의원 선거 데이터 시각화 및 건의사항 게시판 구현

---

**제출 마감**: 2025년 12월 18일 23:59
**수행평가**: 정치인 소통 플랫폼 프로젝트
