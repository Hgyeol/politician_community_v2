-- ====================================
-- 정치인 건의사항 게시판 - Supabase 데이터베이스 스키마
-- ====================================

-- 1. profiles 테이블 (사용자 추가 정보)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname TEXT NOT NULL UNIQUE,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. politicians 테이블 (정치인 정보)
CREATE TABLE IF NOT EXISTS politicians (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  party TEXT,
  committee TEXT,
  election_count TEXT,
  election_method TEXT,
  gender TEXT,
  term TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. suggestions 테이블 (건의사항)
CREATE TABLE IF NOT EXISTS suggestions (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('경제', '교육', '환경', '복지', '안전', '교통', '문화', '기타')) NOT NULL,
  politician_id BIGINT REFERENCES politicians(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. comments 테이블 (댓글)
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  suggestion_id BIGINT REFERENCES suggestions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 인덱스 생성 (성능 최적화)
-- ====================================

-- 커서 기반 무한 스크롤을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_suggestions_id_desc ON suggestions (id DESC);

-- 정치인별 건의사항 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_suggestions_politician ON suggestions (politician_id);

-- 카테고리별 건의사항 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_suggestions_category ON suggestions (category);

-- 사용자별 건의사항 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_suggestions_user ON suggestions (user_id);

-- 건의사항별 댓글 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_suggestion ON comments (suggestion_id);

-- 사용자별 댓글 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments (user_id);

-- ====================================
-- Row Level Security (RLS) 정책 설정
-- ====================================

-- profiles 테이블 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- politicians 테이블 RLS (모두 읽기 가능)
ALTER TABLE politicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view politicians"
  ON politicians FOR SELECT
  USING (true);

-- suggestions 테이블 RLS
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read suggestions"
  ON suggestions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert suggestions"
  ON suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions"
  ON suggestions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own suggestions"
  ON suggestions FOR DELETE
  USING (auth.uid() = user_id);

-- comments 테이블 RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================
-- 트리거 함수 (자동화)
-- ====================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- suggestions 테이블 updated_at 트리거
CREATE TRIGGER update_suggestions_updated_at
  BEFORE UPDATE ON suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- comments 테이블 updated_at 트리거
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- profiles 테이블 updated_at 트리거
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 회원가입 시 자동으로 profiles 테이블에 행 생성하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, region)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', '익명'),
    COALESCE(NEW.raw_user_meta_data->>'region', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users 테이블에 새 사용자 생성 시 트리거
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ====================================
-- RPC 함수 (조회수 증가)
-- ====================================

-- 건의사항 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_suggestion_view_count(suggestion_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE suggestions
  SET view_count = view_count + 1
  WHERE id = suggestion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- 샘플 데이터 (테스트용 - 선택사항)
-- ====================================

-- 테스트용 정치인 데이터 (실제로는 CSV에서 가져옴)
-- INSERT INTO politicians (name, region, party, committee, election_count, election_method, gender, term)
-- VALUES
--   ('홍길동', '서울 종로구', '더불어민주당', '국토교통위원회', '3선', '지역구', '남', '제22대'),
--   ('김철수', '부산 해운대구을', '국민의힘', '정무위원회', '재선', '지역구', '남', '제22대');

-- ====================================
-- 대댓글 기능 추가 (2025-12-16)
-- ====================================

-- comments 테이블에 parent_id 추가
ALTER TABLE public.comments
  ADD COLUMN parent_id BIGINT REFERENCES public.comments(id) ON DELETE CASCADE;

-- 대댓글 조회를 위한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments (parent_id);

-- comments 테이블 RLS 정책은 현재 모든 댓글을 읽을 수 있도록 허용하고 있으므로,
-- 대댓글 조회에도 문제가 없습니다. 만약 특정 조건으로 제한하려면 RLS 정책 수정이 필요합니다.

-- ====================================
-- 완료 메시지
-- ====================================

-- 스키마 생성 완료!
-- 다음 단계:
-- 1. Supabase 대시보드에서 SQL Editor를 열어 이 스크립트 전체를 복사/붙여넣기
-- 2. Run을 클릭하여 실행
-- 3. 의원.csv 데이터를 politicians 테이블에 삽입 (별도 스크립트 필요)
