import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/components/lib/utils";

/**
 * 아바타 컴포넌트 세트
 *
 * @description 사용자 프로필 이미지를 표시하는 컴포넌트들입니다.
 * 이미지, 폴백 텍스트를 지원하며, 이미지 로드 실패 시 폴백이 자동으로 표시됩니다.
 *
 * 사용 예시:
 * <Avatar>
 *   <AvatarImage src="/profile.jpg" alt="사용자 프로필" />
 *   <AvatarFallback>홍길동</AvatarFallback>
 * </Avatar>
 */

/**
 * 아바타 컨테이너 컴포넌트
 *
 * @description 아바타의 기본 컨테이너입니다.
 * 원형 모양과 고정된 크기를 제공합니다.
 */
const Avatar = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Root
        ref={ref}
        className={cn(
            // 상대적 위치, 플렉스 레이아웃, 고정 크기 (40x40px), 축소 방지, 오버플로우 숨김, 원형
            "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
            className
        )}
        {...props}
    />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

/**
 * 아바타 이미지 컴포넌트
 *
 * @description 아바타의 실제 이미지를 표시합니다.
 * 이미지 로드에 실패하면 자동으로 폴백 컴포넌트가 표시됩니다.
 */
const AvatarImage = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        className={cn(
            // 정사각형 비율 유지, 전체 높이와 너비 차지
            "aspect-square h-full w-full",
            className
        )}
        {...props}
    />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

/**
 * 아바타 폴백 컴포넌트
 *
 * @description 이미지 로드 실패 시 표시되는 텍스트입니다.
 * 보통 사용자의 이름 이니셜이나 대체 텍스트를 표시합니다.
 */
const AvatarFallback = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
            // 플렉스 레이아웃, 전체 크기, 중앙 정렬, 원형, 배경색
            "flex h-full w-full items-center justify-center rounded-full bg-muted",
            className
        )}
        {...props}
    />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
