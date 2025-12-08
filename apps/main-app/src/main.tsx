/**
 * Main Entry Point for React Application
 * 
 * React 18의 새로운 createRoot API 사용
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

/**
 * React Query 클라이언트 설정
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5분간 캐싱
      staleTime: 1000 * 60 * 5,
      // 24시간 동안 캐시 유지
      gcTime: 1000 * 60 * 60 * 24,
      // 윈도우 포커스 시 자동 refetch 비활성화
      refetchOnWindowFocus: false,
      // 재시도 설정
      retry: 1,
    },
  },
});

/**
 * 루트 엘리먼트에 React 앱 마운트
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || '/'}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
