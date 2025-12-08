# 🎓 GitLab CI/CD 학습 로드맵 - 기초부터 고급까지

React Vite Monorepo MSA 프로젝트를 위한 단계별 CI/CD 학습 가이드입니다.
**실제로 커밋하고 테스트하면서** 배우는 방식으로 구성했습니다.

---

## 📚 학습 목차

- [Level 0: 준비 단계](#level-0-준비-단계)
- [Level 1: 기초 - 첫 파이프라인](#level-1-기초---첫-파이프라인)
- [Level 2: 기본 - 의존성과 캐싱](#level-2-기본---의존성과-캐싱)
- [Level 3: 중급 - 병렬 실행과 아티팩트](#level-3-중급---병렬-실행과-아티팩트)
- [Level 4: 중급+ - Docker 빌드](#level-4-중급---docker-빌드)
- [Level 5: 고급 - 배포 자동화](#level-5-고급---배포-자동화)
- [Level 6: 고급+ - 최적화와 모니터링](#level-6-고급---최적화와-모니터링)
- [Level 7: 전문가 - 프로덕션 준비](#level-7-전문가---프로덕션-준비)

---

## Level 0: 준비 단계

### 🎯 학습 목표
- GitLab 프로젝트 생성
- 로컬 환경 구축
- Git 기본 설정

### 📖 필요한 사전 지식
- Git 기본 명령어 (add, commit, push)
- 터미널/PowerShell 기본 사용법

### 🛠️ 준비 작업

#### 1. GitLab 프로젝트 생성
```bash
# GitLab에 로그인
# 1. New Project 클릭
# 2. Create blank project
# 3. Project name: my-monorepo
# 4. Visibility: Private
# 5. Initialize repository with a README: 체크 해제
# 6. Create project
```

#### 2. 로컬 프로젝트 초기화
```bash
# 프로젝트 폴더 생성
mkdir my-monorepo
cd my-monorepo

# Git 초기화
git init
git remote add origin https://gitlab.com/yourname/my-monorepo.git

# 기본 파일 생성
echo "# My Monorepo" > README.md
git add README.md
git commit -m "Initial commit"
git push -u origin main
```

#### 3. GitLab에서 확인
```
https://gitlab.com/yourname/my-monorepo
→ README.md가 보이면 성공!
```

### ✅ 체크포인트
- [ ] GitLab 프로젝트 생성 완료
- [ ] 로컬에서 첫 커밋 완료
- [ ] GitLab에 푸시 확인

---

## Level 1: 기초 - 첫 파이프라인

### 🎯 학습 목표
- `.gitlab-ci.yml` 파일의 기본 구조 이해
- 첫 CI/CD 파이프라인 실행
- Job 개념 이해

### 📖 핵심 개념
```yaml
# .gitlab-ci.yml의 3가지 핵심 요소
stages:     # 단계 정의
jobs:       # 실행할 작업
script:     # 실제 명령어
```

### 🚀 실습: 가장 간단한 파이프라인

#### Step 1: .gitlab-ci.yml 생성
```yaml
# .gitlab-ci.yml
hello_world:
  script:
    - echo "Hello, GitLab CI/CD!"
    - echo "현재 시간: $(date)"
    - echo "현재 브랜치: $CI_COMMIT_REF_NAME"
```

#### Step 2: 커밋 및 푸시
```bash
git add .gitlab-ci.yml
git commit -m "feat: Add first CI/CD pipeline"
git push origin main
```

#### Step 3: GitLab에서 확인
```
GitLab > CI/CD > Pipelines
→ 파이프라인이 실행 중인 것을 확인
→ Job 클릭하여 로그 확인
```

### 📝 예상 출력
```
Running with gitlab-runner...
Hello, GitLab CI/CD!
현재 시간: Mon Dec 8 10:30:45 UTC 2024
현재 브랜치: main
Job succeeded
```

### 🔍 분석: 무슨 일이 일어났나?

1. **커밋 → 푸시**: `.gitlab-ci.yml`을 GitLab에 업로드
2. **GitLab 감지**: 새 커밋 감지, 파이프라인 생성
3. **Runner 할당**: GitLab Runner가 작업 실행
4. **Script 실행**: `echo` 명령어 순차 실행
5. **결과 저장**: 로그를 GitLab에 저장

### 🎓 배운 개념
- **Job**: 실행할 작업 단위
- **Script**: 실제로 실행되는 명령어들
- **CI/CD Variables**: `$CI_COMMIT_REF_NAME` 같은 변수

### ✅ 체크포인트
- [ ] `.gitlab-ci.yml` 파일 생성
- [ ] 첫 파이프라인 실행 성공
- [ ] Job 로그 확인 완료

### 🐛 트러블슈팅

**문제 1**: 파이프라인이 실행되지 않음
```bash
# 원인: .gitlab-ci.yml 위치 확인
ls -la .gitlab-ci.yml
# 반드시 프로젝트 루트에 있어야 함
```

**문제 2**: YAML 문법 오류
```bash
# GitLab CI Lint 사용
# GitLab > CI/CD > Editor > Validate
```

---

## Level 2: 기본 - 의존성과 캐싱

### 🎯 학습 목표
- Stage 개념 이해
- 의존성 설치
- 캐시 활용

### 📖 핵심 개념
```yaml
stages:           # 실행 순서 정의
  - prepare       # 1단계: 준비
  - test          # 2단계: 테스트

cache:            # 캐시 설정
  paths:          # 캐시할 폴더
```

### 🚀 실습: Node.js 프로젝트 설정

#### Step 1: 간단한 Node.js 프로젝트 생성
```bash
# package.json 생성
npm init -y

# React + Vite 설치
npm install react react-dom
npm install -D vite @vitejs/plugin-react

# scripts 추가
# package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "echo \"Test passed!\""
  }
}
```

#### Step 2: .gitlab-ci.yml 업데이트
```yaml
# .gitlab-ci.yml (Level 2)
stages:
  - prepare
  - test

# 캐시 설정 (중요!)
cache:
  key:
    files:
      - package-lock.json
  paths:
    - node_modules/

# Job 1: 의존성 설치
install:
  stage: prepare
  image: node:20-alpine
  script:
    - echo "📦 Installing dependencies..."
    - npm ci --prefer-offline
    - echo "✅ Dependencies installed"
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

# Job 2: 테스트 실행
test:
  stage: test
  image: node:20-alpine
  needs: ["install"]
  script:
    - echo "🧪 Running tests..."
    - npm test
    - echo "✅ Tests passed"
```

#### Step 3: 커밋 및 테스트
```bash
git add .
git commit -m "feat: Add dependency installation and caching"
git push origin main
```

### 📝 예상 실행 순서
```
Pipeline #2 시작
├─ Stage: prepare
│  └─ install (2분)
│     ├─ npm ci 실행
│     └─ node_modules/ 캐시 저장
│
└─ Stage: test
   └─ test (30초)
      ├─ node_modules/ 다운로드 (artifacts)
      └─ npm test 실행
```

### 🔍 분석: 캐시 vs 아티팩트

| 구분 | Cache | Artifacts |
|------|-------|-----------|
| 용도 | 속도 향상 (선택적) | 데이터 전달 (필수) |
| 생존 시간 | 계속 유지 | 1시간 (설정값) |
| Job 간 공유 | 같은 러너만 | 모든 Job |
| 실패 시 | 그냥 재설치 | 파이프라인 실패 |

### 🎓 배운 개념
- **Stages**: 파이프라인의 단계 (순차 실행)
- **Image**: Docker 이미지 (실행 환경)
- **Cache**: 반복 작업 속도 향상
- **Artifacts**: Job 간 데이터 전달
- **needs**: Job 의존성 (병렬 실행 최적화)

### 💡 실험: 캐시 효과 확인

**첫 번째 실행**:
```
install: npm ci 실행 (2분)
```

**두 번째 실행** (캐시 히트):
```
install: npm ci 실행 (30초) ← 4배 빠름!
```

### ✅ 체크포인트
- [ ] package.json 생성
- [ ] 2단계 파이프라인 실행 성공
- [ ] 캐시가 작동하는지 확인 (두 번째 실행 시)

### 🐛 트러블슈팅

**문제**: node_modules가 캐시되지 않음
```yaml
# 원인: cache key 설정 확인
cache:
  key:
    files:
      - package-lock.json  # ← 이 파일이 있어야 함
```

---

## Level 3: 중급 - 병렬 실행과 아티팩트

### 🎯 학습 목표
- 병렬 실행으로 속도 향상
- 빌드 아티팩트 생성
- Job 간 데이터 전달

### 📖 핵심 개념
```yaml
# 같은 stage의 Job은 병렬 실행
test_a:
  stage: test

test_b:
  stage: test
# ↑ 동시에 실행됨!
```

### 🚀 실습: 병렬 실행

#### Step 1: 간단한 소스 코드 추가
```bash
# src/main.tsx 생성
mkdir -p src
cat > src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <h1>Hello CI/CD!</h1>
  </React.StrictMode>,
);
EOF

# index.html 생성
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>CI/CD Test</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# vite.config.ts 생성
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
EOF
```

#### Step 2: .gitlab-ci.yml 업데이트
```yaml
# .gitlab-ci.yml (Level 3)
stages:
  - prepare
  - validate   # 새 단계: 검증 (병렬)
  - build      # 새 단계: 빌드

cache:
  key:
    files:
      - package-lock.json
  paths:
    - node_modules/

install:
  stage: prepare
  image: node:20-alpine
  script:
    - npm ci --prefer-offline
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

# 병렬 실행 1: Lint
lint:
  stage: validate
  image: node:20-alpine
  needs: ["install"]
  script:
    - echo "🔍 Running ESLint..."
    - echo "✅ Lint passed (mock)"

# 병렬 실행 2: Type Check
type_check:
  stage: validate
  image: node:20-alpine
  needs: ["install"]
  script:
    - echo "🔍 Type checking..."
    - echo "✅ Type check passed (mock)"

# 병렬 실행 3: Test
test:
  stage: validate
  image: node:20-alpine
  needs: ["install"]
  script:
    - npm test

# 빌드 (validate 완료 후 실행)
build:
  stage: build
  image: node:20-alpine
  needs: ["install", "lint", "type_check", "test"]
  script:
    - echo "🏗️ Building application..."
    - npm run build
    - echo "✅ Build completed"
    - ls -la dist/
  artifacts:
    paths:
      - dist/
    expire_in: 1 day
```

#### Step 3: 커밋 및 확인
```bash
git add .
git commit -m "feat: Add parallel validation and build"
git push origin main
```

### 📝 예상 실행 순서 (병렬!)
```
Pipeline #3
├─ prepare (순차)
│  └─ install (1분)
│
├─ validate (병렬 실행!)
│  ├─ lint (30초)        ┐
│  ├─ type_check (30초)  ├─ 동시 실행
│  └─ test (30초)        ┘
│
└─ build (순차)
   └─ build (1분)
```

**총 실행 시간**: ~2.5분 (순차 실행 시 3.5분)

### 🔍 분석: needs의 힘

```yaml
# needs 없이
build:
  stage: build
  # validate의 모든 Job 완료를 기다림

# needs 있음
build:
  stage: build
  needs: ["install", "lint"]
  # install과 lint만 완료되면 바로 시작!
```

### 🎓 배운 개념
- **병렬 실행**: 같은 stage의 Job은 동시 실행
- **needs**: 특정 Job만 기다림 (최적화)
- **artifacts**: 빌드 결과물 저장 및 다운로드

### 💡 실험: Artifacts 다운로드

**GitLab에서 artifacts 확인**:
```
Pipeline > build Job > Browse
→ dist/ 폴더 확인
→ Download 클릭하여 다운로드
```

### ✅ 체크포인트
- [ ] 3개 Job이 병렬 실행되는지 확인
- [ ] build Job에서 dist/ 폴더 생성 확인
- [ ] artifacts를 다운로드하여 확인

---

## Level 4: 중급+ - Docker 빌드

### 🎯 학습 목표
- Docker 이미지 빌드
- Docker Registry 사용
- 멀티스테이지 빌드

### 📖 핵심 개념
```dockerfile
# Dockerfile의 멀티스테이지 빌드
FROM node:20 AS builder  # 빌드 단계
FROM nginx:alpine        # 런타임 단계
```

### 🚀 실습: Docker 이미지 생성

#### Step 1: Dockerfile 작성
```bash
# docker/Dockerfile.app 생성
mkdir -p docker
cat > docker/Dockerfile.app << 'EOF'
# Stage 1: 빌드
FROM node:20-alpine AS builder
WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci --prefer-offline

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# Stage 2: 런타임
FROM nginx:alpine AS runner
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# docker/nginx.conf 생성
cat > docker/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
EOF
```

#### Step 2: .gitlab-ci.yml에 Docker 빌드 추가
```yaml
# .gitlab-ci.yml (Level 4)
stages:
  - prepare
  - validate
  - build
  - package    # 새 단계: Docker 이미지

# ... (이전 코드 유지) ...

# Docker 이미지 빌드
docker_build:
  stage: package
  image: docker:24-dind
  services:
    - docker:24-dind
  needs: ["build"]
  variables:
    DOCKER_DRIVER: overlay2
    DOCKER_BUILDKIT: 1
  before_script:
    - docker info
    # GitLab Container Registry 로그인
    - echo $CI_REGISTRY_PASSWORD | docker login -u $CI_REGISTRY_USER --password-stdin $CI_REGISTRY
  script:
    - echo "🐳 Building Docker image..."
    - |
      docker build \
        --tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA \
        --tag $CI_REGISTRY_IMAGE:latest \
        --file docker/Dockerfile.app \
        .
    - echo "📤 Pushing to registry..."
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
    - echo "✅ Image pushed: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA"
  only:
    - main
```

#### Step 3: 커밋 및 확인
```bash
git add .
git commit -m "feat: Add Docker build stage"
git push origin main
```

### 📝 예상 실행 과정
```
docker_build:
1. Docker 빌드 시작
2. Stage 1: node:20-alpine
   ├─ npm ci (1분)
   └─ npm run build (1분)
3. Stage 2: nginx:alpine
   └─ dist/ 폴더 복사
4. 이미지 푸시 (30초)
```

**최종 이미지 크기**: ~20MB!

### 🔍 분석: 멀티스테이지의 장점

**일반 빌드** (멀티스테이지 없음):
```
node:20-alpine (177MB)
+ 소스 코드
+ node_modules/ (300MB)
+ dist/ (5MB)
─────────────────────
= 약 500MB
```

**멀티스테이지 빌드**:
```
nginx:alpine (15MB)
+ dist/ (5MB)
─────────────────────
= 약 20MB (96% 감소!)
```

### 🎓 배운 개념
- **Docker-in-Docker (dind)**: GitLab에서 Docker 실행
- **멀티스테이지 빌드**: 최종 이미지 크기 최소화
- **Container Registry**: 이미지 저장소
- **Image Tagging**: 버전 관리 (SHA, latest)

### 💡 실험: 이미지 확인

**GitLab에서 이미지 확인**:
```
GitLab > Packages & Registries > Container Registry
→ 이미지 목록 확인
→ 태그 확인 (latest, sha)
```

### ✅ 체크포인트
- [ ] Docker 이미지 빌드 성공
- [ ] Container Registry에 이미지 업로드 확인
- [ ] 이미지 크기 20MB 이하 확인

### 🐛 트러블슈팅

**문제**: Docker 로그인 실패
```yaml
# 원인: CI/CD Variables 설정 필요
# GitLab > Settings > CI/CD > Variables
# CI_REGISTRY_PASSWORD는 자동으로 제공됨 (설정 불필요)
```

---

## Level 5: 고급 - 배포 자동화

### 🎯 학습 목표
- SSH를 통한 자동 배포
- 환경 변수 관리
- 배포 서버 설정

### 📖 핵심 개념
```yaml
deploy:
  environment:
    name: development
    url: https://dev.yourcompany.com
```

### 🚀 실습: 개발 서버 배포

#### Step 1: SSH 키 생성 (로컬에서)
```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "gitlab-ci" -f ~/.ssh/gitlab_deploy

# 공개키 확인
cat ~/.ssh/gitlab_deploy.pub
# ↑ 이걸 배포 서버에 등록

# 개인키 확인
cat ~/.ssh/gitlab_deploy
# ↑ 이걸 GitLab Variables에 등록
```

#### Step 2: 배포 서버 설정 (서버에서)
```bash
# 배포 서버에 접속
ssh user@your-server.com

# 공개키 등록
echo "ssh-ed25519 AAAA...  gitlab-ci" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Docker 설치 (이미 설치되어 있으면 생략)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 프로젝트 폴더 생성
mkdir -p /opt/my-monorepo
cd /opt/my-monorepo
```

#### Step 3: docker-compose.yml 생성 (배포 서버)
```yaml
# /opt/my-monorepo/docker-compose.yml
version: '3.8'

services:
  web:
    image: registry.gitlab.com/yourname/my-monorepo:latest
    ports:
      - "80:80"
    restart: unless-stopped
```

#### Step 4: GitLab Variables 설정
```
GitLab > Settings > CI/CD > Variables

1. SSH_PRIVATE_KEY
   Type: File
   Value: (개인키 전체 내용 붙여넣기)
   Protected: Yes
   Masked: No

2. DEV_SERVER_HOST
   Type: Variable
   Value: your-server.com
   Protected: Yes

3. DEV_SERVER_USER
   Type: Variable
   Value: deploy
   Protected: Yes
```

#### Step 5: .gitlab-ci.yml에 배포 단계 추가
```yaml
# .gitlab-ci.yml (Level 5)
stages:
  - prepare
  - validate
  - build
  - package
  - deploy     # 새 단계: 배포

# ... (이전 코드 유지) ...

# 개발 서버 배포
deploy_dev:
  stage: deploy
  image: alpine:latest
  needs: ["docker_build"]
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan $DEV_SERVER_HOST >> ~/.ssh/known_hosts
  script:
    - echo "🚀 Deploying to development server..."
    - |
      ssh $DEV_SERVER_USER@$DEV_SERVER_HOST << 'ENDSSH'
        cd /opt/my-monorepo
        docker compose pull
        docker compose up -d
        docker image prune -af
      ENDSSH
    - echo "✅ Deployment completed"
  environment:
    name: development
    url: http://$DEV_SERVER_HOST
  only:
    - main
```

#### Step 6: 커밋 및 배포 테스트
```bash
# 간단한 변경사항 추가
echo "<h1>Version 2.0</h1>" >> src/main.tsx

git add .
git commit -m "feat: Add auto deployment"
git push origin main
```

### 📝 예상 배포 과정
```
deploy_dev:
1. SSH 연결 설정
2. 배포 서버 접속
3. Docker 이미지 pull
4. 컨테이너 재시작
5. 오래된 이미지 정리
```

### 🔍 분석: 무중단 배포

```bash
# Docker Compose의 자동 무중단 배포
docker compose up -d
# 1. 새 컨테이너 시작
# 2. 헬스체크 통과 확인
# 3. 구 컨테이너 종료
# → 다운타임 없음!
```

### 🎓 배운 개념
- **SSH 키 인증**: 비밀번호 없이 안전하게 접속
- **Environment**: GitLab 환경 관리
- **Remote SSH**: 원격 명령 실행
- **Docker Compose**: 컨테이너 오케스트레이션

### 💡 실험: 배포 확인

**브라우저에서 확인**:
```
http://your-server.com
→ "Version 2.0" 표시 확인
```

**서버에서 확인**:
```bash
ssh user@your-server.com
docker ps
# 새 컨테이너가 실행 중인지 확인
```

### ✅ 체크포인트
- [ ] SSH 키 생성 및 등록 완료
- [ ] GitLab Variables 설정 완료
- [ ] 자동 배포 성공
- [ ] 브라우저에서 배포된 앱 확인

### 🐛 트러블슈팅

**문제 1**: SSH 연결 실패
```bash
# 원인: known_hosts에 서버가 없음
# 해결: ssh-keyscan 추가됨 (before_script)
```

**문제 2**: Docker 권한 오류
```bash
# 원인: 사용자가 docker 그룹에 없음
sudo usermod -aG docker $USER
# 재로그인 필요
```

---

## Level 6: 고급+ - 최적화와 모니터링

### 🎯 학습 목표
- 파이프라인 병렬화
- 조건부 실행
- Slack/Discord 알림

### 📖 핵심 개념
```yaml
# 조건부 실행
only:
  - main          # main 브랜치만
  changes:
    - src/**/*    # src 폴더 변경 시만
```

### 🚀 실습: 최적화 및 알림

#### Step 1: Slack Webhook 생성
```
1. Slack > Apps > Incoming Webhooks
2. Add to Slack
3. 채널 선택 (#deployments)
4. Webhook URL 복사
```

#### Step 2: GitLab Variable 추가
```
SLACK_WEBHOOK_URL
Type: Variable
Value: https://hooks.slack.com/services/T00.../B00.../xxx
Protected: Yes
Masked: Yes
```

#### Step 3: .gitlab-ci.yml 최적화
```yaml
# .gitlab-ci.yml (Level 6 - 최적화)
variables:
  DOCKER_BUILDKIT: 1
  FF_USE_FASTZIP: "true"

stages:
  - prepare
  - validate
  - build
  - deploy
  - notify    # 새 단계: 알림

# ... (이전 코드) ...

# 변경된 앱만 빌드
build:
  stage: build
  image: node:20-alpine
  needs: ["install", "lint", "type_check", "test"]
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 day
  only:
    changes:
      - src/**/*
      - vite.config.ts
      - package.json

# 아카이빙을 deploy 단계로 병렬화
archive:
  stage: deploy
  image: alpine:latest
  needs: ["build"]
  script:
    - mkdir -p artifacts
    - echo "Build: $CI_COMMIT_SHORT_SHA" > artifacts/build-info.txt
    - echo "Date: $(date)" >> artifacts/build-info.txt
  artifacts:
    paths:
      - artifacts/
    expire_in: 30 days

# 배포 성공 알림
notify_success:
  stage: notify
  image: alpine:latest
  needs: ["deploy_dev"]
  script:
    - apk add --no-cache curl
    - |
      curl -X POST $SLACK_WEBHOOK_URL \
        -H 'Content-Type: application/json' \
        -d '{
          "text": "✅ 배포 성공!",
          "attachments": [{
            "color": "good",
            "fields": [
              {"title": "프로젝트", "value": "'"$CI_PROJECT_NAME"'", "short": true},
              {"title": "브랜치", "value": "'"$CI_COMMIT_REF_NAME"'", "short": true},
              {"title": "커밋", "value": "'"$CI_COMMIT_MESSAGE"'", "short": false},
              {"title": "작성자", "value": "'"$GITLAB_USER_NAME"'", "short": true},
              {"title": "파이프라인", "value": "<'"$CI_PIPELINE_URL"'|#'"$CI_PIPELINE_ID"'>", "short": true}
            ]
          }]
        }'
  when: on_success
  only:
    - main

# 배포 실패 알림
notify_failure:
  stage: notify
  image: alpine:latest
  script:
    - apk add --no-cache curl
    - |
      curl -X POST $SLACK_WEBHOOK_URL \
        -H 'Content-Type: application/json' \
        -d '{
          "text": "❌ 배포 실패!",
          "attachments": [{
            "color": "danger",
            "fields": [
              {"title": "프로젝트", "value": "'"$CI_PROJECT_NAME"'", "short": true},
              {"title": "브랜치", "value": "'"$CI_COMMIT_REF_NAME"'", "short": true},
              {"title": "실패한 Job", "value": "'"$CI_JOB_NAME"'", "short": true},
              {"title": "파이프라인", "value": "<'"$CI_PIPELINE_URL"'|#'"$CI_PIPELINE_ID"'>", "short": true}
            ]
          }]
        }'
  when: on_failure
  only:
    - main
```

### 📝 최적화 효과

**Before (Level 5)**:
```
전체 시간: 10-12분
변경 없어도 빌드: Yes
알림: 없음
```

**After (Level 6)**:
```
전체 시간: 7-9분 (30% 단축)
변경 없으면 스킵: Yes
알림: Slack으로 즉시 ✅
```

### 🔍 분석: 조건부 실행

```yaml
# src/ 폴더 변경 시에만 빌드
only:
  changes:
    - src/**/*

# 결과:
# - README.md만 수정 → 빌드 스킵
# - src/main.tsx 수정 → 빌드 실행
```

### 🎓 배운 개념
- **조건부 실행**: changes, only, except
- **병렬화**: needs를 활용한 최적화
- **Webhook**: 외부 서비스 통합
- **when**: 실행 조건 (on_success, on_failure)

### 💡 실험: Slack 알림 확인

**커밋 후 Slack 확인**:
```bash
echo "// Test change" >> src/main.tsx
git add .
git commit -m "test: Check Slack notification"
git push origin main
```

**Slack 채널 확인**:
```
#deployments 채널에 메시지 도착
✅ 배포 성공!
프로젝트: my-monorepo
브랜치: main
커밋: test: Check Slack notification
...
```

### ✅ 체크포인트
- [ ] Slack Webhook 설정 완료
- [ ] 조건부 빌드 작동 확인
- [ ] Slack 알림 수신 확인

---

## Level 7: 전문가 - 프로덕션 준비

### 🎯 학습 목표
- 환경별 배포 (dev, staging, prod)
- 수동 승인 프로세스
- 롤백 전략

### 📖 핵심 개념
```yaml
deploy_prod:
  when: manual    # 수동 승인 필요
  environment:
    name: production
    on_stop: rollback  # 롤백 설정
```

### 🚀 실습: 프로덕션 배포

#### Step 1: 환경별 설정 파일
```bash
# .env.development
cat > .env.development << 'EOF'
VITE_API_URL=http://localhost:4000
VITE_ENV=development
EOF

# .env.production
cat > .env.production << 'EOF'
VITE_API_URL=https://api.yourcompany.com
VITE_ENV=production
EOF
```

#### Step 2: 최종 .gitlab-ci.yml
```yaml
# .gitlab-ci.yml (Level 7 - 프로덕션)
variables:
  DOCKER_BUILDKIT: 1

stages:
  - prepare
  - validate
  - build
  - deploy-dev
  - deploy-prod
  - notify

# ... (이전 코드) ...

# 개발 환경 배포 (자동)
deploy_dev:
  stage: deploy-dev
  image: alpine:latest
  needs: ["docker_build"]
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
    - mkdir -p ~/.ssh
    - ssh-keyscan $DEV_SERVER_HOST >> ~/.ssh/known_hosts
  script:
    - |
      ssh $DEV_SERVER_USER@$DEV_SERVER_HOST << 'ENDSSH'
        cd /opt/my-monorepo
        docker compose pull
        docker compose up -d
      ENDSSH
  environment:
    name: development
    url: https://dev.yourcompany.com
  only:
    - develop

# 프로덕션 배포 (수동 승인)
deploy_prod:
  stage: deploy-prod
  image: alpine:latest
  needs: ["docker_build"]
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY_PROD" | ssh-add -
    - mkdir -p ~/.ssh
    - ssh-keyscan $PROD_SERVER_HOST >> ~/.ssh/known_hosts
  script:
    - echo "🚀 Deploying to PRODUCTION..."
    - |
      ssh $PROD_SERVER_USER@$PROD_SERVER_HOST << 'ENDSSH'
        cd /opt/my-monorepo-prod
        
        # 현재 버전 백업
        docker tag app:current app:backup-$(date +%Y%m%d-%H%M%S)
        
        # 새 버전 배포
        docker compose pull
        docker compose up -d
        
        # 헬스체크
        sleep 10
        curl -f http://localhost/health || exit 1
        
        echo "✅ Production deployment successful"
      ENDSSH
  environment:
    name: production
    url: https://yourcompany.com
    on_stop: rollback_prod
  when: manual  # 수동 승인 필요
  only:
    - main

# 프로덕션 롤백
rollback_prod:
  stage: deploy-prod
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY_PROD" | ssh-add -
    - mkdir -p ~/.ssh
    - ssh-keyscan $PROD_SERVER_HOST >> ~/.ssh/known_hosts
  script:
    - echo "⏪ Rolling back production..."
    - |
      ssh $PROD_SERVER_USER@$PROD_SERVER_HOST << 'ENDSSH'
        cd /opt/my-monorepo-prod
        
        # 백업 버전으로 롤백
        BACKUP=$(docker images | grep backup | head -1 | awk '{print $2}')
        docker tag app:$BACKUP app:current
        docker compose up -d
        
        echo "✅ Rollback completed"
      ENDSSH
  environment:
    name: production
    action: stop
  when: manual
  only:
    - main

# 프로덕션 배포 성공 알림
notify_prod_success:
  stage: notify
  image: alpine:latest
  needs: ["deploy_prod"]
  script:
    - apk add --no-cache curl
    - |
      curl -X POST $SLACK_WEBHOOK_URL \
        -H 'Content-Type: application/json' \
        -d '{
          "text": "🎉 프로덕션 배포 완료!",
          "attachments": [{
            "color": "good",
            "fields": [
              {"title": "환경", "value": "Production", "short": true},
              {"title": "버전", "value": "'"$CI_COMMIT_SHORT_SHA"'", "short": true},
              {"title": "배포자", "value": "'"$GITLAB_USER_NAME"'", "short": true},
              {"title": "URL", "value": "https://yourcompany.com", "short": true}
            ]
          }]
        }'
  when: on_success
  only:
    - main
```

### 📝 프로덕션 배포 프로세스

```
1. main 브랜치에 머지
2. 파이프라인 자동 시작
3. validate, build, docker_build 자동 실행
4. deploy_prod 대기 (수동 승인 필요) ⏸️
5. 관리자가 "Play" 버튼 클릭 ▶️
6. 프로덕션 배포 시작
7. 헬스체크 통과 확인
8. Slack 알림 전송
```

### 🔍 분석: 안전한 배포 전략

**1. Blue-Green 배포**:
```bash
# 새 버전 시작 (Green)
docker compose up -d green

# 헬스체크 통과
curl -f http://localhost:8081/health

# 트래픽 전환 (Blue → Green)
# Nginx 설정 변경

# 구 버전 종료 (Blue)
docker compose stop blue
```

**2. 롤백 전략**:
```bash
# 배포 전: 현재 버전 태그
docker tag app:current app:backup-20241208-1430

# 문제 발생 시: 백업 버전으로 롤백
docker tag app:backup-20241208-1430 app:current
docker compose up -d
```

### 🎓 배운 개념
- **Manual Deployment**: 수동 승인 프로세스
- **Environment Management**: 환경별 관리
- **Rollback Strategy**: 롤백 전략
- **Health Check**: 배포 검증
- **Blue-Green Deployment**: 무중단 배포

### 💡 실험: 프로덕션 배포 테스트

**Step 1**: 코드 변경
```bash
# 버전 업데이트
echo "<h1>Version 3.0 - Production</h1>" > src/main.tsx

git add .
git commit -m "feat: Release v3.0"
git push origin main
```

**Step 2**: GitLab에서 승인
```
GitLab > Pipelines > Pipeline #X
→ deploy_prod Job 확인
→ "Play" 버튼 클릭 ▶️
→ 배포 진행 상황 모니터링
```

**Step 3**: 배포 확인
```bash
# 프로덕션 서버 확인
curl https://yourcompany.com

# Slack 알림 확인
# #deployments 채널에 메시지 확인
```

### ✅ 최종 체크포인트
- [ ] 환경별 설정 분리 완료
- [ ] 수동 승인 프로세스 작동 확인
- [ ] 롤백 전략 테스트 완료
- [ ] 헬스체크 작동 확인
- [ ] 프로덕션 배포 성공

---

## 🎓 학습 완료! 축하합니다! 🎉

### 배운 내용 총정리

| Level | 내용 | 핵심 개념 |
|-------|------|-----------|
| 0 | 준비 | Git, GitLab 프로젝트 |
| 1 | 기초 | Job, Script, 첫 파이프라인 |
| 2 | 기본 | Stage, Cache, Artifacts |
| 3 | 중급 | 병렬 실행, needs, 빌드 |
| 4 | 중급+ | Docker, 멀티스테이지 |
| 5 | 고급 | 자동 배포, SSH, Environment |
| 6 | 고급+ | 최적화, 조건부 실행, 알림 |
| 7 | 전문가 | 프로덕션 배포, 롤백 |

### 획득한 스킬
- ✅ CI/CD 파이프라인 설계 및 구현
- ✅ Docker 이미지 빌드 및 최적화
- ✅ 자동 배포 시스템 구축
- ✅ 환경별 배포 관리
- ✅ 모니터링 및 알림 시스템
- ✅ 롤백 전략 수립

### 다음 단계
1. **Kubernetes**: 컨테이너 오케스트레이션
2. **Terraform**: 인프라 자동화 (IaC)
3. **Monitoring**: Prometheus + Grafana
4. **Security**: SAST/DAST, 취약점 스캔
5. **Performance**: Lighthouse CI, 성능 테스트

---

## 📚 참고 자료

### 공식 문서
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Docker Documentation](https://docs.docker.com/)
- [Vite Guide](https://vitejs.dev/guide/)

### 추가 학습
- **GitLab CI/CD 변수**: 환경별 설정 관리
- **GitLab Runner**: 자체 Runner 설치
- **Pipeline Efficiency**: 고급 최적화 기법
- **Security Scanning**: 보안 검사 자동화

---

**학습을 완료하셨습니다!** 🎊

이제 실제 프로젝트에 적용하면서  
더 많은 경험을 쌓아보세요!

질문이나 문제가 있으면  
docs/03-POTENTIAL_ISSUES.md를 참조하세요.
