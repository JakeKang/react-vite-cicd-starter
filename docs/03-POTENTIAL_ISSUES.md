# React Vite Monorepo MSA CI/CD 잠재적 문제점 및 해결 방안

차분하게 검토한 모든 잠재적 문제점과 해결 방안을 정리했습니다.

---

## 🚨 1. 환경 변수 관련 문제

### 문제점:
- Vite는 `VITE_` prefix를 가진 환경 변수만 브라우저에 노출
- Next.js의 `NEXT_PUBLIC_` 패턴과 다름
- Docker 빌드 시점과 런타임의 환경 변수 주입 방식이 다름

### 해결책:
✅ **명확한 네이밍 규칙 적용**
```bash
# .env.example 파일 생성 필수
VITE_API_URL=http://localhost:4000
VITE_BASE_PATH=/
VITE_FEATURE_A_URL=http://localhost:3001
```

✅ **Docker 빌드 시 환경 변수 주입**
```dockerfile
# Dockerfile에서
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
```

✅ **런타임 환경 변수 대체 (선택)**
- 정적 파일 배포 시 런타임 환경 변수 사용 불가
- 빌드 시점에 모든 환경 변수 확정 필요
- 대안: `window.__ENV__` 패턴 사용 (별도 스크립트 주입)

### 예방 조치:
- `.env.example` 파일 필수 작성
- 각 앱의 README에 환경 변수 목록 문서화
- CI/CD 파이프라인에서 환경 변수 검증 단계 추가

---

## 🚨 2. SPA 라우팅 문제

### 문제점:
- React Router의 브라우저 히스토리 모드 사용 시 직접 URL 접근 시 404 에러
- Nginx가 `/dashboard` 같은 경로를 실제 파일로 인식

### 해결책:
✅ **Nginx에서 모든 요청을 index.html로 리다이렉트**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

✅ **basePath 설정 시 주의**
```typescript
// vite.config.ts
base: process.env.VITE_BASE_PATH || '/'

// main.tsx
<BrowserRouter basename={import.meta.env.VITE_BASE_PATH || '/'}>
```

✅ **각 마이크로 앱의 basePath 일관성 유지**
- feature-a: base: '/feature-a'
- Docker build args로 전달: `--build-arg VITE_BASE_PATH=/feature-a`

### 검증 방법:
```bash
# 빌드 후 프리뷰로 테스트
npm run build
npm run preview
# 브라우저에서 /dashboard 직접 접근 테스트
```

---

## 🚨 3. CORS 이슈

### 문제점:
- 마이크로 앱 간 PostMessage 통신 시 origin 검증 필요
- API 요청 시 CORS 정책 위반 가능
- iframe 임베딩 시 X-Frame-Options 충돌

### 해결책:
✅ **API 프록시 설정 (개발 환경)**
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: env.VITE_API_URL,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

✅ **프로덕션 Nginx 프록시 설정**
```nginx
location /api {
    proxy_pass http://backend-api;
    proxy_set_header Origin $http_origin;
}
```

✅ **PostMessage origin 검증**
```typescript
window.addEventListener('message', (event) => {
  // CRITICAL: origin 검증 필수
  const allowedOrigins = [
    'http://localhost:3000',
    'https://yourcompany.com',
  ];
  
  if (!allowedOrigins.includes(event.origin)) {
    console.warn('Invalid origin:', event.origin);
    return;
  }
  
  // 메시지 처리
});
```

### 예방 조치:
- 환경별 allowed origins 리스트 관리
- CSP (Content Security Policy) 헤더 설정

---

## 🚨 4. Docker 빌드 캐싱 문제

### 문제점:
- Monorepo에서 변경되지 않은 패키지도 매번 재빌드
- CI/CD에서 빌드 시간이 과도하게 길어짐
- Docker layer 캐싱이 제대로 작동하지 않음

### 해결책:
✅ **Turborepo 캐싱 활용**
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

✅ **Docker BuildKit 활성화**
```yaml
# .gitlab-ci.yml
variables:
  DOCKER_BUILDKIT: 1
  COMPOSE_DOCKER_CLI_BUILD: 1
```

✅ **변경된 앱만 빌드**
```bash
# CI에서 자동으로 처리
turbo run build --filter='[HEAD^1]'
```

✅ **Docker layer 최적화**
```dockerfile
# package.json만 먼저 복사 (의존성 캐싱)
COPY package*.json ./
RUN npm ci

# 소스 코드는 나중에 복사
COPY . .
RUN turbo run build
```

### 모니터링:
- GitLab CI/CD 파이프라인 시간 추적
- 10분 이상 걸리면 최적화 필요

