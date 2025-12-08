# React Vite Monorepo MSA CI/CD - 최종 통합 가이드

## 🎯 프로젝트 개요

**기술 스택:**
- React 18 + TypeScript
- Vite 5 (빌드 도구)
- Turborepo (Monorepo 관리)
- Docker + Nginx (배포)
- GitLab CI/CD

**아키텍처:**
- MSA (Microservices Architecture)
- Monorepo (단일 저장소, 다중 앱)
- 정적 파일 배포 (Nginx)

---

## 🚀 Quick Start (5분 안에 시작)

### 1. 프로젝트 생성

```bash
# 디렉토리 생성
mkdir my-monorepo && cd my-monorepo

# 프로젝트 구조 생성
mkdir -p apps/{main-app,feature-a,feature-b,feature-c}/{src,public}
mkdir -p packages/{ui,shared-utils,api-client}/src
mkdir -p docker nginx docs

# 필수 설정 파일 복사 (제공된 파일들)
# - package.json (루트)
# - turbo.json
# - .gitlab-ci.yml
# - docker/Dockerfile.app
# - docker/nginx.conf
# - nginx/nginx.conf
# - docker-compose.yml
```

### 2. Main App 초기화

```bash
cd apps/main-app

# package.json, vite.config.ts, index.html, src/ 파일들 생성
# (제공된 파일 참조)

# 기본 페이지 생성
mkdir -p src/pages
```

**src/pages/HomePage.tsx:**
```typescript
export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900">
        Welcome to React Monorepo
      </h1>
      <p className="mt-4 text-gray-600">
        MSA 아키텍처로 구축된 React 애플리케이션입니다.
      </p>
    </div>
  );
}
```

### 3. 의존성 설치 및 실행

```bash
# 루트로 돌아가기
cd ../..

# 전체 의존성 설치 (Turborepo가 자동으로 모든 워크스페이스 처리)
npm install

# 개발 서버 실행
npm run dev

# 특정 앱만 실행
npm run dev:main
```

브라우저에서 `http://localhost:3000` 접속

---

## 📋 단계별 구현 가이드

### Step 1: 기본 앱 구조 (Day 1)

**목표:** 단일 앱 로컬 실행

1. Main App 생성
2. 기본 라우팅 설정
3. 로컬 개발 서버 실행

**체크포인트:**
- [ ] `npm run dev:main` 정상 실행
- [ ] 브라우저에서 접속 가능
- [ ] Hot Reload 작동

### Step 2: Monorepo 설정 (Day 2)

**목표:** 공유 패키지 사용

1. `packages/ui` 컴포넌트 라이브러리 생성
2. Main App에서 공유 컴포넌트 import
3. Turborepo 빌드 검증

**packages/ui/src/Button.tsx:**
```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  const className = variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-200 text-gray-900 hover:bg-gray-300';
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md font-medium ${className}`}
    >
      {children}
    </button>
  );
}
```

**packages/ui/package.json:**
```json
{
  "name": "@repo/ui",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "react": "^18.2.0"
  }
}
```

**packages/ui/src/index.ts:**
```typescript
export { Button } from './Button';
```

**Main App에서 사용:**
```typescript
import { Button } from '@repo/ui';

function HomePage() {
  return (
    <div>
      <Button onClick={() => alert('clicked!')}>
        Click me
      </Button>
    </div>
  );
}
```

**체크포인트:**
- [ ] 공유 컴포넌트 정상 import
- [ ] TypeScript 타입 체크 통과
- [ ] `npm run build` 성공

### Step 3: Docker 빌드 (Day 3)

**목표:** 프로덕션 빌드 및 Docker 이미지 생성

```bash
# 프로덕션 빌드
npm run build

# dist 폴더 확인
ls -la apps/main-app/dist

# Docker 이미지 빌드
docker build \
  -t my-monorepo/main-app:latest \
  --build-arg APP_NAME=main-app \
  -f docker/Dockerfile.app \
  .

# 이미지 크기 확인 (목표: < 50MB)
docker images | grep main-app

# 컨테이너 실행
docker run -d -p 8080:80 --name test-main-app my-monorepo/main-app:latest

# 헬스체크
curl http://localhost:8080/health

# 브라우저 테스트
open http://localhost:8080

# 정리
docker stop test-main-app
docker rm test-main-app
```

**체크포인트:**
- [ ] 이미지 크기 < 50MB
- [ ] /health 엔드포인트 응답
- [ ] 브라우저에서 정상 작동

### Step 4: 마이크로 앱 추가 (Day 4)

**목표:** Feature-A 앱 생성 및 통합

1. `apps/feature-a` 디렉토리에 Main App과 동일한 구조 생성
2. `vite.config.ts`에서 base 경로 설정
3. Docker Compose로 전체 스택 실행

**apps/feature-a/vite.config.ts:**
```typescript
export default defineConfig({
  // ...
  base: '/feature-a',
  server: {
    port: 3001,
  },
});
```

**apps/feature-a/src/main.tsx:**
```typescript
<BrowserRouter basename="/feature-a">
  <App />
</BrowserRouter>
```

**Docker Compose 실행:**
```bash
# 전체 스택 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 각 앱 접속 테스트
curl http://localhost/health          # Nginx
curl http://localhost/                # Main App
curl http://localhost/feature-a       # Feature A
```

**체크포인트:**
- [ ] Main App 접속: `http://localhost/`
- [ ] Feature A 접속: `http://localhost/feature-a`
- [ ] Nginx 라우팅 정상 작동

### Step 5: GitLab CI/CD 설정 (Day 5)

**목표:** 자동 배포 파이프라인 구축

