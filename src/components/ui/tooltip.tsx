import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/components/lib/utils";

/**
 * 툴팁 컴포넌트 세트
 *
 * @description 요소에 마우스를 올렸을 때 추가 정보를 표시하는 툴팁 시스템입니다.
 * 버튼, 아이콘, 링크 등에 설명이나 힌트를 제공할 때 사용합니다.
 *
 * 특징:
 * - 호버 시 자동 표시/숨김
 * - 키보드 접근성 지원 (포커스 시 표시)
 * - 스크린 리더 지원
 * - 4방향 위치 자동 조정
 * - 딜레이 및 애니메이션 지원
 *
 * 사용 예시:
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger asChild>
 *       <Button variant="outline">도움말</Button>
 *     </TooltipTrigger>
 *     <TooltipContent>
 *       <p>이 버튼을 클릭하면 도움말이 표시됩니다.</p>
 *     </TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 *
 * 여러 툴팁 사용:
 * <TooltipProvider>
 *   <div className="flex gap-2">
 *     <Tooltip>
 *       <TooltipTrigger asChild>
 *         <Button size="icon"><Save /></Button>
 *       </TooltipTrigger>
 *       <TooltipContent>저장</TooltipContent>
 *     </Tooltip>
 *
 *     <Tooltip>
 *       <TooltipTrigger asChild>
 *         <Button size="icon"><Delete /></Button>
 *       </TooltipTrigger>
 *       <TooltipContent>삭제</TooltipContent>
 *     </Tooltip>
 *   </div>
 * </TooltipProvider>
 */

/**
 * 툴팁 프로바이더 컴포넌트
 *
 * @description 툴팁 시스템의 루트 컴포넌트입니다.
 * 모든 툴팁을 사용하는 영역을 감싸야 합니다.
 *
 * 기본 설정:
 * - 호버 딜레이: 700ms
 * - 숨김 딜레이: 300ms
 * - 스킵 딜레이: 300ms (연속 호버 시)
 */
const TooltipProvider = TooltipPrimitive.Provider;

/**
 * 툴팁 루트 컴포넌트
 *
 * @description 개별 툴팁의 상태를 관리하는 컨테이너입니다.
 * 열림/닫힘 상태, 위치 계산 등을 담당합니다.
 */
const Tooltip = TooltipPrimitive.Root;

/**
 * 툴팁 트리거 컴포넌트
 *
 * @description 툴팁을 발생시키는 요소입니다.
 * 일반적으로 버튼, 아이콘, 링크 등을 래핑합니다.
 *
 * 주요 이벤트:
 * - onMouseEnter: 마우스 진입 시 툴팁 표시
 * - onMouseLeave: 마우스 벗어날 시 툴팁 숨김
 * - onFocus: 키보드 포커스 시 툴팁 표시
 * - onBlur: 포커스 벗어날 시 툴팁 숨김
 */
const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * 툴팁 콘텐츠 컴포넌트
 *
 * @description 실제 툴팁 내용이 표시되는 컴포넌트입니다.
 * 텍스트, 아이콘, 간단한 UI 요소들을 포함할 수 있습니다.
 *
 * @param sideOffset - 트리거 요소로부터의 거리 (기본값: 4px)
 * @param className - 추가 CSS 클래스
 * @param ...props - 기본 Radix UI TooltipContent 속성들
 */
const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
            // 기본 스타일: z-index, 오버플로우, 모서리, 테두리, 배경, 패딩, 텍스트, 그림자, 애니메이션
            "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
            // 애니메이션: 페이드/줌 인, 페이드/줌 아웃, 방향별 슬라이드 인
            "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            // 방향별 슬라이드 애니메이션
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
        )}
        {...props}
    />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
