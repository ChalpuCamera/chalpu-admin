import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/components/lib/utils";

/**
 * Radix UI 토스트 알림 시스템
 *
 * @description Radix UI 기반의 토스트 알림 시스템입니다.
 * 현재 프로젝트에서는 Sonner를 사용하고 있지만, 이 컴포넌트는 대안으로 사용할 수 있습니다.
 *
 * 특징:
 * - Radix UI 기반의 완전한 접근성 지원
 * - 커스터마이징 가능한 스타일링
 * - 스와이프 제스처 지원
 * - 프로그래밍 방식의 제어 가능
 *
 * 사용 예시:
 * <ToastProvider>
 *   <Toast>
 *     <ToastTitle>알림 제목</ToastTitle>
 *     <ToastDescription>알림 내용</ToastDescription>
 *     <ToastAction altText="확인">확인</ToastAction>
 *     <ToastClose />
 *   </Toast>
 *   <ToastViewport />
 * </ToastProvider>
 */

/** 토스트 프로바이더 - 토스트 시스템의 루트 컴포넌트 */
const ToastProvider = ToastPrimitives.Provider;

/**
 * 토스트 뷰포트 컴포넌트
 *
 * @description 토스트들이 표시될 화면상의 위치를 정의합니다.
 * 일반적으로 화면 우하단에 고정되어 표시됩니다.
 */
const ToastViewport = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Viewport>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
        ref={ref}
        className={cn(
            // 고정 위치: 화면 상단 또는 하단, 최대 높이, 전체 너비, 플렉스 컬럼, 패딩
            "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
            className
        )}
        {...props}
    />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

/**
 * 토스트 스타일 변형 정의
 */
const toastVariants = cva(
    // 기본 스타일: 그룹, 포인터 이벤트, 위치, 플렉스, 크기, 아이템 정렬, 간격, 오버플로우, 모서리, 테두리, 패딩, 그림자, 전환, 스와이프 애니메이션
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
    {
        variants: {
            variant: {
                default: "border bg-background text-foreground", // 기본 토스트 (흰색 배경)
                destructive:
                    "destructive group border-destructive bg-destructive text-destructive-foreground", // 에러/위험 토스트 (빨간색)
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

/**
 * 토스트 컴포넌트
 *
 * @description 개별 토스트 알림의 컨테이너입니다.
 * 제목, 설명, 액션 버튼 등을 포함할 수 있습니다.
 *
 * @param variant - 토스트 스타일 ("default" | "destructive")
 * @param className - 추가 CSS 클래스
 * @param ...props - 기본 Radix UI Toast 속성들
 */
const Toast = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
        VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
    return (
        <ToastPrimitives.Root
            ref={ref}
            className={cn(toastVariants({ variant }), className)}
            {...props}
        />
    );
});
Toast.displayName = ToastPrimitives.Root.displayName;

/**
 * 토스트 액션 컴포넌트
 *
 * @description 토스트 내에서 사용자가 클릭할 수 있는 액션 버튼입니다.
 * "확인", "다시 시도", "실행 취소" 등의 기능을 제공합니다.
 */
const ToastAction = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Action>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Action
        ref={ref}
        className={cn(
            // 기본 스타일: 인라인 플렉스, 높이, 축소 방지, 아이템 정렬, 중앙 정렬, 모서리, 테두리, 배경, 패딩, 텍스트, 폰트, 링, 전환
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            // 위험 그룹 내에서의 스타일
            "group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
            className
        )}
        {...props}
    />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

/**
 * 토스트 닫기 버튼 컴포넌트
 *
 * @description 토스트를 수동으로 닫을 수 있는 X 버튼입니다.
 * 우상단에 표시되며, 클릭 시 토스트가 사라집니다.
 */
const ToastClose = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Close>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Close
        ref={ref}
        className={cn(
            // 기본 스타일: 절대 위치, 우상단, 모서리, 패딩, 텍스트 색상, 투명도, 전환, 호버 효과, 포커스 효과
            "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
            // 위험 그룹 내에서의 스타일
            "group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
            className
        )}
        toast-close=""
        {...props}
    >
        <X className="h-4 w-4" />
    </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

/**
 * 토스트 제목 컴포넌트
 *
 * @description 토스트의 주요 제목을 표시합니다.
 * 일반적으로 볼드 텍스트로 표시됩니다.
 */
const ToastTitle = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Title>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Title
        ref={ref}
        className={cn("text-sm font-semibold", className)} // 작은 폰트, 세미볼드
        {...props}
    />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

/**
 * 토스트 설명 컴포넌트
 *
 * @description 토스트의 상세 설명을 표시합니다.
 * 제목보다 작은 폰트로 부가 정보를 제공합니다.
 */
const ToastDescription = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Description>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Description
        ref={ref}
        className={cn("text-sm opacity-90", className)} // 작은 폰트, 약간 투명
        {...props}
    />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
    type ToastProps,
    type ToastActionElement,
    ToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose,
    ToastAction,
};