1. GitLab 프로젝트 생성
2. CI/CD Variables 등록
3. 첫 파이프라인 실행

**GitLab Variables 등록:**
```
Settings > CI/CD > Variables

SSH_PRIVATE_KEY: (배포 서버 SSH 키)
DEV_SERVER_HOST: dev.yourcompany.com
DEV_SERVER_USER: deploy
CI_REGISTRY_IMAGE: registry.gitlab.com/yourgroup/my-monorepo
```

**첫 커밋:**
```bash
git init
git add .
git commit -m "Initial commit: React Vite Monorepo MSA"
git remote add origin git@gitlab.com:yourgroup/my-monorepo.git
git push -u origin main
```

**GitLab에서 파이프라인 확인:**
- Project > CI/CD > Pipelines
- 각 스테이지 로그 확인

**체크포인트:**
- [ ] 파이프라인 성공적으로 완료
- [ ] Docker 이미지 레지스트리에 업로드됨
- [ ] 배포 서버에 자동 배포됨

---

## 🔧 환경별 설정

### 개발 환경 (.env.local)

**apps/main-app/.env.local:**
```bash
VITE_API_URL=http://localhost:4000
VITE_FEATURE_A_URL=http://localhost:3001
VITE_FEATURE_B_URL=http://localhost:3002
```

### 프로덕션 환경 (Docker Build Args)

```yaml
# docker-compose.yml
build:
  args:
    VITE_API_URL: https://api.yourcompany.com
    VITE_BASE_PATH: /
```

---

## 🐛 트러블슈팅

### 문제 1: "Cannot find module '@repo/ui'"

**원인:** 워크스페이스 의존성이 설치되지 않음

**해결:**
```bash
# 루트에서 전체 재설치
npm run clean
npm install
```

### 문제 2: Docker 빌드 시 "COPY failed"

**원인:** 빌드 컨텍스트가 루트가 아님

**해결:**
```bash
# 프로젝트 루트에서 실행 필수
docker build -f docker/Dockerfile.app .
# ❌ docker build -f Dockerfile.app .
```

### 문제 3: Nginx 404 에러

**원인:** SPA 라우팅 설정 누락

**해결:**
```nginx
# docker/nginx.conf
location / {
    try_files $uri $uri/ /index.html;  # 이 줄이 필수
}
```

### 문제 4: GitLab 파이프라인 SSH 실패

**원인:** SSH 키 권한 문제

**해결:**
```yaml
# .gitlab-ci.yml
before_script:
  - chmod 600 $SSH_PRIVATE_KEY  # 권한 설정
  - eval $(ssh-agent -s)
  - ssh-add $SSH_PRIVATE_KEY
```

---

## 📊 성능 최적화 체크리스트

### 빌드 시간:
- [ ] Turborepo 캐싱 활성화
- [ ] Docker layer 캐싱
- [ ] CI/CD 병렬 실행
- [ ] 변경된 앱만 빌드

**목표:** CI/CD 전체 < 10분

### 번들 크기:
- [ ] 코드 스플리팅 (lazy import)
- [ ] Tree-shaking 확인
- [ ] console.log 제거 (프로덕션)
- [ ] gzip/brotli 압축

**목표:** 초기 번들 < 500KB (gzip)

### 런타임 성능:
- [ ] React.memo 적절히 사용
- [ ] 불필요한 리렌더링 방지
- [ ] 이미지 최적화
- [ ] Lazy loading

**목표:** Lighthouse 성능 > 90

---

## 🎓 Best Practices

### 1. 코드 조직화

```
apps/main-app/src/
├── components/       # 재사용 가능한 컴포넌트
│   ├── common/      # 버튼, 인풋 등
│   └── layout/      # 헤더, 푸터 등
├── features/        # 기능별 모듈
│   ├── auth/
│   └── dashboard/
├── pages/           # 라우트 페이지
├── hooks/           # 커스텀 훅
├── utils/           # 유틸리티 함수
├── api/             # API 클라이언트
└── types/           # TypeScript 타입
```

### 2. 환경 변수 관리

```bash
# ✅ 좋은 예
VITE_API_URL=https://api.example.com
VITE_APP_NAME=main-app

# ❌ 나쁜 예
VITE_SECRET_KEY=xxx  # 민감 정보 노출 금지
API_URL=xxx          # VITE_ prefix 필수
```

### 3. Git 전략

```bash
# 브랜치 전략
main       → 프로덕션
develop    → 개발 통합
feature/*  → 기능 개발
hotfix/*   → 긴급 수정

# 커밋 메시지
feat: Add user authentication
fix: Resolve routing issue
docs: Update README
refactor: Simplify build script
```

---

## 📚 참고 자료

- [Vite 공식 문서](https://vitejs.dev)
- [Turborepo 가이드](https://turbo.build/repo/docs)
- [React Router v6](https://reactrouter.com)
- [Docker 멀티스테이지 빌드](https://docs.docker.com/build/building/multi-stage/)
- [Nginx SPA 설정](https://www.nginx.com/blog/deploying-nginx-nginx-plus-docker/)

---

## 🎯 다음 단계

### 즉시 시작:
1. 프로젝트 구조 생성
2. Main App 로컬 실행
3. Docker 빌드 테스트

### 1주일 내:
4. 마이크로 앱 추가
5. GitLab CI/CD 설정
6. 개발 서버 배포

### 1개월 내:
7. 테스트 코드 작성
8. 모니터링 추가
9. 성능 최적화

---

**문제가 발생하면 `POTENTIAL_ISSUES.md` 문서를 확인하세요!**

모든 잠재적 문제와 해결 방법이 상세히 정리되어 있습니다.
