# 정치인 커뮤니티 

> **배포 URL**: ([https://politician-community-v2.vercel.app](https://politician-community-v2.vercel.app/)))

## 📌 프로젝트 소개

22대 국회의원을 지도에서 탐색하고, 정치인별로 건의사항과 댓글을 공유할 수 있는 시민 참여형 커뮤니티입니다. Nuxt 3 + Supabase를 활용해 인증부터 게시판까지 풀스택 기능을 제공하며, 기존 정적인 지도 서비스를 인터랙티브하게 재구성했습니다.

- **개발 기간**: 2024.12.10 ~ 2025.12.17
- **개발 인원**: 1인 (개인 프로젝트)

---
## 🔍 개선 사항

### 기존 코드의 문제점

| 문제점 | 개선 방법 |
|--------|----------|
| 기존 gc-board는 MySQL 기반 정적 게시판이라 실시간 데이터 반영과 Row Level Security가 어려웠음 | Supabase(PostgreSQL + Auth + RLS)로 이전하여 실시간 조회수 RPC와 사용자별 권한 제어 지원 |
| gc-board는 모든 글이 하나의 게시판에 모여 있어 정치인·지역별 건의 흐름을 파악하기 힘들었음 | 지도 → 정치인 상세 → `/politicians/:id/suggestions` 흐름을 만들고, 카테고리/검색 필터와 무한 스크롤을 결합해 목적형 게시판 구성 |

### 개선 결과

**Supabase 기반 실시간/권한 체계**
- 개선 전: MySQL 단일 테이블이라 실시간 조회수나 사용자별 권한을 프론트에서 임시로 처리해야 했음
- 개선 후: Supabase View Count RPC, Auth, Profiles, RLS 정책으로 조회수 증가·작성자 검증·본인 수정/삭제를 백엔드에서 안전하게 처리

---

## ✨ 주요 기능

### 1. 정치인 지도 탐색
- `/`에서 D3.js로 재가공한 SVG 지도와 `map_zoom.js` 스크립트를 로드해 지역별 국회의원 정보를 시각화
- 지역 클릭 시 `components/PoliticianModal.vue` 모달을 통해 해당 의원 정보와 전용 게시판 링크 제공

### 2. 건의사항 & 댓글 게시판
- `/politicians/:id/suggestions`에서 정치인별 건의사항 목록을 필터와 검색으로 탐색
- `/suggestions/:id` 상세 페이지에서 조회수 증가 RPC, 댓글 CRUD, 작성자 프로필 노출
- `useSuggestions`와 `useComments` 컴포저블로 무한 스크롤, 작성/수정/삭제 로직을 재사용

### 3. 사용자 인증 및 마이페이지
- `/auth/login`, `/auth/signup`에서 Supabase Auth로 이메일 기반 회원관리
- `/profile`에서 내가 작성한 건의사항/댓글을 확인하고 별도의 API 없이 Supabase 조인 데이터 제공

---

## 🛠️ 기술 스택

### Frontend
- Nuxt 3 (Vue 3, `<script setup>`)
- Tailwind CSS, ClientOnly + IntersectionObserver 기반 UI 제어
- D3.js 5.x (기존 SVG 자산과 연동)

### Auth & Data
- Supabase (PostgreSQL, Auth, Row Level Security, RPC)

### Tooling & Infra
- TypeScript 지원 Nuxt 설정
- Vite 번들링, pnpm/npm 호환
- 배포 대상: Vercel/Netlify 

---

## 📂 프로젝트 구조
```
politician-map/
├── app.vue
├── components/
│   └── PoliticianModal.vue
├── composables/
│   ├── useAuth.ts
│   ├── useComments.ts
│   ├── usePoliticians.ts
│   └── useSuggestions.ts
├── layouts/
│   └── default.vue
├── middleware/
├── pages/
│   ├── index.vue
│   ├── politicians/[id]/suggestions.vue
│   ├── suggestions/[id].vue
│   ├── suggestions/new.vue
│   ├── auth/login.vue
│   ├── auth/signup.vue
│   └── profile.vue
├── public/ (지도 HTML, party 이미지 등 정적 자산)
├── supabase-schema.sql
├── nuxt.config.ts
└── package.json
```

---

## 🔗 API 명세

### 인증 (Supabase Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `https://<PROJECT_REF>.supabase.co/auth/v1/signup` | 이메일/비밀번호 회원가입 및 닉네임·지역 메타데이터 저장 |
| POST | `https://<PROJECT_REF>.supabase.co/auth/v1/token?grant_type=password` | 로그인 및 세션 발급 |
| POST | `https://<PROJECT_REF>.supabase.co/auth/v1/logout` | 세션 무효화 (로그아웃) |

### 건의사항 & 댓글 (Supabase REST/RPC)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `https://<PROJECT_REF>.supabase.co/rest/v1/suggestions?select=*,politicians(*)&order=id.desc&limit=20` | 커서 기반 건의사항 목록 |
| GET | `https://<PROJECT_REF>.supabase.co/rest/v1/suggestions?id=eq.{id}&select=*,politicians(*)` | 건의사항 상세 |
| POST | `https://<PROJECT_REF>.supabase.co/rest/v1/suggestions` | 건의사항 작성 |
| PATCH | `https://<PROJECT_REF>.supabase.co/rest/v1/suggestions?id=eq.{id}` | 건의사항 수정 |
| DELETE | `https://<PROJECT_REF>.supabase.co/rest/v1/suggestions?id=eq.{id}` | 건의사항 삭제 |
| POST | `https://<PROJECT_REF>.supabase.co/rpc/increment_suggestion_view_count` | 조회수 증가 |
| GET | `https://<PROJECT_REF>.supabase.co/rest/v1/comments?suggestion_id=eq.{id}` | 댓글 목록 (오름차순) |
| POST | `https://<PROJECT_REF>.supabase.co/rest/v1/comments` | 댓글 작성 (parent_id 지원) |
| PATCH | `https://<PROJECT_REF>.supabase.co/rest/v1/comments?id=eq.{id}` | 댓글 수정 |
| DELETE | `https://<PROJECT_REF>.supabase.co/rest/v1/comments?id=eq.{id}` | 댓글 삭제 |

※ 실제 호출은 `@nuxtjs/supabase` 클라이언트를 통해 처리되며, RLS 정책으로 작성자 본인만 수정/삭제 가능합니다.

---

## 💻 로컬 실행 방법

### 1. 레포지토리 클론
```bash
git clone https://github.com/your-username/politician-map.git
cd politician-map
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`root/.env` 또는 시스템 환경 변수에 Supabase 프로젝트 정보를 추가합니다.
```
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
```

### 4. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:8080`으로 접속하면 지도와 게시판을 확인할 수 있습니다.

---

## 🎥 시연 영상

[YouTube 링크 예정]

---

## 📚 참고 자료

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [D3.js Documentation](https://github.com/d3/d3/wiki)
