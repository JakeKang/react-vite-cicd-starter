# 🔐 GitLab CI/CD Variables 설정 가이드

## 📖 개요

GitLab CI/CD Variables는 민감한 정보를 안전하게 저장하고 파이프라인에서 사용할 수 있게 해줍니다.

**설정 경로**:
```
GitLab Project > Settings > CI/CD > Variables
```

---

## 🛡️ 보안 수준

### Protected
- **용도**: `main`, `develop` 같은 보호된 브랜치에서만 사용
- **권장**: 프로덕션 관련 변수는 Protected 설정

### Masked
- **용도**: CI/CD 로그에 변수 값이 노출되지 않음
- **권장**: 비밀번호, 토큰 등 민감 정보는 Masked 설정

---

## 1️⃣ Docker Registry 인증

### CI_REGISTRY_USER
```yaml
Name: CI_REGISTRY_USER
Value: 레지스트리 사용자명
Protected: Yes
Masked: No
Description: Docker Registry 사용자명 (GitLab Container Registry 사용 시 자동 설정)
```

### CI_REGISTRY_PASSWORD
```yaml
Name: CI_REGISTRY_PASSWORD
Value: 레지스트리 비밀번호
Protected: Yes
Masked: Yes
Description: Docker Registry 비밀번호 (GitLab Container Registry 사용 시 자동 설정)
```

### CI_REGISTRY
```yaml
Name: CI_REGISTRY
Value: registry.gitlab.com
Protected: No
Masked: No
Description: Docker Registry 주소
```

### CI_REGISTRY_IMAGE
```yaml
Name: CI_REGISTRY_IMAGE
Value: registry.gitlab.com/yourgroup/yourproject
Protected: No
Masked: No
Description: Docker 이미지 전체 경로
```

---

## 2️⃣ SSH 배포 설정

### SSH_PRIVATE_KEY
```yaml
Name: SSH_PRIVATE_KEY
Type: File
Value: 
-----BEGIN OPENSSH PRIVATE KEY-----
(개행 문자 포함하여 전체 키 복사)
-----END OPENSSH PRIVATE KEY-----
Protected: Yes
Masked: No
Description: 배포 서버 접속용 SSH 개인키
```

**중요**: 
- 전체 키 내용을 복사 (헤더/푸터 포함)
- 개행 문자 유지
- Type을 "File"로 설정

### DEV_SERVER_HOST
```yaml
Name: DEV_SERVER_HOST
Value: dev.yourcompany.com
Protected: No
Masked: No
Description: 개발 서버 호스트명
```

### DEV_SERVER_USER
```yaml
Name: DEV_SERVER_USER
Value: deploy
Protected: No
Masked: No
Description: 배포용 사용자 계정
```

### PROD_SERVER_HOST (프로덕션)
```yaml
Name: PROD_SERVER_HOST
Value: yourcompany.com
Protected: Yes
Masked: No
Description: 프로덕션 서버 호스트명
```

### PROD_SERVER_USER (프로덕션)
```yaml
Name: PROD_SERVER_USER
Value: deploy
Protected: Yes
Masked: No
Description: 프로덕션 배포 계정
```

### SSH_PRIVATE_KEY_PROD (프로덕션)
```yaml
Name: SSH_PRIVATE_KEY_PROD
Type: File
Value: (프로덕션 서버용 SSH 키)
Protected: Yes
Masked: No
Description: 프로덕션 서버 전용 SSH 키
```

---

## 3️⃣ Turborepo 원격 캐싱 (선택)

### TURBO_TOKEN
```yaml
Name: TURBO_TOKEN
Value: (Vercel Remote Cache 토큰)
Protected: Yes
Masked: Yes
Description: Turborepo 원격 캐싱 토큰
```

### TURBO_TEAM
```yaml
Name: TURBO_TEAM
Value: your-team-slug
Protected: No
Masked: No
Description: Turborepo 팀 이름
```

---

## 4️⃣ 클라우드 스토리지 설정 (rclone)

### RCLONE_CONFIG
```yaml
Name: RCLONE_CONFIG
Type: File
Value:
[gdrive]
type = drive
client_id = xxx.apps.googleusercontent.com
client_secret = xxx
token = {"access_token":"xxx","token_type":"Bearer",...}

Protected: Yes
Masked: No
Description: rclone 전체 설정 파일
```

**사용 예시**:
- 빌드 아티팩트를 Google Drive에 자동 업로드
- 백업 파일 클라우드 저장

---

## 5️⃣ 환경 변수 (선택)

### NODE_ENV
```yaml
Name: NODE_ENV
Value: production
Protected: No
Masked: No
Description: Node.js 환경 설정
```

### APP_VERSION
```yaml
Name: APP_VERSION
Value: 1.0.0
Protected: No
Masked: No
Description: 애플리케이션 버전
```

### VITE_API_URL (Vite 프로젝트)
```yaml
Name: VITE_API_URL
Value: https://api.yourcompany.com
Protected: No
Masked: No
Description: API 엔드포인트 (Vite는 VITE_ prefix 필수)
```

**주의**: 
- Next.js: `NEXT_PUBLIC_` prefix
- Vite: `VITE_` prefix
- 클라이언트에서 접근 가능

---

## 6️⃣ Slack/Discord 알림 (선택)

### SLACK_WEBHOOK_URL
```yaml
Name: SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/xxx/xxx/xxx
Protected: Yes
Masked: Yes
Description: 배포 완료 시 Slack 알림
```

