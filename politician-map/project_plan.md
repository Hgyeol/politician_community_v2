프로젝트 계획: 정치인 건의사항 게시판
1. 프로젝트 개요

프로젝트명: 정치인 커뮤니티 (Politician Community)

주제: 정치인에게 건의사항을 작성하는 시민 참여형 게시판

목표:
사용자가 지도에서 지역을 선택하고,
해당 지역의 정치인을 탐색한 뒤,
특정 정치인 전용 게시판으로 이동하여
건의사항을 작성하고 공유할 수 있는
투명한 정치 참여 플랫폼 구축

제출 마감: 2025년 12월 18일 23:59

디자인: 현대적이고 세련된 UI/UX를 적용하여 사용성을 높임

2. 기존 gc-board의 아쉬운 점과 개선 방향
아쉬운 점	개선 방향	적용 기술
페이지네이션 성능 문제	LIMIT OFFSET 방식은 데이터가 누적될수록 성능 저하 발생	커서 기반 무한 스크롤 (id < lastId)
코드 재사용성 부족	데이터 로직과 인증 로직이 분산됨	Nuxt.js Composables + Supabase 클라이언트 중앙화
3. 핵심 기술 스택

프레임워크: Nuxt.js 3

언어: JavaScript / TypeScript

백엔드 및 DB: Supabase (PostgreSQL, Auth, RLS)

UI/UX: Tailwind CSS

배포: Vercel 또는 Netlify

4. 필수 구현 기능
4.1 핵심 도메인
정치인 (politicians)

지역별 정치인 정보 관리

지도 UI와 연동

정치인 클릭 시 해당 정치인의 전용 건의사항 게시판으로 이동

건의사항 (suggestions)

생성: 로그인한 사용자가 특정 정치인에게 건의사항 작성

조회

전체 건의사항 목록

정치인 전용 게시판 목록

목록 조회

커서 기반 무한 스크롤

정치인별 / 카테고리별 / 지역별 필터링

수정 및 삭제

작성자 본인만 가능 (Supabase RLS)

댓글 (comments)

생성: 로그인한 사용자가 건의사항에 댓글 작성

조회: 건의사항별 댓글 목록

수정 및 삭제: 작성자 본인만 가능 (Supabase RLS)

4.2 사용자 인증

Supabase Auth 기반 이메일 회원가입 및 로그인

사용자 추가 정보는 profiles 테이블에 저장

Row Level Security 정책을 통한 권한 검증

5. 주요 페이지
페이지	경로	설명
메인 페이지	/	지도 기반 지역 선택
정치인 전용 게시판	/politicians/:id/suggestions	특정 정치인의 건의사항 목록
전체 건의사항 목록	/suggestions	모든 정치인 대상 게시판
건의사항 상세	/suggestions/:id	건의사항 상세 및 댓글
건의사항 작성	/suggestions/new	건의사항 작성
로그인 / 회원가입	/auth/login, /auth/signup	사용자 인증
마이페이지	/profile	내가 작성한 글과 댓글
6. 주요 기능 개발 계획
Phase 1: Supabase 설정 및 DB 설계

Supabase 프로젝트 생성

테이블 생성

profiles

politicians

suggestions

comments

커서 기반 쿼리를 위한 인덱스 생성

Row Level Security 정책 설정

회원가입 시 profiles 자동 생성 트리거 설정

Phase 2: Nuxt.js – Supabase 연동 및 인증

@nuxtjs/supabase 모듈 설치 및 설정

회원가입 / 로그인 페이지 구현

인증 미들웨어 구현

사용자 정보 관리 composable 작성

Phase 3: 지도 및 정치인 연동

지역 기반 정치인 지도 구현

지역 클릭 시 정치인 목록 표시

정치인 클릭 시 전용 게시판 이동
/politicians/:id/suggestions

Phase 4: 건의사항 CRUD

건의사항 작성 페이지 구현

건의사항 상세 페이지 구현

조회수 증가 RPC 함수 적용

건의사항 수정 및 삭제 구현

정치인 전용 게시판 페이지 구현

Phase 4-4: 커서 기반 무한 스크롤 (핵심)

id 기반 커서 방식 적용

LIMIT OFFSET 방식 미사용

Intersection Observer를 활용한 자동 로딩

정치인별 필터와 결합된 무한 스크롤

Phase 5: 댓글 기능

댓글 CRUD 구현

선택적으로 Supabase Realtime 적용

Phase 6: UI/UX 고도화

Tailwind CSS 반응형 적용

공통 UI 컴포넌트 제작

로딩, 토스트, 빈 상태 메시지 구현

Phase 7: 배포 및 문서화

Vercel 또는 Netlify 배포

환경 변수 설정

README.md 작성

시연 영상 제작

최종 제출

7. 커서 기반 무한 스크롤 기술 설명
LIMIT OFFSET 문제점

OFFSET 값이 커질수록 불필요한 레코드 스캔 발생

대규모 데이터에서 성능 저하

커서 방식 장점

인덱스를 활용한 효율적인 조회

항상 일정한 성능 유지

무한 스크롤 UX에 적합

Supabase 구현 방식

id < lastId

order by id desc

limit 20

8. 데이터베이스 ERD
auth.users
└─ id (UUID)

profiles
├─ id (UUID, PK)
├─ nickname
├─ region
└─ created_at

politicians
├─ id (BIGSERIAL, PK)
├─ name
├─ region
├─ party
├─ committee
├─ election_count
└─ election_method

suggestions
├─ id (BIGSERIAL, PK)
├─ title
├─ content
├─ category
├─ politician_id (FK)
├─ user_id (FK)
├─ view_count
├─ created_at
└─ updated_at

comments
├─ id (BIGSERIAL, PK)
├─ content
├─ suggestion_id (FK)
├─ user_id (FK)
├─ created_at
└─ updated_at

9. 사용자 흐름 (UX 시나리오)

메인 페이지 접속

지도에서 지역 선택

해당 지역 정치인 목록 표시

정치인 클릭

정치인 전용 게시판 이동

건의사항 목록 무한 스크롤 조회

건의사항 작성 및 댓글 참여

10. 예상 결과물

배포된 웹사이트 URL

GitHub 저장소

시연 영상

README 문서

ERD 및 DB 스키마 문서