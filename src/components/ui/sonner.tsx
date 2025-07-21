import { Toaster as Sonner, toast } from "sonner";

/**
 * Sonner 토스트 알림 시스템
 *
 * @description 사용자에게 피드백을 제공하는 토스트 알림 시스템입니다.
 * 성공, 에러, 경고, 정보 등 다양한 타입의 알림을 지원합니다.
 *
 * 사용 예시:
 * // 컴포넌트 렌더링
 * <Toaster />
 *
 * // 알림 호출
 * toast.success("성공적으로 완료되었습니다!");
 * toast.error("오류가 발생했습니다.");
 * toast.warning("주의사항이 있습니다.");
 * toast.info("정보를 확인하세요.");
 *
 * // 상세 옵션과 함께
 * toast.success("파일이 저장되었습니다!", {
 *   description: "문서가 안전하게 저장되었습니다.",
 *   duration: 5000,
 *   action: {
 *     label: "확인",
 *     onClick: () => console.log("확인 클릭")
 *   }
 * });
 */

/**
 * 토스터 컴포넌트
 *
 * @description 토스트 알림을 화면에 렌더링하는 컨테이너입니다.
 * 앱의 최상위 레벨에서 한 번만 렌더링하면 됩니다.
 *
 * 기본 설정:
 * - 위치: 화면 하단 우측
 * - 스타일: 프로젝트 테마와 일치
 * - 자동 사라짐: 4초 후 (기본값)
 * - 최대 개수: 3개
 *
 * @param props - Sonner 컴포넌트의 설정 옵션들
 * @returns JSX.Element
 */
const Toaster = (props: React.ComponentProps<typeof Sonner>) => (
    <Sonner
        className="toaster group"
        toastOptions={{
            classNames: {
                // 토스트 기본 스타일
                toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                // 설명 텍스트 스타일
                description: "group-[.toast]:text-muted-foreground",
                // 액션 버튼 스타일 (확인, 취소 등)
                actionButton:
                    "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                // 취소 버튼 스타일
                cancelButton:
                    "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
            },
        }}
        {...props}
    />
);

export { Toaster, toast };
