"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 실제 로깅 서비스 사용)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            문제가 발생했습니다
          </h1>
          <p className="text-gray-600 mb-8">
            일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            다시 시도
          </button>

          <div className="text-sm text-gray-500">
            <p>
              문제가 지속되면 페이지를 새로고침하거나 고객센터로 문의해주세요.{" "}
              <span className="whitespace-nowrap">
                chalpuofficial@gmail.com
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
