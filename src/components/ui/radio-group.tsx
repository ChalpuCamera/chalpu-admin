import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@/components/lib/utils";
import { Circle } from "lucide-react";

/**
 * 라디오 그룹 컴포넌트
 *
 * @description 여러 옵션 중 하나만 선택할 수 있는 라디오 버튼 그룹입니다.
 * 각 옵션은 라디오 버튼과 라벨로 구성되며, 하나의 그룹 내에서 상호 배타적으로 선택됩니다.
 *
 * 사용 예시:
 * <RadioGroup value={selectedValue} onValueChange={setSelectedValue}>
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="option1" id="option1" />
 *     <Label htmlFor="option1">옵션 1</Label>
 *   </div>
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="option2" id="option2" />
 *     <Label htmlFor="option2">옵션 2</Label>
 *   </div>
 * </RadioGroup>
 *
 * @param value - 현재 선택된 값
 * @param onValueChange - 값 변경 핸들러
 * @param className - 추가 CSS 클래스
 * @param ...props - 기본 Radix UI RadioGroup 속성들
 */
const RadioGroup = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
    return (
        <RadioGroupPrimitive.Root
            className={cn("grid gap-2", className)} // 그리드 레이아웃, 아이템 간격 2
            {...props}
            ref={ref}
        />
    );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

/**
 * 라디오 그룹 아이템 컴포넌트
 *
 * @description 라디오 그룹 내의 개별 라디오 버튼입니다.
 * 원형 모양으로 표시되며, 선택 시 내부에 작은 원이 나타납니다.
 *
 * @param value - 이 라디오 버튼의 값
 * @param id - 라벨과 연결하기 위한 ID
 * @param disabled - 비활성화 여부
 * @param className - 추가 CSS 클래스
 * @param ...props - 기본 Radix UI RadioGroupItem 속성들
 */
const RadioGroupItem = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
    return (
        <RadioGroupPrimitive.Item
            ref={ref}
            className={cn(
                // 기본 크기와 모양: 16x16px 원형, 테두리
                "aspect-square h-4 w-4 rounded-full border border-primary text-primary",
                // 포커스 상태: 링 애니메이션
                "ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                // 비활성화 상태: 커서 변경과 투명도 적용
                "disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            {/* 선택 표시 아이콘 - 선택 상태일 때만 표시 */}
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                <Circle className="h-2.5 w-2.5 fill-current text-current" />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
