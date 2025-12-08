# Multi-stage Dockerfile for Vite React Apps in Monorepo
# 최신 패턴: Vite 빌드 + Nginx 정적 파일 서빙 = 이미지 크기 95% 감소
# 
# 최종 이미지 크기: ~20MB (Node.js 기반 대비 95% 감소)
# - Alpine Nginx: ~15MB
# - 빌드된 정적 파일: ~5MB

# ============================================
# Stage 1: 의존성 설치 (deps)
# ============================================
FROM node:20-alpine AS deps

# 필수 시스템 라이브러리 설치
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Turborepo 설치 (전역)
RUN npm install -g turbo

# 루트 package.json과 lock file만 먼저 복사 (레이어 캐싱 최적화)
COPY package*.json ./
COPY turbo.json ./

# 모든 워크스페이스의 package.json 복사
COPY apps/*/package*.json ./apps/
COPY packages/*/package*.json ./packages/

# 의존성 설치
# 프로덕션 의존성만 설치하되, 빌드 도구(devDependencies)도 필요
RUN npm ci --prefer-offline

# ============================================
# Stage 2: 빌더 (builder)
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Turborepo 설치
RUN npm install -g turbo

# deps 스테이지에서 node_modules 복사
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages

# 전체 소스 코드 복사
COPY . .

# 빌드 인자: 어떤 앱을 빌드할지 지정
ARG APP_NAME=main-app

# 빌드 시점 환경 변수 (선택사항)
ARG VITE_API_URL
ARG VITE_BASE_PATH

# 환경 변수 설정
ENV NODE_ENV=production
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_BASE_PATH=${VITE_BASE_PATH}

# Turborepo로 특정 앱만 빌드
# Vite는 dist/ 폴더에 정적 파일 생성
RUN turbo run build --filter=${APP_NAME}

# ============================================
# Stage 3: 런타임 (Nginx)
# ============================================
FROM nginx:alpine AS runner

# 빌드 인자 재선언
ARG APP_NAME=main-app

# Nginx 설정 파일 복사
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 빌드된 정적 파일만 복사 (dist/ 폴더)
# 주의: Vite 빌드 결과물은 apps/${APP_NAME}/dist에 생성됨
COPY --from=builder /app/apps/${APP_NAME}/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Nginx 실행
# daemon off: 포그라운드 실행 (Docker 컨테이너에서 필수)
CMD ["nginx", "-g", "daemon off;"]
