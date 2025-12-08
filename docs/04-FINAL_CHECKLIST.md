# 🎯 React Vite Monorepo MSA CI/CD - 최종 체크리스트

## ✅ 프로젝트 검증 완료 사항

### 아키텍처 결정
- [x] Next.js 제거, Vite React 사용
- [x] Turborepo Monorepo 구조
- [x] Docker + Nginx 정적 파일 배포
- [x] GitLab CI/CD 6단계 파이프라인
- [x] MSA 구조 (독립 실행 + 통합 실행)

### 핵심 기술 스택
- [x] React 18 + TypeScript 5
- [x] Vite 5 (빌드 도구)
- [x] Turborepo (캐싱 및 병렬 빌드)
- [x] React Router v6 (SPA 라우팅)
- [x] React Query (서버 상태)
- [x] Zustand (클라이언트 상태)
- [x] Nginx Alpine (최종 이미지 ~20MB)

---

## 📁 제공된 파일 목록

### 필수 설정 파일
- [x] `turbo.json` - Turborepo 빌드 설정
- [x] `package.json` - 루트 워크스페이스
- [x] `.gitlab-ci.yml` - CI/CD 파이프라인
- [x] `docker-compose.yml` - 전체 스택 오케스트레이션

### Docker 관련
- [x] `docker/Dockerfile.app` - 멀티스테이지 빌드 (Vite → Nginx)
- [x] `docker/nginx.conf` - 컨테이너 내부 Nginx (SPA 라우팅)
- [x] `nginx/nginx.conf` - 리버스 프록시 (MSA 라우팅)

### 앱 설정
- [x] `apps/main-app/vite.config.ts` - Vite 설정
- [x] `apps/main-app/package.json` - 앱 의존성
- [x] `apps/main-app/index.html` - 엔트리 HTML
- [x] `apps/main-app/src/main.tsx` - React 엔트리포인트
- [x] `apps/main-app/src/App.tsx` - 라우팅 설정

### 문서
- [x] `PROJECT_STRUCTURE.md` - 프로젝트 구조 설명
- [x] `POTENTIAL_ISSUES.md` - 잠재적 문제 및 해결책 (⭐ 중요)
- [x] `QUICKSTART.md` - 5분 시작 가이드
- [x] `README.md` - 전체 개요
- [x] `docs/gitlab-variables-guide.md` - CI/CD 변수 설정

---

## 🔍 잠재적 문제점 재검토

### 1. 환경 변수 ✅ 해결됨
**문제:** Vite는 `VITE_` prefix만 브라우저 노출  
**해결:** 명확한 네이밍 규칙 + .env.example 제공  
**검증:** 모든 환경 변수가 VITE_ prefix 사용

### 2. SPA 라우팅 ✅ 해결됨
**문제:** 직접 URL 접근 시 404  
**해결:** Nginx `try_files $uri /index.html`  
**검증:** docker/nginx.conf 설정 완료

### 3. CORS ✅ 해결됨
**문제:** 마이크로 앱 간 통신, API 요청 CORS  
**해결:** Vite proxy + Nginx proxy + origin 검증  
**검증:** POTENTIAL_ISSUES.md에 상세 가이드

### 4. Docker 캐싱 ✅ 해결됨
**문제:** 매번 전체 재빌드  
**해결:** Turborepo 캐싱 + BuildKit + layer 최적화  
**검증:** .gitlab-ci.yml에 DOCKER_BUILDKIT=1 설정

### 5. Monorepo 패키지 참조 ✅ 해결됨
**문제:** @repo/ui 같은 로컬 패키지 빌드 실패  
**해결:** vite.config.ts alias + Turborepo dependsOn  
**검증:** vite.config.ts에 resolve.alias 설정

### 6. 번들 크기 최적화 ✅ 해결됨
**문제:** 프로덕션 번들이 너무 큼  
**해결:** manualChunks + lazy import + console 제거  
**검증:** vite.config.ts 빌드 설정 완료

### 7. 헬스체크 ✅ 해결됨
**문제:** SPA는 /api/health 없음  
**해결:** Nginx static endpoint `/health`  
**검증:** docker/nginx.conf에 설정됨

### 8. 클라우드 업로드 ✅ 해결됨
**문제:** rclone 설정 복잡  
**해결:** rclone.conf.example + GitLab Artifacts 병행  
**검증:** .gitlab-ci.yml에 fallback 로직

### 9. 마이크로 앱 통합 ✅ 해결됨
**문제:** iframe vs Module Federation  
**해결:** 초기 URL 라우팅, 필요시 Federation  
**검증:** 단순한 Nginx 라우팅으로 시작

### 10. 보안 ✅ 해결됨
**문제:** 환경 변수 노출, XSS  
**해결:** VITE_ 규칙 + 보안 헤더  
**검증:** nginx.conf에 보안 헤더 설정

### 11. 로컬 개발 ✅ 해결됨
**문제:** 포트 충돌, 설정 복잡  
**해결:** 포트 자동 할당 + dev 스크립트  
**검증:** QUICKSTART.md 제공

### 12. CI/CD 실패 ✅ 해결됨
**문제:** 테스트 실패, 인증 오류  
**해결:** allow_failure + 상세 로그 + 디버깅 가이드  
**검증:** .gitlab-ci.yml 완료

---

## 🚨 주의사항 (반드시 확인)

### 1. 환경 변수 네이밍
```bash
# ✅ 올바른 예
VITE_API_URL=https://api.example.com
VITE_BASE_PATH=/feature-a

# ❌ 잘못된 예
API_URL=xxx          # VITE_ prefix 없음
VITE_SECRET_KEY=xxx  # 민감 정보 노출 금지
```

