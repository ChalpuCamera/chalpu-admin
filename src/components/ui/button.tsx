import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/components/lib/utils";

/**
 * 버튼 컴포넌트의 스타일 변형을 정의합니다.
 *
 * @description 다양한 버튼 스타일과 크기를 제공하는 재사용 가능한 버튼 컴포넌트
 *
 * 사용 예시:
 * - 기본 버튼: <Button>클릭하세요</Button>
 * - 위험 버튼: <Button variant="destructive">삭제</Button>
 * - 큰 버튼: <Button size="lg">큰 버튼</Button>
 * - 아이콘 버튼: <Button size="icon"><Icon /></Button>
 * - 커스텀 요소: <Button asChild><Link href="/page">링크</Link></Button>
 */
const buttonVariants = cva(
    // 기본 스타일: 플렉스 레이아웃, 정렬, 간격, 폰트, 전환 효과, 포커스 상태
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground hover:bg-primary/90", // 기본 버튼 (파란색)
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90", // 위험 버튼 (빨간색)
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground", // 테두리 버튼
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80", // 보조 버튼 (회색)
                ghost: "hover:bg-accent hover:text-accent-foreground", // 고스트 버튼 (투명, 호버 시 배경)
                link: "text-primary underline-offset-4 hover:underline", // 링크 스타일 버튼
            },
            size: {
                default: "h-10 px-4 py-2", // 기본 크기 (40px 높이)
                sm: "h-9 rounded-md px-3", // 작은 크기 (36px 높이)
                lg: "h-11 rounded-md px-8", // 큰 크기 (44px 높이)
                icon: "h-10 w-10", // 아이콘 전용 (정사각형 40x40px)
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

/**
 * 버튼 컴포넌트의 Props 인터페이스
 */
export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    /** 자식 요소를 Slot으로 렌더링할지 여부 (다른 컴포넌트로 래핑할 때 사용) */
    asChild?: boolean;
}

/**
 * 버튼 컴포넌트
 *
 * @description 클릭 가능한 버튼 요소를 렌더링합니다.
 * 다양한 스타일 변형과 크기를 지원하며, 접근성을 고려한 포커스 상태를 제공합니다.
 *
 * @param variant - 버튼의 시각적 스타일 (default, destructive, outline, secondary, ghost, link)
 * @param size - 버튼의 크기 (default, sm, lg, icon)
 * @param asChild - true일 경우 자식 요소를 직접 렌더링 (Link 컴포넌트 등과 함께 사용)
 * @param className - 추가 CSS 클래스
 * @param ...props - 기본 button HTML 속성들
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
