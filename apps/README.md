# Apps 폴더 - 애플리케이션 소스

이 폴더의 파일들을 프로젝트의 `apps/main-app/` 폴더에 배치하세요.

## 파일 배치 방법

```bash
# 프로젝트 루트로 이동
cd /path/to/your/my-monorepo

# main-app 폴더 생성
mkdir -p apps/main-app/src

# 파일 복사
cp apps/main-app/package.json ./apps/main-app/
cp apps/main-app/vite.config.ts ./apps/main-app/
cp apps/main-app/index.html ./apps/main-app/
cp apps/main-app/src/main.tsx ./apps/main-app/src/
cp apps/main-app/src/App.tsx ./apps/main-app/src/
```

## 파일 설명

### package.json
- Main App의 의존성 및 스크립트
- React 18, React Router v6, React Query 등

### vite.config.ts
- Vite 빌드 설정
- 경로 alias
- 프록시 설정
- 최적화 옵션

### index.html
- HTML 엔트리포인트
- Vite의 시작점

### src/main.tsx
- React 엔트리포인트
- React Router, React Query 설정

### src/App.tsx
- 메인 앱 컴포넌트
- 라우팅 설정

## 추가 생성 필요 파일

Main App을 완성하려면 다음 파일들을 추가로 생성하세요:

```
apps/main-app/
├── src/
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── components/         # 재사용 컴포넌트
│   │   ├── common/
│   │   └── layout/
│   │
│   ├── hooks/              # 커스텀 훅
│   ├── utils/              # 유틸리티
│   ├── api/                # API 클라이언트
│   ├── types/              # TypeScript 타입
│   └── styles/             # 스타일 (CSS/SCSS)
│       └── index.css
│
├── public/                 # 정적 파일
│   └── vite.svg
│
├── .env.example           # 환경 변수 예시
└── tsconfig.json          # TypeScript 설정
```

## 기본 페이지 생성 예시

### src/pages/HomePage.tsx
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

### src/pages/DashboardPage.tsx
```typescript
export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4 text-gray-600">대시보드 페이지</p>
    </div>
  );
}
```

### src/pages/NotFoundPage.tsx
```typescript
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="mt-4 text-xl text-gray-600">페이지를 찾을 수 없습니다</p>
      <Link to="/" className="mt-8 text-blue-600 hover:underline">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
```

### src/styles/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

## TypeScript 설정

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"],
      "@repo/ui": ["../../packages/ui/src"],
      "@repo/shared-utils": ["../../packages/shared-utils/src"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 실행 방법

```bash
# 의존성 설치 (루트에서)
npm install

# Main App 개발 서버 실행
npm run dev:main

# 또는 apps/main-app에서 직접 실행
cd apps/main-app
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 다른 마이크로 앱 생성

Feature A, B, C 앱도 동일한 구조로 생성:

```bash
# Feature A 생성
mkdir -p apps/feature-a/src
cp apps/main-app/package.json apps/feature-a/
cp apps/main-app/vite.config.ts apps/feature-a/
# ... 나머지 파일 복사 및 수정
```

**vite.config.ts 수정 (Feature A)**:
```typescript
export default defineConfig({
  // ...
  base: '/feature-a',  // basePath 설정
  server: {
    port: 3001,        // 포트 변경
  },
});
```

## 참고

- 공유 UI 컴포넌트: `packages/ui/`에 생성
- 공유 유틸리티: `packages/shared-utils/`에 생성
- API 클라이언트: `packages/api-client/`에 생성
