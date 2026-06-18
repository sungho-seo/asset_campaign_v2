import { Component } from 'react';
import type { ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // 운영에서는 모니터링 전송. 개발에서는 콘솔.
    if (import.meta.env.DEV) console.error('ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <h1 className="text-lg font-bold text-neutral-900">문제가 발생했습니다</h1>
          <p className="mt-2 text-sm text-neutral-500">
            화면을 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-lgred px-4 py-2 text-sm font-medium text-white hover:bg-lgred-600"
          >
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
