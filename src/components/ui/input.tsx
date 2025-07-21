import * as React from "react";

import { cn } from "@/components/lib/utils";

/**
 * 입력 필드 컴포넌트
 *
 * @description 사용자 입력을 받는 텍스트 필드입니다.
 * 다양한 입력 타입을 지원하며, 포커스 상태와 비활성화 상태를 제공합니다.
 *
 * 사용 예시:
 * - 텍스트 입력: <Input placeholder="이름을 입력하세요" />
 * - 이메일 입력: <Input type="email" placeholder="이메일을 입력하세요" />
 * - 비밀번호 입력: <Input type="password" placeholder="비밀번호를 입력하세요" />
 * - 전화번호 입력: <Input type="tel" placeholder="010-0000-0000" />
 * - 파일 업로드: <Input type="file" />
 * - 비활성화: <Input disabled placeholder="비활성화된 필드" />
 *
 * @param type - 입력 타입 (text, email, password, tel, file, number 등)
 * @param placeholder - 플레이스홀더 텍스트
 * @param disabled - 비활성화 여부
 * @param className - 추가 CSS 클래스
 * @param ...props - 기본 input HTML 속성들
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    // 기본 레이아웃과 크기
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
                    // 텍스트 스타일 (반응형 폰트 크기)
                    "text-base md:text-sm",
                    // 포커스 상태: 링 애니메이션과 아웃라인 제거
                    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    // 파일 업로드 관련 스타일
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
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
Input.displayName = "Input";

export { Input };
