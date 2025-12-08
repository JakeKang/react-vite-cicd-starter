# Docker 폴더 - Docker 설정 파일

이 폴더의 파일들을 프로젝트의 `docker/` 폴더에 배치하세요.

## 파일 배치 방법

```bash
# 프로젝트 루트로 이동
cd /path/to/your/my-monorepo

# docker 폴더 생성
mkdir -p docker

# 파일 복사
cp docker/Dockerfile.app ./docker/
cp docker/nginx.conf ./docker/
```

## 파일 설명

### Dockerfile.app
- **용도**: Vite React 앱을 Nginx 정적 파일로 빌드
- **특징**: 
  - 멀티스테이지 빌드 (3단계)
  - 최종 이미지 크기: ~20MB
  - Turborepo 캐싱 지원

**빌드 예시:**
```bash
docker build \
  -f docker/Dockerfile.app \
  --build-arg APP_NAME=main-app \
  -t my-app:latest \
  .
```

### nginx.conf
- **용도**: Docker 컨테이너 내부 Nginx 설정
- **특징**:
  - SPA 라우팅 지원 (`try_files`)
  - Gzip 압축
  - 정적 파일 캐싱
  - 헬스체크 엔드포인트 (`/health`)

## 사용 방법

### 1. 이미지 빌드
```bash
# Main App 빌드
docker build \
  -f docker/Dockerfile.app \
  --build-arg APP_NAME=main-app \
  -t my-monorepo/main-app:latest \
  .

# Feature A 빌드
docker build \
  -f docker/Dockerfile.app \
  --build-arg APP_NAME=feature-a \
  --build-arg VITE_BASE_PATH=/feature-a \
  -t my-monorepo/feature-a:latest \
  .
```

### 2. 컨테이너 실행
```bash
docker run -d -p 8080:80 my-monorepo/main-app:latest
```

### 3. 헬스체크
```bash
curl http://localhost:8080/health
# 응답: healthy
```

## 트러블슈팅

### 문제 1: "COPY failed"
**원인**: 빌드 컨텍스트가 루트가 아님

**해결**:
```bash
# ❌ 잘못된 예
cd docker && docker build -f Dockerfile.app .

# ✅ 올바른 예 (프로젝트 루트에서)
docker build -f docker/Dockerfile.app .
```

### 문제 2: 이미지 크기가 너무 큼
**원인**: 멀티스테이지 빌드 실패

**확인**:
```bash
docker images | grep my-app
# 크기가 20MB 이하여야 정상
```

### 문제 3: 헬스체크 실패
**원인**: nginx.conf 파일이 복사되지 않음

**확인**:
```bash
docker exec -it <container-id> cat /etc/nginx/nginx.conf
```

## 참고

- `docker-compose.yml`은 `config/` 폴더에 있습니다
- Nginx 리버스 프록시 설정은 `nginx/` 폴더에 있습니다