---

## 🚨 5. Monorepo 패키지 참조 문제

### 문제점:
- `@repo/ui` 같은 로컬 패키지가 빌드되지 않음
- TypeScript path alias가 Docker 빌드에서 작동 안 함
- 워크스페이스 의존성 해결 실패

### 해결책:
✅ **Vite 설정에서 alias 명시**
```typescript
// vite.config.ts
resolve: {
  alias: {
    '@repo/ui': path.resolve(__dirname, '../../packages/ui/src'),
  },
}
```

✅ **Turborepo transpilePackages 패턴**
```typescript
// vite.config.ts
optimizeDeps: {
  include: ['@repo/ui', '@repo/shared-utils'],
}
```

✅ **패키지 빌드 순서 보장**
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]  // 의존성 먼저 빌드
    }
  }
}
```

### 검증 방법:
```bash
# 각 패키지가 정상 빌드되는지 확인
npm run build
# dist 폴더 생성 확인
ls -la apps/main-app/dist
ls -la packages/ui/dist
```

---

## 🚨 6. 프로덕션 빌드 최적화 누락

### 문제점:
- 번들 크기가 너무 큼 (5MB 이상)
- 코드 스플리팅 미적용
- Tree-shaking 제대로 안 됨
- console.log가 프로덕션에 남아있음

### 해결책:
✅ **Vite 빌드 최적화 설정**
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'router-vendor': ['react-router-dom'],
      },
    },
  },
  minify: 'esbuild',
  target: 'es2015',
}
```

✅ **console 제거**
```typescript
esbuild: {
  drop: mode === 'production' ? ['console', 'debugger'] : [],
}
```

✅ **dynamic import로 코드 스플리팅**
```typescript
const HomePage = lazy(() => import('./pages/HomePage'));
```

### 목표:
- 초기 번들 크기: < 500KB (gzip)
- 각 청크: < 200KB
- Lighthouse 성능 점수: > 90

---

## 🚨 7. 헬스체크 엔드포인트 부재

### 문제점:
- SPA는 `/api/health` 같은 API 엔드포인트가 없음
- Docker 헬스체크가 실패할 수 있음
- 로드밸런서에서 앱 상태 확인 불가

### 해결책:
✅ **Nginx에서 static health 엔드포인트 제공**
```nginx
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

✅ **Docker 헬스체크 설정**
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1
```

✅ **추가 상태 체크 (선택)**
```typescript
// public/health.json 생성
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

## 🚨 8. 빌드 아티팩트 업로드 실패

### 문제점:
- rclone 설정이 복잡함
- Google Drive API 인증 만료
- GitLab CI에서 권한 문제

### 해결책:
✅ **rclone 설정 간소화**
```bash
# 로컬에서 한 번만 설정
rclone config
# 설정 파일을 GitLab Variable에 저장
cat ~/.config/rclone/rclone.conf
```

✅ **대안: GitLab Artifacts 활용**
```yaml
# .gitlab-ci.yml
artifacts:
  paths:
    - build-artifacts/
  expire_in: 90 days
```

✅ **실패 시 fallback**
```yaml
script:
  - |
    if [ -n "$RCLONE_CONFIG" ]; then
      rclone copy ... || echo "Cloud upload failed, continuing..."
    fi
```

---

## 🚨 9. 마이크로 앱 통합 복잡도

### 문제점:
- iframe 사용 시 성능 오버헤드
- PostMessage 통신 복잡도
- 각 앱의 독립성과 통합의 균형

### 해결책:
✅ **단순한 접근: URL 기반 라우팅**
```
https://yourcompany.com/           → main-app
https://yourcompany.com/feature-a  → feature-a
https://yourcompany.com/feature-b  → feature-b
```
- Nginx 리버스 프록시로 라우팅
- 각 앱이 완전히 독립적으로 실행
- iframe 없이 페이지 전환

✅ **통합이 필요한 경우: Module Federation (고급)**
```typescript
// 추후 필요시 Webpack Module Federation 적용
// Vite 5부터 실험적 지원
```

### 권장 사항:
- 초기: 단순한 URL 기반 라우팅
- 성숙 단계: Module Federation 고려

---

## 🚨 10. 보안 취약점

### 문제점:
- 환경 변수가 브라우저에 노출됨
- API 키가 소스 코드에 하드코딩될 위험
- XSS, CSRF 취약점

### 해결책:
✅ **민감 정보는 절대 VITE_ 변수에 넣지 않기**
```bash
# ❌ 잘못된 예
VITE_API_SECRET_KEY=xxx

