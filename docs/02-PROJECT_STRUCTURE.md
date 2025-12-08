# 📁 React Vite Monorepo 프로젝트 구조

## 📖 프로젝트 특징

- ✅ **Next.js 제거**, 순수 React + Vite
- ✅ **SPA (Single Page Application)** 기반
- ✅ **정적 파일 배포**로 서버 부담 최소화
- ✅ **Monorepo 구조**로 코드 공유 최적화

---

## 🗂️ 디렉토리 구조

```
my-monorepo/
├── apps/                           # 🎯 애플리케이션
│   ├── main-app/                   # 통합 메인 앱
│   │   ├── src/
│   │   │   ├── main.tsx           # 엔트리포인트
│   │   │   ├── App.tsx            # 루트 컴포넌트
│   │   │   ├── routes/            # React Router 라우팅
│   │   │   ├── components/        # 컴포넌트
│   │   │   ├── features/          # 기능별 모듈
│   │   │   └── api/               # API 클라이언트
│   │   ├── public/                # 정적 파일
│   │   ├── index.html             # HTML 템플릿
│   │   ├── vite.config.ts         # Vite 설정
│   │   ├── tsconfig.json          # TypeScript 설정
│   │   └── package.json           # 패키지 설정
│   │
│   ├── feature-a/                  # 독립 실행 가능한 마이크로 앱
│   │   ├── src/
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── feature-b/                  # 추가 마이크로 앱
│   └── feature-c/                  # 추가 마이크로 앱
│
├── packages/                       # 📦 공유 패키지
│   ├── ui/                         # 공유 컴포넌트 라이브러리
│   │   ├── src/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── shared-utils/               # 공통 유틸리티
│   ├── router/                     # 공유 라우팅 설정
│   ├── api-client/                 # API 클라이언트 (React Query)
│   ├── tsconfig/                   # 공유 TypeScript 설정
│   └── eslint-config/              # 공유 ESLint 설정
│
├── docker/                         # 🐳 Docker 설정
│   ├── Dockerfile.app              # Nginx 기반 정적 파일 서빙
│   └── nginx.conf                  # Nginx 기본 설정
│
├── nginx/                          # 🌐 Nginx 설정
│   └── nginx.conf                  # 리버스 프록시 설정
│
├── .gitlab-ci.yml                  # CI/CD 파이프라인
├── docker-compose.yml              # Docker Compose 설정
├── turbo.json                      # Turborepo 설정
├── package.json                    # 루트 패키지 설정
└── README.md                       # 프로젝트 문서
```

---

## 🔍 주요 디렉토리 설명

### 1. `apps/` - 애플리케이션

각 앱은 독립적으로 실행 및 배포 가능합니다.

**main-app**:
- 통합 메인 애플리케이션
- 다른 feature 앱들을 통합하여 제공
- React Router로 SPA 라우팅

**feature-a/b/c**:
- 마이크로 프론트엔드 방식의 독립 앱
- 각각 별도로 개발 및 배포 가능
- 필요시 main-app에 통합

### 2. `packages/` - 공유 패키지

**ui**:
- 재사용 가능한 UI 컴포넌트
- Button, Input, Card 등
- Storybook으로 문서화 가능

**shared-utils**:
- 공통 유틸리티 함수
- 날짜 포맷, 문자열 처리 등

**api-client**:
- React Query 기반 API 클라이언트
- 모든 앱에서 공유

### 3. `docker/` - Docker 설정

**Dockerfile.app**:
- Multi-stage build
- Nginx로 정적 파일 서빙
- 최종 이미지 크기: ~20MB

**nginx.conf**:
- SPA 라우팅 지원 (`try_files`)
- Gzip 압축
- 캐시 설정

---

## 🆚 주요 차이점 (Next.js vs Vite React)

### 1. 서버 사이드 렌더링 (SSR)
```
Next.js:
  ✅ SSR 지원
  ❌ Node.js 서버 필요
  ❌ 서버 유지 비용

Vite React:
  ❌ SSR 없음
  ✅ Nginx로 정적 파일만 서빙
  ✅ 서버 부담 최소화
```

### 2. 빌드 결과물
```
Next.js:
  📁 .next/ (서버 코드 + 정적 파일)

Vite React:
  📁 dist/ (HTML, JS, CSS만)
  → Nginx로 직접 서빙 가능
```

### 3. 라우팅
```
Next.js:
  - 파일 시스템 기반 라우팅
  - pages/ 디렉토리

Vite React:
  - React Router v6 사용
  - 코드 기반 라우팅
```

### 4. 환경 변수
```
Next.js:
  NEXT_PUBLIC_API_URL

Vite React:
  VITE_API_URL
  → VITE_ prefix 필수!
```

### 5. Docker 이미지
```
Next.js:
  FROM node:20-alpine
  → Node.js 런타임 필요
  → 이미지 크기: ~200MB

Vite React:
  FROM nginx:alpine
  → Node.js 불필요
  → 이미지 크기: ~20MB (90% 감소)
```

---

## 📊 장단점 비교

### Vite React의 장점

**성능**:
- ⚡ 빠른 빌드 속도
- 🚀 HMR (Hot Module Replacement)
- 📦 작은 번들 크기

**배포**:
- ✅ 정적 파일만 배포
- ✅ CDN 최적화 용이
- ✅ 서버 비용 절감

**개발 경험**:
- 💡 간단한 설정
- 🔧 빠른 개발 서버
- 📝 명확한 구조

### Next.js의 장점

**SEO**:
- ✅ SSR/SSG로 SEO 최적화
- ✅ 메타 태그 관리 용이

**기능**:
- ✅ API Routes
- ✅ Image Optimization
- ✅ Incremental Static Regeneration

---

## 🎯 언제 Vite React를 사용하나?

### ✅ 적합한 경우

- **관리자 대시보드** (SEO 불필요)
- **사내 툴** (인증 뒤 페이지)
- **웹 애플리케이션** (SPA로 충분)
- **마이크로 프론트엔드**
- **정적 파일 배포 선호**

### ❌ 부적합한 경우

- **블로그/뉴스** (SEO 중요)
- **전자상거래** (상품 페이지 SEO)
- **랜딩 페이지** (초기 로딩 속도 중요)
- **SSR 필수**

---

## 🚀 시작하기

### 프로젝트 설치
```bash
# 저장소 클론
git clone <repository-url>
cd my-monorepo

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 확인
ls apps/main-app/dist/
```

---

## 📚 관련 문서

- [01-QUICKSTART.md](./01-QUICKSTART.md) - 빠른 시작 가이드
- [03-POTENTIAL_ISSUES.md](./03-POTENTIAL_ISSUES.md) - 문제 해결
- [09-환경별-설정-가이드.md](./09-환경별-설정-가이드.md) - 환경 설정

---

**작성**: 2024-12-08  
**버전**: v5.1
