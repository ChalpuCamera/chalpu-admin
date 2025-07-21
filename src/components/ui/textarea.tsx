import * as React from "react";

import { cn } from "@/components/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * 텍스트 영역 컴포넌트
 *
 * @description 여러 줄의 텍스트를 입력할 수 있는 텍스트 영역입니다.
 * 자동 크기 조절은 지원하지 않으며, 최소 높이가 설정되어 있습니다.
 *
 * 사용 예시:
 * - 기본 텍스트 영역: <Textarea placeholder="의견을 입력하세요" />
 * - 행 수 지정: <Textarea rows={6} placeholder="긴 텍스트 입력" />
 * - 제어된 상태: <Textarea value={value} onChange={handleChange} />
 * - 비활성화: <Textarea disabled placeholder="비활성화된 영역" />
 *
 * @param rows - 텍스트 영역의 행 수 (기본값: 자동)
 * @param placeholder - 플레이스홀더 텍스트
 * @param disabled - 비활성화 여부
 * @param className - 추가 CSS 클래스
 * @param ...props - 기본 textarea HTML 속성들
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    // 기본 레이아웃과 크기: 최소 높이 80px, 전체 너비, 둥근 모서리
                    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2",
                    // 텍스트 스타일
                    "text-sm",
                    // 포커스 상태: 링 애니메이션과 아웃라인 제거
                    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    // 플레이스홀더 스타일
                    "placeholder:text-muted-foreground",
                    // 비활성화 상태: 커서 변경과 투명도 적용
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";

export { Textarea };
