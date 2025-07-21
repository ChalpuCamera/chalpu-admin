// 가이드 관련 타입 정의

export interface Guide {
  guideId: number;
  content: string;
  guideS3Key: string; // XML 파일 (안드로이드용)
  svgS3Key: string; // SVG 파일 (UI 미리보기용)
  fileName: string;
  imageS3Key: string;
  categoryName: string;
  subCategoryName: string;
  tags: string[];
}

export interface GuidePresignedUrlRequest {
  fileName: string;
}

export interface GuidePresignedUrlResponse {
  guideS3Key: string; // XML 파일
  guideUploadUrl: string;
  svgS3Key: string; // SVG 파일
  svgUploadUrl: string;
  imageS3Key: string; // 이미지 파일
  imageUploadUrl: string;
}

export interface GuideRegisterRequest {
  guideS3Key: string; // XML 파일
  svgS3Key: string; // SVG 파일
  fileName: string;
  imageS3Key: string; // 이미지 파일
  content?: string;
  subCategoryId: number;
  tags?: string[];
}

export interface GuideRegisterResponse {
  guideId: number;
  content: string;
  guideS3Key: string; // XML 파일
  svgS3Key: string; // SVG 파일
  fileName: string;
  imageS3Key: string; // 이미지 파일
  categoryName: string;
  subCategoryName: string;
  tags: string[];
}

export interface GuideListResponse {
  content: Guide[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface GuideDetailResponse {
  id: number;
  s3Key: string;
  fileName: string;
  createdAt: string;
}

export interface GuideDeleteRequest {
  guideIds: number[];
}

export interface GuideDeleteResponse {
  // 비어있는 result 객체
  [key: string]: never;
}

// 가이드 API 응답 공통 형태
export interface GuideApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// 가이드 업로드 진행률 관련 타입
export interface GuideUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface GuideFileUploadItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  guide?: Guide;
}

// 페이지네이션 파라미터
export interface Pageable {
  page: number;
  size: number;
  sort?: string[];
}

// 카테고리 enum 및 관련 타입
export enum FoodCategory {
  COFFEE = 1,
  BEVERAGE = 2,
  TEA = 3,
  CAKE = 4,
  BAKERY = 5,
  ICE_CREAM = 6,
  HAMBURGER = 7,
  PIZZA = 8,
  SANDWICH = 9,
  TOAST = 10,
  VIETNAMESE_FOOD = 11,
  THAI_FOOD = 12,
  INDIAN_FOOD = 13,
  KOREAN_MEAL = 14,
  PORRIDGE = 15,
  NOODLES = 16,
  MEAT = 17,
  GRILLED = 18,
  STEW = 19,
  SOUP_RICE = 20,
  PORK_FEET = 21,
  PORK_CUTLET = 22,
  SASHIMI = 23,
  SUSHI = 24,
  UDON = 25,
  SOBA = 26,
  TTEOKBOKKI = 27,
  KIMBAP = 28,
  RAMEN = 29,
  FRIED_FOOD = 30,
  FRIED_CHICKEN = 31,
  SEASONED_CHICKEN = 32,
  OVEN_ROASTED = 33,
  JAJANGMYEON = 34,
  JJAMPPONG = 35,
  SWEET_SOUR_PORK = 36,
  MALATANG = 37,
  STEAMED = 38,
  SOUP = 39,
  HOTPOT = 40,
}

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  [FoodCategory.COFFEE]: "커피",
  [FoodCategory.BEVERAGE]: "음료",
  [FoodCategory.TEA]: "차",
  [FoodCategory.CAKE]: "케이크",
  [FoodCategory.BAKERY]: "베이커리",
  [FoodCategory.ICE_CREAM]: "아이스크림",
  [FoodCategory.HAMBURGER]: "햄버거",
  [FoodCategory.PIZZA]: "피자",
  [FoodCategory.SANDWICH]: "샌드위치",
  [FoodCategory.TOAST]: "토스트",
  [FoodCategory.VIETNAMESE_FOOD]: "베트남 음식",
  [FoodCategory.THAI_FOOD]: "태국 음식",
  [FoodCategory.INDIAN_FOOD]: "인도 음식",
  [FoodCategory.KOREAN_MEAL]: "백반",
  [FoodCategory.PORRIDGE]: "죽",
  [FoodCategory.NOODLES]: "국수",
  [FoodCategory.MEAT]: "고기",
  [FoodCategory.GRILLED]: "구이",
  [FoodCategory.STEW]: "찌개",
  [FoodCategory.SOUP_RICE]: "국밥",
  [FoodCategory.PORK_FEET]: "족발",
  [FoodCategory.PORK_CUTLET]: "돈까스",
  [FoodCategory.SASHIMI]: "회",
  [FoodCategory.SUSHI]: "초밥",
  [FoodCategory.UDON]: "우동",
  [FoodCategory.SOBA]: "소바",
  [FoodCategory.TTEOKBOKKI]: "떡볶이",
  [FoodCategory.KIMBAP]: "김밥",
  [FoodCategory.RAMEN]: "라면",
  [FoodCategory.FRIED_FOOD]: "튀김",
  [FoodCategory.FRIED_CHICKEN]: "후라이드",
  [FoodCategory.SEASONED_CHICKEN]: "양념치킨",
  [FoodCategory.OVEN_ROASTED]: "오븐구이",
  [FoodCategory.JAJANGMYEON]: "짜장면",
  [FoodCategory.JJAMPPONG]: "짬뽕",
  [FoodCategory.SWEET_SOUR_PORK]: "탕수육",
  [FoodCategory.MALATANG]: "마라탕",
  [FoodCategory.STEAMED]: "찜",
  [FoodCategory.SOUP]: "탕",
  [FoodCategory.HOTPOT]: "전골",
};

export const FOOD_CATEGORY_OPTIONS = Object.entries(FOOD_CATEGORY_LABELS).map(
  ([value, label]) => ({
    value: Number(value) as FoodCategory,
    label,
  })
);