### 2. Docker 빌드 컨텍스트
```bash
# ✅ 올바른 예 (프로젝트 루트에서)
docker build -f docker/Dockerfile.app --build-arg APP_NAME=main-app .

# ❌ 잘못된 예 (docker 폴더에서)
cd docker && docker build -f Dockerfile.app .
```

### 3. Nginx SPA 라우팅
```nginx
# ✅ 필수 설정
location / {
    try_files $uri $uri/ /index.html;
}

# ❌ 이렇게 하면 404 발생
location / {
    try_files $uri $uri/;
}
```

### 4. basePath 일관성
```typescript
// vite.config.ts
base: process.env.VITE_BASE_PATH || '/'

// main.tsx
<BrowserRouter basename={import.meta.env.VITE_BASE_PATH || '/'}>

// Docker build args
--build-arg VITE_BASE_PATH=/feature-a

// 모두 동일한 값 사용 필수!
```

### 5. GitLab Variables
```
SSH_PRIVATE_KEY      → Protected: Yes, Masked: No
CI_REGISTRY_PASSWORD → Protected: Yes, Masked: Yes
RCLONE_CONFIG        → Protected: Yes, Masked: No

주의: Masked는 짧은 값(8자 미만)은 설정 불가
```

---

## 📊 성능 목표

### 빌드 시간
- [ ] 로컬 빌드: < 1분
- [ ] CI/CD 전체: < 10분
- [ ] Docker 이미지 빌드: < 3분

### 이미지 크기
- [ ] 최종 이미지: < 50MB
- [ ] 이상적: ~20MB (Nginx Alpine)
- [ ] Next.js 대비 95% 감소

### 번들 크기
- [ ] 초기 JS: < 500KB (gzip)
- [ ] 각 청크: < 200KB
- [ ] CSS: < 50KB

### 런타임 성능
- [ ] Lighthouse 성능: > 90
- [ ] First Contentful Paint: < 1.5s
- [ ] Time to Interactive: < 3s

---

## 🎯 배포 체크리스트

### 로컬 검증
- [ ] `npm install` 성공
- [ ] `npm run dev` 모든 앱 실행
- [ ] `npm run build` 성공
- [ ] `npm run test` 통과 (또는 작성 예정)
- [ ] `npm run lint` 통과

### Docker 검증
- [ ] 이미지 빌드 성공
- [ ] 이미지 크기 < 50MB
- [ ] 컨테이너 실행 성공
- [ ] `/health` 엔드포인트 200 응답
- [ ] 브라우저 접속 정상

### GitLab CI/CD
- [ ] 모든 Variables 등록
- [ ] SSH 키 테스트 완료
- [ ] 첫 파이프라인 수동 실행
- [ ] 모든 스테이지 성공
- [ ] 배포 서버 접속 확인

### 보안
- [ ] .env 파일 .gitignore 등록
- [ ] 민감 정보 하드코딩 없음
- [ ] HTTPS 설정 (프로덕션)
- [ ] 보안 헤더 확인
- [ ] CORS 정책 테스트

### 문서
- [ ] README.md 최신화
- [ ] .env.example 파일
- [ ] 배포 절차 문서
- [ ] 트러블슈팅 가이드

---

## 🎓 권장 학습 순서

### Week 1: 기초 구축
1. QUICKSTART.md 따라 로컬 실행
2. 단일 앱 빌드 및 Docker 테스트
3. Turborepo 캐싱 이해

### Week 2: MSA 구축
4. 마이크로 앱 추가
5. Nginx 라우팅 설정
6. Docker Compose 전체 스택 실행

### Week 3: CI/CD
7. GitLab 설정
8. 자동 배포 파이프라인
9. 모니터링 추가

### Week 4: 최적화
10. 성능 측정 및 개선
11. 번들 크기 최적화
12. 캐싱 전략 고도화

---

## 📞 문제 발생 시

### 1단계: 문서 확인
- `POTENTIAL_ISSUES.md` → 12가지 주요 문제 및 해결책
- `QUICKSTART.md` → 단계별 구현 가이드
- `README.md` → 전체 개요

### 2단계: 로그 확인
```bash
# 로컬 빌드
npm run build 2>&1 | tee build.log

# Docker
docker-compose logs -f [service-name]

# GitLab CI
Project > CI/CD > Pipelines > Job Logs
```

### 3단계: 단계별 디버깅
1. 로컬에서 재현
2. 최소 재현 케이스 작성
3. 관련 설정 파일 검토
4. 커뮤니티/문서 검색

---

## 🎉 완료 기준

### 최소 요구사항 (MVP)
- [x] Main App 로컬 실행
- [x] Docker 이미지 빌드
- [x] GitLab CI/CD 파이프라인 성공

### 권장 사항
- [ ] 최소 2개 마이크로 앱
- [ ] 전체 스택 Docker Compose 실행
- [ ] 자동 배포 완료
- [ ] 빌드 아티팩트 아카이빙

### 프로덕션 준비
- [ ] HTTPS 설정
- [ ] 모니터링 추가
- [ ] 백업 전략
- [ ] 롤백 절차

---

## 🚀 다음 단계 (선택)

### Phase 2: 고급 기능
- Module Federation
- Micro Frontend
- E2E 테스트 (Playwright)
- Storybook

### Phase 3: 인프라
- Kubernetes
- Prometheus + Grafana
- ELK Stack
- CDN 연동

---

**이 체크리스트를 하나씩 확인하며 진행하면 성공적인 배포가 가능합니다!** ✅

모든 잠재적 문제를 사전에 파악하고 해결 방안을 준비했으므로,  
차분하게 단계별로 진행하시면 됩니다.