### DISCORD_WEBHOOK_URL
```yaml
Name: DISCORD_WEBHOOK_URL
Value: https://discord.com/api/webhooks/xxx/xxx
Protected: Yes
Masked: Yes
Description: 배포 완료 시 Discord 알림
```

---

## 🔧 SSH 키 생성 방법

### 1단계: 로컬에서 SSH 키 생성
```bash
ssh-keygen -t ed25519 -C "gitlab-ci-deploy" -f ~/.ssh/gitlab_deploy
```

**옵션 설명**:
- `-t ed25519`: 최신 암호화 알고리즘
- `-C "gitlab-ci-deploy"`: 주석 (키 식별용)
- `-f ~/.ssh/gitlab_deploy`: 파일명

### 2단계: 공개키를 배포 서버에 등록
```bash
ssh-copy-id -i ~/.ssh/gitlab_deploy.pub deploy@dev.yourcompany.com
```

**또는 수동 등록**:
```bash
# 공개키 출력
cat ~/.ssh/gitlab_deploy.pub

# 서버에 접속하여 추가
# ~/.ssh/authorized_keys 파일에 공개키 내용 추가
```

### 3단계: 개인키를 GitLab에 등록
```bash
# 개인키 출력
cat ~/.ssh/gitlab_deploy

# 전체 내용 복사하여 GitLab Variable SSH_PRIVATE_KEY에 등록
# -----BEGIN ... -----부터 -----END ... -----까지 모두 복사
```

### 4단계: 로컬 키 삭제 (보안)
```bash
# 보안을 위해 로컬에서 키 삭제
rm ~/.ssh/gitlab_deploy
rm ~/.ssh/gitlab_deploy.pub
```

### 5단계: 테스트
```bash
# GitLab CI/CD에서 SSH 연결 테스트
ssh -i $SSH_PRIVATE_KEY deploy@dev.yourcompany.com "echo 'Connection successful'"
```

---

## ☁️ rclone 설정 방법

### 1단계: rclone 설치
```bash
# Linux/Mac
curl https://rclone.org/install.sh | sudo bash

# Windows
# https://rclone.org/downloads/ 에서 다운로드
```

### 2단계: Google Drive 연동
```bash
rclone config

# 대화형 설정
n (새 리모트 생성)
name: gdrive
Storage: drive (Google Drive 선택)
client_id: (Google Cloud Console에서 발급)
client_secret: (Google Cloud Console에서 발급)
scope: drive (전체 접근)
# 브라우저 인증 진행
```

### 3단계: 설정 파일 확인
```bash
cat ~/.config/rclone/rclone.conf

# 출력 예시:
# [gdrive]
# type = drive
# client_id = xxx.apps.googleusercontent.com
# client_secret = xxx
# token = {"access_token":"xxx",...}
```

### 4단계: GitLab Variable 등록
```
1. 전체 rclone.conf 내용 복사
2. GitLab > Settings > CI/CD > Variables
3. RCLONE_CONFIG 변수 생성
4. Type: File
5. 전체 내용 붙여넣기
```

### 5단계: CI/CD에서 사용
```yaml
# .gitlab-ci.yml
upload_to_drive:
  script:
    - echo "$RCLONE_CONFIG" > /etc/rclone/rclone.conf
    - rclone copy dist/ gdrive:backup/
```

---

## 🔒 보안 Best Practices

### 1. 절대 코드에 하드코딩하지 말 것
```bash
# ❌ 나쁜 예
export API_KEY="sk-1234567890"

# ✅ 좋은 예
export API_KEY="$GITLAB_API_KEY"
```

### 2. Masked 옵션 활성화
- 비밀번호, 토큰, API 키 → Masked: Yes
- 로그에 `[MASKED]`로 표시됨

### 3. Protected 옵션 활용
- 프로덕션 관련 변수 → Protected: Yes
- `main`, `develop` 브랜치에서만 접근 가능

### 4. 정기적인 키 로테이션
```bash
# 3개월마다 SSH 키 및 토큰 교체 권장
# 1. 새 키 생성
# 2. GitLab 및 서버에 등록
# 3. 테스트 후 기존 키 삭제
```

### 5. 최소 권한 원칙
```bash
# 배포용 계정은 최소 권한만 부여
# - 읽기 권한만 필요하면 읽기만
# - 쓰기가 필요한 디렉토리만 접근
```

### 6. 감사 로그 정기 검토
```
GitLab > Settings > Audit Events
→ 변수 접근 기록 확인
→ 이상 활동 모니터링
```

### 7. 환경별 분리
```yaml
# 개발
SSH_PRIVATE_KEY (Protected: No)

# 프로덕션
SSH_PRIVATE_KEY_PROD (Protected: Yes)
```

---

## 📋 체크리스트

설정 전 확인사항:

- [ ] SSH 키 생성 및 서버 등록 완료
- [ ] 모든 민감 정보 Masked 설정
- [ ] 프로덕션 변수 Protected 설정
- [ ] 변수명 명확하게 작성 (`DEV_`, `PROD_` prefix)
- [ ] 테스트 파이프라인 실행 확인
- [ ] 로그에 민감 정보 노출 여부 확인
- [ ] 문서화 (어떤 변수가 어디서 사용되는지)

---

## 🔗 관련 문서

- [01-QUICKSTART.md](./01-QUICKSTART.md) - 빠른 시작
- [09-환경별-설정-가이드.md](./09-환경별-설정-가이드.md) - 환경별 설정
- [GitLab CI/CD Variables 공식 문서](https://docs.gitlab.com/ee/ci/variables/)

---

**작성**: 2024-12-08  
**버전**: v5.1
