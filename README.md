# Directional App

Next.js 기반의 대시보드 및 포스트 관리 애플리케이션입니다.

## 주요 기능

- 🔐 NextAuth를 이용한 인증 시스템
- 📊 대시보드 (커피 소비량, 무드 트렌드 차트)
- 📝 포스트 관리 (생성, 조회, 검색, 정렬)
- 🎨 Tailwind CSS 및 Radix UI 기반의 모던한 UI
- 🔒 미들웨어를 통한 라우트 보호

## 기술 스택

- **프레임워크**: Next.js 16.0.0 (App Router)
- **언어**: TypeScript
- **인증**: NextAuth.js
- **스타일링**: Tailwind CSS 4
- **UI 컴포넌트**: Radix UI
- **차트**: Chart.js, Recharts
- **상태 관리**: SWR, TanStack Query

## 시작하기

### 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
NEXTAUTH_SECRET=your-secret-key-here
NODE_ENV=development
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://fe-hiring-rest-api.vercel.app
NEXTAUTH_URL=http://localhost:3000
```

### 설치 및 실행

```bash
# 의존성 설치
npm install
# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build
# 프로덕션 서버 실행
npm start
```

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── auth/         # NextAuth 인증
│   │   ├── posts/        # 포스트 API
│   │   └── mock/         # Mock 데이터 API
│   ├── dashboard/        # 대시보드 페이지
│   ├── signin/           # 로그인 페이지
│   └── page.tsx          # 홈 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # UI 컴포넌트 (Radix UI)
│   ├── posts-table.tsx   # 포스트 테이블
│   ├── new-post-form.tsx # 포스트 작성 폼
│   └── ...
├── lib/                   # 유틸리티 함수
│   └── jwt-utils.ts      # JWT 관련 유틸
├── types/                 # TypeScript 타입 정의
└── middleware.ts          # Next.js 미들웨어
```

## 주요 페이지

- `/` - 홈 페이지
- `/signin` - 로그인 페이지
- `/dashboard` - 대시보드 (인증 필요)

## API 엔드포인트

### 인증
- `POST /api/auth/[...nextauth]` - NextAuth 인증 핸들러
- `GET /api/auth/clear-session` - 세션 초기화

### 포스트
- `GET /api/posts` - 포스트 목록 조회
- `POST /api/posts` - 포스트 생성
위 API에는 401 버그가 있어서 사용할 수 없었습니다.

- `GET /api/mock/posts` - Mock 포스트 데이터

### 대시보드 데이터
- `GET /api/mock/coffee-consumption` - 커피 소비량 데이터
- `GET /api/mock/weekly-mood-trend` - 주간 무드 트렌드
- `GET /api/mock/top-coffee-brands` - 인기 커피 브랜드

## 인증

이 프로젝트는 NextAuth.js를 사용하여 JWT 기반 인증을 구현합니다.

### 로그인

1. `/signin` 페이지에서 이메일과 비밀번호 입력
2. 백엔드 API로 인증 요청
3. 성공 시 JWT 토큰을 세션에 저장
4. 보호된 라우트 접근 가능

### 미들웨어

`middleware.ts`는 다음 라우트를 보호합니다:
- `/dashboard/*` - 대시보드 페이지

인증되지 않은 사용자는 자동으로 `/signin`으로 리다이렉트됩니다.

## 개발 참고사항

## 문제 해결

### 로그인 후 401 에러

1. missing bearer token - 401 에러가 계속 발생하였습니다.
2. 이전에는 /api/posts 의 route 에서 API를 부르고 있었었고
3. 해결 방법은 다이렉트로 클라이언트에서 리퀘스트 헤더에 토큰과 함께 end point를 호출하였습니다. 그 결과 401를 해결할 수 있었습니다.

### Mock API 사용

Mock API를 사용하여 데이터를 시각화 하였습니다:
- `/api/mock/posts` - 포스트 데이터
- `/api/mock/coffee-consumption` - 커피 소비량
- `/api/mock/weekly-mood-trend` - 무드 트렌드

### 환경 변수

- `NEXTAUTH_SECRET`: JWT 암호화에 사용되는 시크릿 키
- `NEXT_PUBLIC_BACKEND_URL`: 백엔드 API URL
- `NEXTAUTH_URL`: 애플리케이션 URL

