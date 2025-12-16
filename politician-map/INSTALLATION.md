# 설치 및 실행 가이드

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 모듈 설치

```bash
npm install @nuxtjs/supabase
```

### 3. 환경변수 설정

```bash
# .env.example 파일을 .env로 복사
cp .env.example .env
```

`.env` 파일을 열어 Supabase 정보를 입력하세요:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

### 4. Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com) 로그인
2. 새 프로젝트 생성
3. SQL Editor에서 `supabase-schema.sql` 전체 실행
4. 정치인 데이터 삽입 (의원.csv → politicians 테이블)

자세한 내용은 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)를 참조하세요.

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속

## 프로젝트 구조 확인

설치 후 다음 디렉토리와 파일이 있어야 합니다:

```
✓ pages/auth/signup.vue
✓ pages/auth/login.vue
✓ pages/suggestions/index.vue
✓ pages/suggestions/new.vue
✓ pages/suggestions/[id].vue
✓ composables/useAuth.ts
✓ composables/useSuggestions.ts
✓ composables/useComments.ts
✓ supabase-schema.sql
✓ .env (직접 생성 필요)
```

## 테스트 계정 생성

개발 중에는 Supabase 대시보드의 Authentication 설정에서 "Enable email confirmations"를 비활성화하면 이메일 인증 없이 바로 테스트할 수 있습니다.

1. http://localhost:3000/auth/signup 접속
2. 테스트 계정 생성 (예: test@test.com)
3. 로그인 후 건의사항 작성 테스트

## 문제 해결

### "Cannot find module '@nuxtjs/supabase'"
```bash
npm install @nuxtjs/supabase
```

### "SUPABASE_URL is not defined"
`.env` 파일이 프로젝트 루트에 있고, 올바른 값이 입력되었는지 확인

### 정치인 데이터가 안 보임
`의원.csv` 데이터를 Supabase `politicians` 테이블에 삽입했는지 확인

## 배포

### Vercel 배포

1. Vercel 계정 생성
2. 프로젝트 연결
3. Environment Variables에 `SUPABASE_URL`과 `SUPABASE_KEY` 추가
4. Deploy!

### Netlify 배포

1. Netlify 계정 생성
2. 프로젝트 연결
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.output/public`
4. Environment Variables에 `SUPABASE_URL`과 `SUPABASE_KEY` 추가
5. Deploy!

## 다음 단계

1. Supabase 설정 완료 ✓
2. 회원가입/로그인 테스트 ✓
3. 건의사항 작성 테스트 ✓
4. **무한 스크롤 동작 확인** (중요!) ✓
5. 댓글 기능 테스트 ✓
6. 시연 영상 촬영
7. 제출!

좋은 결과 있기를 바랍니다! 🎉
