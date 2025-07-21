import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/components/lib/utils";

/**
 * 라벨 컴포넌트의 스타일 변형
 */
const labelVariants = cva(
    // 기본 스타일: 작은 폰트, 중간 굵기, 라인 높이, 비활성화 상태 처리
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

/**
 * 라벨 컴포넌트
 *
 * @description 폼 요소와 연결되는 라벨을 제공합니다.
 * 접근성을 위해 htmlFor 속성을 사용하여 해당 입력 요소와 연결됩니다.
 *
 * 사용 예시:
 * - 기본 라벨: <Label htmlFor="email">이메일 주소</Label>
 * - 입력 필드와 함께:
 *   <div>
 *     <Label htmlFor="email">이메일 주소</Label>
 *     <Input id="email" type="email" />
 *   </div>
 *
 * @param htmlFor - 연결할 입력 요소의 ID
 * @param className - 추가 CSS 클래스
 * @param ...props - 기본 label HTML 속성들
 */
const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
        VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants(), className)}
        {...props}
    />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
