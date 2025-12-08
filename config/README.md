# Config 폴더 - 설정 파일 배치 가이드

이 폴더의 파일들을 프로젝트 루트에 배치하세요.

## 파일 배치 방법

### Linux / Mac
```bash
# 프로젝트 루트로 이동
cd /path/to/your/my-monorepo

# 설정 파일 복사
cp config/turbo.json ./turbo.json
cp config/package.json ./package.json
cp config/docker-compose.yml ./docker-compose.yml
cp config/gitlab-ci.yml ./.gitlab-ci.yml
cp config/env.example ./.env.example
cp config/gitignore ./.gitignore
cp config/rclone.conf.example ./rclone.conf.example
```

### Windows (PowerShell)
```powershell
# 프로젝트 루트로 이동
cd C:\path\to\your\my-monorepo

# 설정 파일 복사
Copy-Item config\turbo.json .\turbo.json
Copy-Item config\package.json .\package.json
Copy-Item config\docker-compose.yml .\docker-compose.yml
Copy-Item config\gitlab-ci.yml .\.gitlab-ci.yml
Copy-Item config\env.example .\.env.example
Copy-Item config\gitignore .\.gitignore
Copy-Item config\rclone.conf.example .\rclone.conf.example
```

## 파일 설명

| 파일 | 용도 | 배치 위치 |
|------|------|-----------|
| `turbo.json` | Turborepo 설정 | 루트 |
| `package.json` | 루트 의존성 | 루트 |
| `docker-compose.yml` | Docker 오케스트레이션 | 루트 |
| `gitlab-ci.yml` | CI/CD 파이프라인 | 루트 (`.gitlab-ci.yml`) |
| `env.example` | 환경 변수 예시 | 루트 (`.env.example`) |
| `gitignore` | Git 무시 파일 | 루트 (`.gitignore`) |
| `rclone.conf.example` | 클라우드 업로드 | 루트 |

## ⚠️ 주의사항

1. **점(.)으로 시작하는 파일들**
   - `gitlab-ci.yml` → `.gitlab-ci.yml`
   - `env.example` → `.env.example`
   - `gitignore` → `.gitignore`

2. **환경 변수 파일**
   - `.env.example`을 복사하여 `.env.local` 생성
   - `.env.local`에 실제 환경 변수 입력

3. **GitLab CI/CD**
   - `.gitlab-ci.yml`은 프로젝트 루트에 있어야 인식됨
