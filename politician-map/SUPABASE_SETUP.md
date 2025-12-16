# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속 후 로그인/회원가입
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `politician-community`
   - Database Password: 안전한 비밀번호 입력 (나중에 필요!)
   - Region: Northeast Asia (Seoul) 선택 (한국에 가장 가까움)
4. "Create new project" 클릭 (2-3분 소요)

## 2. 데이터베이스 스키마 설정

1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. "New query" 클릭
3. `supabase-schema.sql` 파일의 내용 전체를 복사하여 붙여넣기
4. **Run** 버튼 클릭
5. "Success" 메시지 확인

## 3. 환경변수 설정

1. 왼쪽 메뉴에서 **Settings** > **API** 클릭
2. 다음 값들을 복사:
   - **Project URL**: `https://xxxxx.supabase.co` 형태
   - **anon public** key: 매우 긴 문자열

3. `.env.example` 파일을 `.env`로 복사:
   ```bash
   cp .env.example .env
   ```

4. `.env` 파일을 열어 복사한 값 입력:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key-here
   ```

## 4. 정치인 데이터 마이그레이션

`의원.csv` 파일의 데이터를 Supabase `politicians` 테이블에 삽입해야 합니다.

### 방법 1: Supabase 대시보드 사용 (추천)

1. 왼쪽 메뉴에서 **Table Editor** 클릭
2. `politicians` 테이블 선택
3. **Insert** > **Import data from CSV** 클릭
4. `의원.csv` 파일 업로드
5. 컬럼 매핑 확인:
   - `의원명` → `name`
   - `지역` → `region`
   - `정당` → `party`
   - `소속위원회` → `committee`
   - `당선횟수` → `election_count`
   - `당선방법` → `election_method`
   - `성별` → `gender`
   - `대수` → `term`

### 방법 2: SQL로 수동 삽입

CSV 파일을 읽어서 SQL INSERT 문을 생성하는 스크립트를 만들거나, 직접 몇 개만 테스트용으로 입력:

```sql
INSERT INTO politicians (name, region, party, committee, election_count, election_method, gender, term)
VALUES
  ('강경숙', '비례대표', '조국혁신당', '교육위원회', '초선', '비례대표', '여', '제22대'),
  ('강대식', '대구 동구군위군을', '국민의힘', '국방위원회', '재선', '지역구', '남', '제22대');
  -- ... 나머지 데이터 추가
```

## 5. 인증 설정 확인

1. 왼쪽 메뉴에서 **Authentication** > **Providers** 클릭
2. **Email** 활성화 확인
3. **Email Confirmations** 설정:
   - 개발/테스트 중에는 "Enable email confirmations" 비활성화 추천
   - 프로덕션에서는 활성화 권장

## 6. Row Level Security (RLS) 확인

1. 왼쪽 메뉴에서 **Table Editor** 클릭
2. 각 테이블 (`profiles`, `politicians`, `suggestions`, `comments`) 확인
3. 테이블 이름 옆에 **RLS** 배지가 있는지 확인 (활성화됨을 의미)
4. 정책이 제대로 설정되었는지 확인

## 7. 테스트

모든 설정이 완료되면 Nuxt.js 앱을 실행하여 테스트:

```bash
npm run dev
```

다음 기능 테스트:
- [ ] 회원가입 가능
- [ ] 로그인 가능
- [ ] 건의사항 작성 가능
- [ ] 건의사항 목록 조회 가능 (무한 스크롤)
- [ ] 건의사항 상세 조회 가능
- [ ] 댓글 작성 가능
- [ ] 본인 글만 수정/삭제 가능 (RLS 정책)

## 문제 해결

### 데이터베이스 연결 오류
- `.env` 파일이 프로젝트 루트에 있는지 확인
- `SUPABASE_URL`과 `SUPABASE_KEY`가 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인

### RLS 정책 오류
- SQL Editor에서 `supabase-schema.sql`을 다시 실행
- 각 테이블의 RLS 정책이 활성화되었는지 확인

### 인증 오류
- Supabase Auth 설정에서 Email 프로바이더가 활성화되었는지 확인
- 이메일 인증이 필요한 경우, Supabase 대시보드에서 이메일 확인

## 다음 단계

Supabase 설정이 완료되면:
1. `npm install @nuxtjs/supabase` 실행
2. `nuxt.config.ts`에 Supabase 모듈 추가
3. 프로젝트 개발 시작!
