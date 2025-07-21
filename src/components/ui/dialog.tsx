import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/components/lib/utils";

/**
 * 다이얼로그(모달) 컴포넌트 세트
 *
 * @description 모달 창을 구현하기 위한 컴포넌트들의 집합입니다.
 * 오버레이, 콘텐츠, 헤더, 제목 등을 포함하여 완전한 모달 경험을 제공합니다.
 *
 * 사용 예시:
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogTrigger>모달 열기</DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>제목</DialogTitle>
 *       <DialogDescription>설명</DialogDescription>
 *     </DialogHeader>
 *     <div>모달 내용</div>
 *   </DialogContent>
 * </Dialog>
 */

/** 다이얼로그 루트 컴포넌트 - 모달의 상태를 관리합니다 */
const Dialog = DialogPrimitive.Root;

/** 다이얼로그를 열기 위한 트리거 버튼 */
const DialogTrigger = DialogPrimitive.Trigger;

/** 다이얼로그를 포털에 렌더링하는 컴포넌트 */
const DialogPortal = DialogPrimitive.Portal;

/** 다이얼로그를 닫기 위한 컴포넌트 */
const DialogClose = DialogPrimitive.Close;

/**
 * 다이얼로그 오버레이 컴포넌트
 *
 * @description 모달 뒤의 어두운 배경을 제공합니다.
 * 클릭 시 모달이 닫히며, 페이드 인/아웃 애니메이션을 제공합니다.
 */
const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            // 전체 화면 고정, 높은 z-index, 어두운 배경, 페이드 애니메이션
            "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * 다이얼로그 콘텐츠 컴포넌트
 *
 * @description 실제 모달 내용을 담는 컨테이너입니다.
 * 중앙 정렬, 그림자, 테두리, 애니메이션 효과를 제공합니다.
 * 우상단에 닫기 버튼(X)이 자동으로 추가됩니다.
 */
const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                // 중앙 정렬, 그리드 레이아웃, 최대 너비, 패딩, 그림자, 애니메이션
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
                className
            )}
            {...props}
        >
            {children}
            {/* 자동 추가되는 닫기 버튼 */}
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/**
 * 다이얼로그 헤더 컴포넌트
 *
 * @description 모달의 헤더 영역을 구성합니다.
 * 제목과 설명을 포함하며, 적절한 간격을 제공합니다.
 */
const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            // 세로 플렉스, 간격, 중앙 정렬 (모바일에서), 좌측 정렬 (데스크톱에서)
            "flex flex-col space-y-1.5 text-center sm:text-left",
            className
        )}
        {...props}
    />
);
DialogHeader.displayName = "DialogHeader";

/**
 * 다이얼로그 푸터 컴포넌트
 *
 * @description 모달의 하단 영역을 구성합니다.
 * 액션 버튼들을 배치하는 데 주로 사용됩니다.
 */
const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            // 반응형 레이아웃: 모바일에서는 세로, 데스크톱에서는 가로 + 우측 정렬
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
);
DialogFooter.displayName = "DialogFooter";

/**
 * 다이얼로그 제목 컴포넌트
 *
 * @description 모달의 제목을 표시합니다.
 * 접근성을 위해 적절한 헤딩 레벨과 스타일을 제공합니다.
 */
const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn(
            // 큰 폰트, 세미볼드, 라인 높이, 자간 조정
            "text-lg font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/**
 * 다이얼로그 설명 컴포넌트
 *
 * @description 모달의 부가 설명을 표시합니다.
 * 제목 아래에 배치되며, 약간 흐린 색상으로 표시됩니다.
 */
const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)} // 작은 폰트, 흐린 색상
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
};
