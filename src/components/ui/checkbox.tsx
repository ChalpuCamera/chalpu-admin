import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/components/lib/utils";

/**
 * 체크박스 컴포넌트
 *
 * @description 사용자가 선택/해제할 수 있는 체크박스입니다.
 * 체크 상태를 시각적으로 표현하며, 접근성을 고려한 키보드 조작을 지원합니다.
 *
 * 사용 예시:
 * - 기본 체크박스: <Checkbox />
 * - 제어된 체크박스: <Checkbox checked={isChecked} onCheckedChange={setIsChecked} />
 * - 라벨과 함께:
 *   <div className="flex items-center space-x-2">
 *     <Checkbox id="terms" />
 *     <label htmlFor="terms">약관에 동의합니다</label>
 *   </div>
 * - 비활성화: <Checkbox disabled />
 *
 * @param checked - 체크 상태 (boolean | "indeterminate")
 * @param onCheckedChange - 상태 변경 핸들러
 * @param disabled - 비활성화 여부
 * @param className - 추가 CSS 클래스
 * @param ...props - 기본 Radix UI Checkbox 속성들
 */
const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            // 기본 크기와 모양: 16x16px 정사각형, 둥근 모서리
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary",
            // 포커스 상태: 링 애니메이션
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            // 비활성화 상태: 커서 변경과 투명도 적용
            "disabled:cursor-not-allowed disabled:opacity-50",
            // 체크 상태: 배경과 텍스트 색상 변경
            "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            className
        )}
        {...props}
    >
        {/* 체크 표시 아이콘 - 체크 상태일 때만 표시 */}
        <CheckboxPrimitive.Indicator
            className={cn("flex items-center justify-center text-current")}
        >
            <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
