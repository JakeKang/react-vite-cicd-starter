/**
 * Vite Configuration for React Monorepo App
 * 
 * 핵심 설정:
 * - base: MSA 라우팅을 위한 basePath
 * - build.outDir: 빌드 결과물 경로
 * - resolve.alias: Monorepo 패키지 참조
 * - optimizeDeps: 의존성 사전 번들링
 */

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      // SWC 컴파일러 사용 (Babel보다 20배 빠름)
      react({
        // Fast Refresh 활성화
        fastRefresh: true,
        // JSX Runtime 자동 주입
        jsxRuntime: 'automatic',
      }),
    ],

    /**
     * Base Path 설정 (MSA 구조)
     * 
     * 각 앱별 설정:
     * - main-app: base: '/'
     * - feature-a: base: '/feature-a'
     * - feature-b: base: '/feature-b'
     * 
     * 주의: 모든 asset, router 경로에 자동으로 prefix 추가됨
     */
    base: process.env.VITE_BASE_PATH || '/',

    /**
     * 개발 서버 설정
     */
    server: {
      port: parseInt(env.PORT || '3000'),
      host: true, // Docker 컨테이너에서 접근 가능하도록
      strictPort: true, // 포트 사용 중이면 에러 발생
      // CORS 설정 (마이크로 앱 간 통신)
      cors: true,
      // HMR 설정
      hmr: {
        overlay: true, // 에러 오버레이 표시
      },
      // 프록시 설정 (API 요청 우회)
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },

    /**
     * 프로덕션 빌드 설정
     */
    build: {
      // 출력 디렉토리
      outDir: 'dist',
      // 소스맵 생성 (프로덕션에서는 false 권장)
      sourcemap: mode !== 'production',
      // 청크 크기 경고 임계값 (KB)
      chunkSizeWarningLimit: 1000,
      // 롤업 옵션
      rollupOptions: {
        output: {
          // 청크 분할 전략 (코드 스플리팅)
          manualChunks: {
            // 벤더 청크 분리
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // UI 라이브러리 분리
            'ui-vendor': ['@repo/ui'],
            // 상태 관리 라이브러리 분리
            'state-vendor': ['zustand', '@tanstack/react-query'],
          },
          // 파일명 패턴
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
        },
      },
      // CSS 코드 스플리팅
      cssCodeSplit: true,
      // Minify 설정 (esbuild가 기본, terser보다 20배 빠름)
      minify: 'esbuild',
      // 타겟 브라우저 (ES2015+ 지원 브라우저)
      target: 'es2015',
      // 레거시 브라우저 지원 비활성화 (필요시 @vitejs/plugin-legacy 사용)
      // 프로덕션에서 console 제거
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      } : undefined,
    },

    /**
     * 경로 별칭 (Monorepo 패키지 참조)
     */
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@repo/ui': path.resolve(__dirname, '../../packages/ui/src'),
        '@repo/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/src'),
        '@repo/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
      },
    },

    /**
     * 의존성 최적화
     * Vite는 의존성을 사전 번들링하여 브라우저가 더 빠르게 로드
     */
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'zustand',
      ],
      // CJS 모듈을 ESM으로 변환
      esbuildOptions: {
        target: 'es2015',
      },
    },

    /**
     * 환경 변수 prefix
     * VITE_로 시작하는 변수만 브라우저에 노출됨
     */
    envPrefix: 'VITE_',

    /**
     * Esbuild 설정
     */
    esbuild: {
      // JSX 자동 주입
      jsxInject: `import React from 'react'`,
      // 타겟 설정
      target: 'es2015',
      // 프로덕션에서 console 제거
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },

    /**
     * CSS 전처리기 설정 (Sass 사용 시)
     */
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
      // CSS 모듈 설정
      modules: {
        localsConvention: 'camelCaseOnly',
        generateScopedName: '[name]__[local]___[hash:base64:5]',
      },
    },

    /**
     * 테스트 설정 (Vitest)
     */
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/mockData/*',
        ],
      },
    },
  };
});
