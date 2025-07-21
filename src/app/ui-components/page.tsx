"use client";

import { useState } from "react";
import { Button } from "@/components//ui/button";
import { Input } from "@/components//ui/input";
import { Label } from "@/components//ui/label";
import { Checkbox } from "@/components//ui/checkbox";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components//ui/radio-group";
import { Textarea } from "@/components//ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components//ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components//ui/card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components//ui/avatar";
import { ScrollArea } from "@/components//ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components//ui/tooltip";
import {
    Toast,
    ToastAction,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components//ui/toast";
import { Toaster, toast } from "@/components//ui/sonner";
import {
    Heart,
    Settings,
    Download,
    Trash2,
} from "lucide-react";

/**
 * UI 컴포넌트 갤러리 페이지
 *
 * @description 프로젝트에서 사용하는 모든 UI 컴포넌트들을 시각적으로 확인할 수 있는 페이지입니다.
 * 개발 중에 컴포넌트 동작과 스타일을 테스트하기 위한 목적으로 만들어졌습니다.
 */
export default function UIComponentsPage() {
    const [checkboxState, setCheckboxState] = useState(false);
    const [radioValue, setRadioValue] = useState("option1");
    const [inputValue, setInputValue] = useState("");
    const [textareaValue, setTextareaValue] = useState("");
    const [showToast, setShowToast] = useState(false);

    return (
        <>
            <Toaster />
            <ToastProvider>
                <div className="min-h-screen bg-gray-50 p-8">
                    <div className="max-w-6xl mx-auto space-y-12">
                        {/* 헤더 */}
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl font-bold text-gray-900">
                                UI 컴포넌트 갤러리
                            </h1>
                            <p className="text-lg text-gray-600">
                                찰푸 웹 프로젝트에서 사용하는 모든 UI
                                컴포넌트들을 확인할 수 있습니다.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                                <p className="text-sm text-blue-800">
                                    💡 <strong>개발자 팁:</strong> 각 컴포넌트의
                                    소스 코드에는 상세한 주석과 사용 예제가
                                    포함되어 있습니다.
                                </p>
                            </div>
                        </div>

                        {/* 버튼 컴포넌트 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Button 컴포넌트</CardTitle>
                                <CardDescription>
                                    다양한 스타일과 크기를 지원하는 버튼
                                    컴포넌트입니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* 버튼 변형 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        변형 (Variants)
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        <Button variant="default">
                                            기본 버튼
                                        </Button>
                                        <Button variant="destructive">
                                            위험 버튼
                                        </Button>
                                        <Button variant="outline">
                                            테두리 버튼
                                        </Button>
                                        <Button variant="secondary">
                                            보조 버튼
                                        </Button>
                                        <Button variant="ghost">
                                            고스트 버튼
                                        </Button>
                                        <Button variant="link">
                                            링크 버튼
                                        </Button>
                                    </div>
                                </div>

                                {/* 버튼 크기 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        크기 (Sizes)
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <Button size="sm">작은 버튼</Button>
                                        <Button size="default">
                                            기본 버튼
                                        </Button>
                                        <Button size="lg">큰 버튼</Button>
                                        <Button size="icon">
                                            <Heart className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* 상태 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        상태 (States)
                                    </h3>
                                    <div className="flex gap-3">
                                        <Button>활성 상태</Button>
                                        <Button disabled>비활성 상태</Button>
                                        <Button
                                            onClick={() =>
                                                toast.success(
                                                    "버튼이 클릭되었습니다!"
                                                )
                                            }
                                        >
                                            토스트 테스트
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 입력 컴포넌트 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Input 컴포넌트</CardTitle>
                                <CardDescription>
                                    사용자 입력을 받는 텍스트 필드입니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="text-input">
                                            기본 텍스트 입력
                                        </Label>
                                        <Input
                                            id="text-input"
                                            placeholder="텍스트를 입력하세요"
                                            value={inputValue}
                                            onChange={(e) =>
                                                setInputValue(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email-input">
                                            이메일 입력
                                        </Label>
                                        <Input
                                            id="email-input"
                                            type="email"
                                            placeholder="example@email.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password-input">
                                            비밀번호 입력
                                        </Label>
                                        <Input
                                            id="password-input"
                                            type="password"
                                            placeholder="비밀번호를 입력하세요"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tel-input">
                                            전화번호 입력
                                        </Label>
                                        <Input
                                            id="tel-input"
                                            type="tel"
                                            placeholder="010-0000-0000"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="disabled-input">
                                            비활성화된 입력
                                        </Label>
                                        <Input
                                            id="disabled-input"
                                            disabled
                                            placeholder="비활성화된 필드"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="file-input">
                                            파일 업로드
                                        </Label>
                                        <Input id="file-input" type="file" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 체크박스 & 라디오 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Checkbox & RadioGroup 컴포넌트
                                </CardTitle>
                                <CardDescription>
                                    선택 가능한 입력 요소들입니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* 체크박스 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        체크박스
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="checkbox-1"
                                                checked={checkboxState}
                                                onCheckedChange={(checked) =>
                                                    setCheckboxState(
                                                        checked === true
                                                    )
                                                }
                                            />
                                            <Label htmlFor="checkbox-1">
                                                동의합니다 (제어된 상태)
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="checkbox-2" />
                                            <Label htmlFor="checkbox-2">
                                                기본 체크박스
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="checkbox-3"
                                                disabled
                                            />
                                            <Label htmlFor="checkbox-3">
                                                비활성화된 체크박스
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                {/* 라디오 그룹 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        라디오 그룹
                                    </h3>
                                    <RadioGroup
                                        value={radioValue}
                                        onValueChange={setRadioValue}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="option1"
                                                id="option1"
                                            />
                                            <Label htmlFor="option1">
                                                옵션 1
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="option2"
                                                id="option2"
                                            />
                                            <Label htmlFor="option2">
                                                옵션 2
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="option3"
                                                id="option3"
                                            />
                                            <Label htmlFor="option3">
                                                옵션 3
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    <p className="text-sm text-gray-600">
                                        선택된 값: {radioValue}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 텍스트 영역 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Textarea 컴포넌트</CardTitle>
                                <CardDescription>
                                    여러 줄 텍스트를 입력할 수 있는 영역입니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="textarea">
                                        의견을 남겨주세요
                                    </Label>
                                    <Textarea
                                        id="textarea"
                                        placeholder="여기에 의견을 입력하세요..."
                                        value={textareaValue}
                                        onChange={(e) =>
                                            setTextareaValue(e.target.value)
                                        }
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="textarea-disabled">
                                        비활성화된 텍스트 영역
                                    </Label>
                                    <Textarea
                                        id="textarea-disabled"
                                        placeholder="비활성화된 텍스트 영역"
                                        disabled
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 다이얼로그 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Dialog 컴포넌트</CardTitle>
                                <CardDescription>
                                    모달 창을 표시하는 컴포넌트입니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-3">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button>기본 다이얼로그</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    다이얼로그 제목
                                                </DialogTitle>
                                                <DialogDescription>
                                                    이것은 다이얼로그의
                                                    설명입니다. 여기에 필요한
                                                    정보를 표시할 수 있습니다.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <p>
                                                    다이얼로그 본문 내용입니다.
                                                </p>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline">
                                                        취소
                                                    </Button>
                                                    <Button>확인</Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 아바타 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Avatar 컴포넌트</CardTitle>
                                <CardDescription>
                                    사용자 프로필 이미지를 표시하는
                                    컴포넌트입니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage
                                            src="https://github.com/shadcn.png"
                                            alt="@shadcn"
                                        />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <Avatar>
                                        <AvatarImage
                                            src="/nonexistent-image.png"
                                            alt="fallback test"
                                        />
                                        <AvatarFallback>FB</AvatarFallback>
                                    </Avatar>
                                    <Avatar>
                                        <AvatarFallback>찰푸</AvatarFallback>
                                    </Avatar>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 스크롤 영역 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>ScrollArea 컴포넌트</CardTitle>
                                <CardDescription>
                                    커스텀 스크롤바가 있는 스크롤 영역입니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-32 w-full border rounded-md p-4">
                                    <div className="space-y-2">
                                        {Array.from({ length: 20 }, (_, i) => (
                                            <div key={i} className="text-sm">
                                                스크롤 아이템 {i + 1} - 이것은
                                                스크롤 영역을 테스트하기 위한 긴
                                                텍스트입니다.
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* 툴팁 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tooltip 컴포넌트</CardTitle>
                                <CardDescription>
                                    호버 시 추가 정보를 표시하는 컴포넌트입니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TooltipProvider>
                                    <div className="flex gap-4">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline">
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>설정</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>다운로드</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>삭제</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TooltipProvider>
                            </CardContent>
                        </Card>

                        {/* 토스트 알림 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Toast 알림 시스템</CardTitle>
                                <CardDescription>
                                    사용자에게 피드백을 제공하는 알림
                                    시스템입니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Sonner 토스트 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        Sonner 토스트
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        현재 프로젝트에서 사용 중인 토스트
                                        시스템
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            onClick={() =>
                                                toast.success(
                                                    "성공적으로 완료되었습니다!"
                                                )
                                            }
                                        >
                                            성공 토스트
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() =>
                                                toast.error(
                                                    "오류가 발생했습니다!"
                                                )
                                            }
                                        >
                                            에러 토스트
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                toast.warning(
                                                    "주의사항이 있습니다."
                                                )
                                            }
                                        >
                                            경고 토스트
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() =>
                                                toast.info("정보를 확인하세요.")
                                            }
                                        >
                                            정보 토스트
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                toast.success(
                                                    "파일이 저장되었습니다!",
                                                    {
                                                        description:
                                                            "문서가 안전하게 저장되었습니다.",
                                                        action: {
                                                            label: "확인",
                                                            onClick: () =>
                                                                toast.info(
                                                                    "확인 버튼이 클릭되었습니다!"
                                                                ),
                                                        },
                                                    }
                                                )
                                            }
                                        >
                                            액션이 있는 토스트
                                        </Button>
                                    </div>
                                </div>

                                {/* Radix UI 토스트 */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        Radix UI 토스트
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        대안으로 사용할 수 있는 Radix UI 기반
                                        토스트
                                    </p>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowToast(true)}
                                        >
                                            Radix UI 토스트 표시
                                        </Button>
                                    </div>

                                    {showToast && (
                                        <Toast>
                                            <div className="grid gap-1">
                                                <ToastTitle>알림</ToastTitle>
                                                <ToastDescription>
                                                    Radix UI 토스트 알림입니다.
                                                    스와이프하여 닫을 수
                                                    있습니다.
                                                </ToastDescription>
                                            </div>
                                            <ToastAction
                                                altText="확인"
                                                onClick={() => {
                                                    setShowToast(false);
                                                    toast.success(
                                                        "Radix UI 토스트 액션이 실행되었습니다!"
                                                    );
                                                }}
                                            >
                                                확인
                                            </ToastAction>
                                            <ToastClose
                                                onClick={() =>
                                                    setShowToast(false)
                                                }
                                            />
                                        </Toast>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Label 컴포넌트 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Label 컴포넌트</CardTitle>
                                <CardDescription>
                                    폼 요소와 연결되는 라벨 컴포넌트입니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Label 컴포넌트는 다른 UI 컴포넌트들과 함께
                                    사용되어 접근성을 향상시킵니다. 위의 Input,
                                    Checkbox, RadioGroup 예제에서 사용된 것을
                                    확인할 수 있습니다.
                                </p>
                                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="example-input"
                                            className="text-base font-semibold"
                                        >
                                            예제 라벨 (큰 폰트)
                                        </Label>
                                        <Input
                                            id="example-input"
                                            placeholder="라벨과 연결된 입력 필드"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="example-textarea"
                                            className="text-sm"
                                        >
                                            예제 라벨 (기본 크기)
                                        </Label>
                                        <Textarea
                                            id="example-textarea"
                                            placeholder="라벨과 연결된 텍스트 영역"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 푸터 */}
                        <div className="text-center py-8 space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-2">
                                    개발자 정보
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    이 페이지는 개발 목적으로 만들어졌습니다.
                                    프로덕션에서는 접근할 수 없습니다.
                                </p>
                                <div className="text-sm text-gray-500 space-y-1">
                                    <p>
                                        📁 컴포넌트 경로:{" "}
                                        <code>src/components//ui/</code>
                                    </p>
                                    <p>
                                        🎨 스타일링: Tailwind CSS + CVA (Class
                                        Variance Authority)
                                    </p>
                                    <p>
                                        🔧 기반 라이브러리: Radix UI + Lucide
                                        React Icons
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ToastViewport />
            </ToastProvider>
        </>
    );
}
