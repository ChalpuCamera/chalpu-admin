import * as React from "react"

import { cn } from "@/components/lib/utils"

/**
 * 카드 컴포넌트 세트
 * 
 * @description 콘텐츠를 카드 형태로 그룹화하여 표시하는 컴포넌트들입니다.
 * 헤더, 제목, 설명, 콘텐츠, 푸터로 구성되어 있으며, 각각 독립적으로 사용할 수 있습니다.
 * 
 * 사용 예시:
 * <Card>
 *   <CardHeader>
 *     <CardTitle>카드 제목</CardTitle>
 *     <CardDescription>카드 설명</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>카드 내용</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>액션 버튼</Button>
 *   </CardFooter>
 * </Card>
 */

/**
 * 카드 컨테이너 컴포넌트
 * 
 * @description 카드의 기본 컨테이너입니다.
 * 둥근 모서리, 테두리, 배경색, 그림자를 제공합니다.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * 카드 헤더 컴포넌트
 * 
 * @description 카드의 헤더 영역입니다.
 * 제목과 설명을 포함하며, 적절한 패딩과 간격을 제공합니다.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * 카드 제목 컴포넌트
 * 
 * @description 카드의 주요 제목을 표시합니다.
 * 큰 폰트 크기와 세미볼드 스타일을 제공합니다.
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * 카드 설명 컴포넌트
 * 
 * @description 카드의 부가 설명을 표시합니다.
 * 작은 폰트와 흐린 색상으로 제목을 보완합니다.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * 카드 콘텐츠 컴포넌트
 * 
 * @description 카드의 주요 콘텐츠 영역입니다.
 * 적절한 패딩을 제공하며, 상단 패딩은 제거되어 있습니다.
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * 카드 푸터 컴포넌트
 * 
 * @description 카드의 하단 영역입니다.
 * 주로 액션 버튼들을 배치하는 데 사용됩니다.
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