# ✅ 올바른 예
VITE_API_URL=https://api.yourcompany.com
# API 키는 백엔드에서만 관리
```

✅ **보안 헤더 설정**
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Content-Security-Policy "default-src 'self'";
```

✅ **HTTPS 강제**
```nginx
# HTTP → HTTPS 리다이렉트
if ($scheme != "https") {
    return 301 https://$host$request_uri;
}
```

---

## 🚨 11. 로컬 개발 환경 설정 복잡도

### 문제점:
- 4개 앱을 동시에 실행하면 포트 충돌
- 각 앱의 환경 변수 설정이 번거로움
- Monorepo 초기 설정 어려움

### 해결책:
✅ **포트 자동 할당**
```json
// apps/main-app/package.json
"scripts": {
  "dev": "vite --port 3000"
}

// apps/feature-a/package.json
"scripts": {
  "dev": "vite --port 3001"
}
```

✅ **개발 환경 스크립트 제공**
```bash
#!/bin/bash
# scripts/dev-setup.sh

echo "🚀 Setting up development environment..."

# 환경 변수 파일 생성
for app in apps/*/; do
  if [ ! -f "$app.env.local" ]; then
    cp "$app.env.example" "$app.env.local"
  fi
done

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

echo "✅ Development environment ready!"
```

✅ **README 개선**
- Quick Start 섹션 추가
- 일반적인 문제 해결 가이드
- 포트 목록 명시

---

## 🚨 12. CI/CD 파이프라인 실패 원인

### 문제점:
- 테스트 실패로 인한 파이프라인 중단
- Docker 레지스트리 인증 실패
- SSH 키 권한 문제

### 해결책:
✅ **테스트 단계 유연성**
```yaml
# .gitlab-ci.yml
test:
  script:
    - npx turbo run test
  allow_failure: true  # 테스트 실패해도 계속 진행 (초기)
```

✅ **Docker 로그인 검증**
```yaml
before_script:
  - echo $CI_REGISTRY_PASSWORD | docker login -u $CI_REGISTRY_USER --password-stdin $CI_REGISTRY
  - docker info  # 로그인 확인
```

✅ **SSH 키 디버깅**
```yaml
before_script:
  - chmod 600 $SSH_PRIVATE_KEY  # 권한 설정 필수
  - ssh -vvv $DEV_SERVER_USER@$DEV_SERVER_HOST  # 디버그 모드
```

---

## ✅ 체크리스트 (배포 전 필수 확인)

### 로컬 환경:
- [ ] `npm install` 성공
- [ ] `npm run dev` 모든 앱 정상 실행
- [ ] `npm run build` 성공 (dist 폴더 생성 확인)
- [ ] `npm run test` 통과 (또는 테스트 작성)

### Docker:
- [ ] `docker build` 성공
- [ ] 이미지 크기 < 50MB
- [ ] 컨테이너 실행 후 /health 엔드포인트 응답 확인
- [ ] 브라우저에서 접속 가능

### GitLab CI/CD:
- [ ] 모든 Variable 등록 완료
- [ ] SSH 키 정상 작동
- [ ] 파이프라인 수동 실행 테스트
- [ ] 배포 서버 접속 가능

### 보안:
- [ ] 환경 변수에 민감 정보 없음
- [ ] .env 파일이 .gitignore에 등록됨
- [ ] HTTPS 설정 완료 (프로덕션)
- [ ] CORS 정책 확인

### 문서:
- [ ] README.md 최신화
- [ ] .env.example 파일 생성
- [ ] API 문서 작성 (필요 시)
- [ ] 배포 절차 문서화

---

## 🎯 핵심 해결 전략

1. **단순함 우선**: 복잡한 기능은 나중에 추가
2. **점진적 개선**: 작동하는 최소 구성부터 시작
3. **철저한 테스트**: 각 단계마다 검증
4. **문서화**: 모든 설정과 문제 해결 과정 기록
5. **모니터링**: 배포 후 로그와 메트릭 확인

---

## 📝 다음 단계 (선택 사항)

### Phase 2 (안정화 후):
- [ ] Module Federation 도입
- [ ] Kubernetes 마이그레이션
- [ ] 모니터링 스택 구축 (Prometheus, Grafana)
- [ ] E2E 테스트 (Playwright)

### Phase 3 (성능 최적화):
- [ ] CDN 연동
- [ ] Service Worker (PWA)
- [ ] 이미지 최적화 (WebP, AVIF)
- [ ] Prerendering (SEO)

---

이 문서를 통해 모든 잠재적 문제를 사전에 파악하고 대비할 수 있습니다.
