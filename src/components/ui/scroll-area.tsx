import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/components/lib/utils";

/**
 * 스크롤 영역 컴포넌트 세트
 *
 * @description 커스텀 스크롤바가 있는 스크롤 가능한 영역을 제공하는 컴포넌트들입니다.
 * 긴 콘텐츠를 제한된 공간에서 스크롤할 수 있게 하며, 브라우저 기본 스크롤바 대신
 * 커스터마이징된 스크롤바를 사용합니다.
 *
 * 사용 예시:
 * <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
 *   <div>긴 콘텐츠...</div>
 * </ScrollArea>
 *
 * 수직/수평 스크롤:
 * <ScrollArea className="h-72 w-48">
 *   <div className="space-y-3">
 *     {items.map(item => <div key={item.id}>{item.content}</div>)}
 *   </div>
 * </ScrollArea>
 */

/**
 * 스크롤 영역 컨테이너 컴포넌트
 *
 * @description 스크롤 가능한 영역의 기본 컨테이너입니다.
 * 자식 요소들이 오버플로우될 때 커스텀 스크롤바를 제공합니다.
 *
 * @param className - 추가 CSS 클래스 (높이와 너비 설정 필수)
 * @param children - 스크롤될 콘텐츠
 * @param ...props - 기본 Radix UI ScrollArea 속성들
 */
const ScrollArea = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
    <ScrollAreaPrimitive.Root
        ref={ref}
        className={cn(
            // 상대적 위치, 오버플로우 숨김
            "relative overflow-hidden",
            className
        )}
        {...props}
    >
        <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
            {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar />
        <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

/**
 * 스크롤바 컴포넌트
 *
 * @description 커스터마이징된 스크롤바를 제공합니다.
 * 수직/수평 방향을 지원하며, 마우스 호버 시 표시됩니다.
 *
 * @param orientation - 스크롤바 방향 ("vertical" | "horizontal")
 * @param className - 추가 CSS 클래스
 * @param ...props - 기본 Radix UI ScrollBar 속성들
 */
const ScrollBar = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
    React.ComponentPropsWithoutRef<
        typeof ScrollAreaPrimitive.ScrollAreaScrollbar
    >
>(({ className, orientation = "vertical", ...props }, ref) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
        ref={ref}
        orientation={orientation}
        className={cn(
            // 기본 스타일: 플렉스, 터치 방지, 선택 방지, 전환 효과
            "flex touch-none select-none transition-colors",
            // 수직 스크롤바: 전체 높이, 너비 2.5, 좌측 테두리, 패딩
            orientation === "vertical" &&
                "h-full w-2.5 border-l border-l-transparent p-[1px]",
            // 수평 스크롤바: 높이 2.5, 플렉스 세로, 상단 테두리, 패딩
            orientation === "horizontal" &&
                "h-2.5 flex-col border-t border-t-transparent p-[1px]",
            className
        )}
        {...props}
    >
        {/* 스크롤바 썸(thumb) - 실제 드래그 가능한 부분 */}
        <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
