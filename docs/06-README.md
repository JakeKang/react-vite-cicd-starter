# React Monorepo MSA - 개발 환경 설정 가이드

## 목차
1. [사전 요구사항](#사전-요구사항)
2. [프로젝트 초기화](#프로젝트-초기화)
3. [로컬 개발 시작](#로컬-개발-시작)
4. [GitLab CI/CD 설정](#gitlab-cicd-설정)
5. [배포 서버 설정](#배포-서버-설정)
6. [트러블슈팅](#트러블슈팅)

---

## 사전 요구사항

### 로컬 개발 환경
- **Node.js**: v20.x 이상 (LTS 권장)
- **npm**: v10.x 이상
- **Docker**: v24.x 이상 (배포 테스트용)
- **Git**: v2.x 이상

```bash
# 버전 확인
node -v   # v20.11.0
npm -v    # 10.2.4
docker -v # Docker version 24.0.7
git --version # git version 2.39.2
```

### 서버 환경 (배포 대상)
- **OS**: Ubuntu 22.04 LTS 권장
- **Docker**: v24.x 이상
- **Docker Compose**: v2.x 이상
- **Nginx**: v1.24 이상 (또는 Docker 컨테이너)

---

## 프로젝트 초기화

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 프로젝트 클론
git clone git@gitlab.com:yourgroup/my-monorepo.git
cd my-monorepo

# 의존성 설치 (Turborepo가 모든 워크스페이스 처리)
npm install

# Turborepo 전역 설치 (선택사항)
npm install -g turbo
```

### 2. 환경 변수 설정

각 앱 디렉토리에 `.env.local` 파일 생성:

```bash
# apps/main-app/.env.local
FEATURE_A_URL=http://localhost:3001
FEATURE_B_URL=http://localhost:3002
FEATURE_C_URL=http://localhost:3003
NEXT_PUBLIC_API_URL=http://localhost:4000

# apps/feature-a/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000

# apps/feature-b/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. 프로젝트 구조 생성 (처음 시작하는 경우)

```bash
# Turborepo 초기화 (새 프로젝트인 경우)
npx create-turbo@latest

# 또는 수동으로 구조 생성
mkdir -p apps/{main-app,feature-a,feature-b,feature-c}
mkdir -p packages/{ui,shared-utils,tsconfig,eslint-config}
mkdir -p docker nginx
```

---

## 로컬 개발 시작

### 병렬 개발 서버 실행 (전체 앱)

```bash
# 모든 앱을 병렬로 실행 (포트: 3000, 3001, 3002, 3003)
npm run dev

# 특정 앱만 실행
npm run dev:main        # Main App만 (포트 3000)
npm run dev:feature-a   # Feature A만 (포트 3001)
```

### 빌드 및 테스트

```bash
# 전체 빌드 (Turborepo 캐싱 활용)
npm run build

# 특정 앱만 빌드
npm run build:main

# 변경된 앱만 빌드 (효율적)
npm run build:changed

# 린트 검사
npm run lint

# 타입 체크
npm run type-check

# 테스트 실행
npm run test
npm run test:coverage  # 커버리지 포함
```

### Docker로 로컬 환경 실행

```bash
# Docker Compose로 전체 스택 실행
npm run docker:up

# 로그 확인
npm run docker:logs

# 중지
npm run docker:down

# 개별 앱 빌드
docker build -t main-app --build-arg APP_NAME=main-app -f docker/Dockerfile.app .
```

---

## GitLab CI/CD 설정

### 1. GitLab Container Registry 활성화

GitLab 프로젝트 설정:
- Settings > General > Visibility > Container Registry 활성화

### 2. CI/CD Variables 등록

Settings > CI/CD > Variables 에서 다음 변수 추가:

```
SSH_PRIVATE_KEY      (배포 서버 SSH 키)
DEV_SERVER_HOST      dev.yourcompany.com
DEV_SERVER_USER      deploy
RCLONE_CONFIG        (Google Drive/OneDrive 설정)
SLACK_WEBHOOK_URL    (선택: 알림용)
```

자세한 내용은 `docs/gitlab-variables-guide.md` 참조.

### 3. SSH 키 생성 및 등록

**로컬에서 실행:**

```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "gitlab-ci-deploy" -f ~/.ssh/gitlab_deploy

# 공개키를 배포 서버에 등록
ssh-copy-id -i ~/.ssh/gitlab_deploy.pub deploy@dev.yourcompany.com

# 개인키 내용을 GitLab Variable에 등록
cat ~/.ssh/gitlab_deploy
# (전체 내용 복사하여 SSH_PRIVATE_KEY에 붙여넣기)

# 로컬 키 삭제 (보안)
rm ~/.ssh/gitlab_deploy*
```

### 4. 첫 파이프라인 실행

```bash
# develop 브랜치에 푸시
git checkout -b develop
git add .
git commit -m "Initial CI/CD setup"
git push -u origin develop

# GitLab에서 파이프라인 확인:
# Project > CI/CD > Pipelines
```

---

## 배포 서버 설정

### 1. 서버 초기 설정

**배포 서버에서 실행:**

```bash
# Docker 설치 (Ubuntu)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose 설치
sudo apt-get update
sudo apt-get install docker-compose-plugin

# 배포 디렉토리 생성
sudo mkdir -p /opt/my-monorepo
sudo chown $USER:$USER /opt/my-monorepo
cd /opt/my-monorepo

# GitLab Container Registry 로그인
docker login registry.gitlab.com
# Username: GitLab 사용자명
# Password: Personal Access Token (read_registry 권한)
```

### 2. docker-compose.yml 배포

로컬에서 서버로 복사:

```bash
scp docker-compose.yml deploy@dev.yourcompany.com:/opt/my-monorepo/
scp -r nginx/ deploy@dev.yourcompany.com:/opt/my-monorepo/
```

또는 GitLab CI/CD가 자동으로 배포합니다.

### 3. 서비스 시작

**배포 서버에서:**

```bash
cd /opt/my-monorepo

# 이미지 Pull
docker compose pull

# 서비스 시작
docker compose up -d

# 로그 확인
docker compose logs -f

# 상태 확인
docker compose ps
```

### 4. Nginx SSL 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt-get install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d dev.yourcompany.com

# 자동 갱신 테스트
sudo certbot renew --dry-run

# nginx/nginx.conf 파일에서 SSL 경로 확인
# ssl_certificate /etc/letsencrypt/live/dev.yourcompany.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/dev.yourcompany.com/privkey.pem;
```

---

## 트러블슈팅

### 빌드 실패: "Cannot find module"

```bash
# 캐시 및 node_modules 삭제 후 재설치
npm run clean
npm install
```

### Docker 빌드 실패: "COPY failed"

Dockerfile에서 경로 확인:
```dockerfile
# 잘못된 예
COPY apps/${APP_NAME}/package.json ./

# 올바른 예 (빌드 컨텍스트가 루트)
COPY apps/${APP_NAME}/package.json ./apps/${APP_NAME}/
```

### Turborepo 캐싱 문제

```bash
# Turborepo 캐시 삭제
rm -rf .turbo

# 강제 재빌드 (캐시 무시)
turbo run build --force
```

### GitLab Runner가 Docker 이미지를 Pull하지 못함

```bash
# GitLab Container Registry 로그인 확인
echo $CI_REGISTRY_PASSWORD | docker login -u $CI_REGISTRY_USER --password-stdin $CI_REGISTRY

# Variable 확인: CI_REGISTRY_PASSWORD가 올바른지 확인
```

### 배포 서버에서 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker compose logs [service-name]

# 컨테이너 재시작
docker compose restart [service-name]

# 강제 재생성
docker compose up -d --force-recreate
```

### PostMessage 통신 안됨 (마이크로 앱)

CORS 및 출처 검증 확인:
```typescript
// MicroAppContainer.tsx에서
if (event.origin !== MICRO_APP_URLS[appName]) {
  console.warn('Invalid origin:', event.origin);
  return;
}

// 마이크로 앱에서 메시지 전송 시
window.parent.postMessage(
  { type: 'NAVIGATE', payload: { path: '/home' } },
  'http://localhost:3000' // Main App의 origin
);
```

---

## 성능 최적화 팁

### 1. Turborepo 원격 캐싱 활성화

Vercel Remote Cache 또는 자체 캐시 서버 사용:

```bash
# .turbo/config.json
{
  "teamId": "your-team-id",
  "apiUrl": "https://cache.turbo.build"
}

# GitLab Variable 등록
TURBO_TOKEN=your-token
TURBO_TEAM=your-team-slug
```

### 2. Docker 빌드 캐싱

```yaml
# .gitlab-ci.yml에서
docker build \
  --cache-from $CI_REGISTRY_IMAGE/$app_name:latest \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  ...
```

### 3. 변경된 앱만 빌드

```bash
# GitLab CI에서 자동으로 처리
turbo run build --filter='[HEAD^1]'
```

---

## 유용한 명령어 치트시트

```bash
# 개발
npm run dev                    # 전체 앱 개발 서버
npm run dev:main              # Main App만

# 빌드
npm run build                 # 전체 빌드
npm run build:changed         # 변경된 것만 빌드

# 테스트
npm run test                  # 테스트 실행
npm run test:watch            # Watch 모드
npm run test:coverage         # 커버리지

# 린트/포맷
npm run lint                  # 린트 검사
npm run lint:fix              # 자동 수정
npm run format                # Prettier 포맷

# Docker
npm run docker:build          # 이미지 빌드
npm run docker:up             # 컨테이너 시작
npm run docker:down           # 컨테이너 중지
npm run docker:logs           # 로그 확인

# 정리
npm run clean                 # 빌드 아티팩트 삭제
turbo run clean               # 모든 워크스페이스 정리
```

---

## 참고 문서

- [Turborepo 공식 문서](https://turbo.build/repo/docs)
- [Next.js Standalone 출력](https://nextjs.org/docs/app/api-reference/next-config-js/output)
- [Docker 멀티스테이지 빌드](https://docs.docker.com/build/building/multi-stage/)
- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- [rclone 문서](https://rclone.org/docs/)

---

## 지원

문제가 발생하면 다음을 확인하세요:
1. GitLab Issues: 프로젝트 내 Issues 탭
2. 팀 Slack 채널: #devops
3. 문서: `docs/` 폴더
