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

export interface GuideUpdateRequest {
  content?: string;
  subCategoryId?: number;
  fileName?: string;
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
  guideS3Key: string | null; // XML 파일 (nullable)
  svgS3Key: string; // SVG 파일
  fileName: string;
  imageS3Key: string; // 이미지 파일
  content?: string | null;
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

// 서브카테고리 관련 타입
export interface SubCategory {
  id: number;
  name: string;
  tips: string;
  categoryName: string;
}

export interface SubCategoryListResponse {
  code: number;
  message: string;
  result: SubCategory[];
}

