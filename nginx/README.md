# Nginx 폴더 - 리버스 프록시 설정

이 폴더의 파일들을 프로젝트의 `nginx/` 폴더에 배치하세요.

## 파일 배치 방법

```bash
# 프로젝트 루트로 이동
cd /path/to/your/my-monorepo

# nginx 폴더 생성
mkdir -p nginx

# 파일 복사
cp nginx/nginx.conf ./nginx/
```

## 파일 설명

### nginx.conf (리버스 프록시)
- **용도**: MSA 아키텍처의 라우팅 및 로드밸런싱
- **특징**:
  - URL 기반 라우팅 (/, /feature-a, /feature-b 등)
  - 정적 파일 캐싱
  - Gzip 압축
  - 보안 헤더
  - SSL/TLS 지원

## 라우팅 구조

```
https://yourcompany.com/           → main-app:80
https://yourcompany.com/feature-a  → feature-a:80
https://yourcompany.com/feature-b  → feature-b:80
https://yourcompany.com/feature-c  → feature-c:80
```

## 설정 수정 필요 사항

### 1. 도메인 변경
```nginx
# 수정 전
server_name yourcompany.com www.yourcompany.com;

# 수정 후
server_name dev.mycompany.com www.mycompany.com;
```

### 2. SSL 인증서 경로
```nginx
# Let's Encrypt 사용 시
ssl_certificate /etc/letsencrypt/live/yourcompany.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourcompany.com/privkey.pem;
```

### 3. 업스트림 서버
```nginx
# Docker Compose 사용 시 (자동 DNS)
upstream main_app {
    server main-app:80;
}

# 별도 서버 사용 시
upstream main_app {
    server 192.168.1.100:80;
    server 192.168.1.101:80;  # 로드밸런싱
}
```

## 사용 방법

### Docker Compose 환경
```yaml
# docker-compose.yml에 이미 포함됨
nginx:
  image: nginx:alpine
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
  ports:
    - "80:80"
    - "443:443"
```

### 단독 Nginx 서버
```bash
# 설정 파일 복사
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf

# 설정 검증
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

## SSL 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt-get install certbot python3-certbot-nginx

# 인증서 발급
sudo certbot --nginx -d yourcompany.com -d www.yourcompany.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

## 트러블슈팅

### 문제 1: 404 에러
**원인**: 업스트림 서버 연결 실패

**확인**:
```bash
# Docker 컨테이너 상태 확인
docker-compose ps

# Nginx 로그 확인
docker-compose logs nginx
```

### 문제 2: SPA 라우팅 안됨
**원인**: try_files 설정 누락

**확인**: docker/nginx.conf에 다음 설정이 있는지 확인
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 문제 3: HTTPS 리다이렉트 무한 루프
**원인**: SSL 설정 오류

**해결**: HTTP 블록 확인
```nginx
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

## 성능 최적화

### 1. 캐시 설정
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
```

### 2. 연결 최적화
```nginx
keepalive_timeout 65;
keepalive_requests 100;
```

### 3. 압축 설정
```nginx
gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json;
```

## 참고

- Docker 컨테이너 내부 Nginx 설정: `docker/nginx.conf`
- Docker Compose 설정: `config/docker-compose.yml`
