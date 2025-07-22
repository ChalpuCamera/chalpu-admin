import apiClient from "./base";

// 어드민 토큰을 헤더에 포함하는 헬퍼 함수
const getAdminHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const adminToken = localStorage.getItem("admin_auth_token");
    if (adminToken) {
      const bearerToken = adminToken.startsWith("Bearer ")
        ? adminToken
        : `Bearer ${adminToken}`;
      headers.Authorization = bearerToken;
    }
  }

  return headers;
};
import {
  Guide,
  GuidePresignedUrlRequest,
  GuidePresignedUrlResponse,
  GuideRegisterRequest,
  GuideRegisterResponse,
  GuideListResponse,
  GuideDetailResponse,
  GuideDeleteRequest,
  GuideDeleteResponse,
  GuideApiResponse,
  Pageable,
  GuideUploadProgress,
} from "../types/guide";

/**
 * 가이드 전체 목록 조회 (Admin)
 */
export const getGuides = async (
  pageable: Pageable
): Promise<GuideListResponse> => {
  const params = new URLSearchParams();
  params.append("page", pageable.page.toString());
  params.append("size", pageable.size.toString());

  if (pageable.sort) {
    pageable.sort.forEach((sortParam) => {
      params.append("sort", sortParam);
    });
  }

  const response = await apiClient.get<GuideApiResponse<GuideListResponse>>(
    `/api/guides?${params.toString()}`,
    { headers: getAdminHeaders() }
  );
  return response.data.result;
};

/**
 * 가이드 상세 조회 (Admin)
 */
export const getGuide = async (
  guideId: number
): Promise<GuideDetailResponse> => {
  const response = await apiClient.get<GuideApiResponse<GuideDetailResponse>>(
    `/api/guides/${guideId}`,
    { headers: getAdminHeaders() }
  );
  return response.data.result;
};

/**
 * 가이드 업로드용 Presigned URL 생성 (Admin)
 */
export const getGuidePresignedUrl = async (
  fileName: string
): Promise<GuidePresignedUrlResponse> => {
  const request: GuidePresignedUrlRequest = { fileName };

  const response = await apiClient.post<
    GuideApiResponse<GuidePresignedUrlResponse>
  >("/api/guides/presigned-urls", request, { headers: getAdminHeaders() });
  return response.data.result;
};

/**
 * S3에 파일 직접 업로드 (이미지 또는 XML 파일)
 */
export const uploadGuideToS3 = async (
  presignedUrl: string,
  file: File,
  onProgress?: (progress: GuideUploadProgress) => void
): Promise<void> => {
  console.log("🚀 S3 업로드 시작:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    presignedUrl: presignedUrl.substring(0, 100) + "...",
  });

  try {
    const isImageFile =
      file.type.startsWith("image/") && !file.type.includes("svg");
    const isSvgFile =
      file.type === "image/svg+xml" || file.name.endsWith(".svg");
    const isXmlFile =
      file.type === "application/xml" || file.name.endsWith(".xml");

    let uploadData: string | File;
    let contentType: string;

    if (isXmlFile) {
      // XML 파일의 경우 텍스트로 읽어서 업로드
      console.log("📖 XML 파일 원본 데이터 읽는 중...");
      uploadData = await file.text();
      contentType = "application/xml";
      console.log(
        "📝 XML 내용 미리보기:",
        uploadData.substring(0, 200) + "..."
      );
    } else if (isSvgFile) {
      // SVG 파일의 경우 텍스트로 읽어서 업로드
      console.log("🎨 SVG 파일 원본 데이터 읽는 중...");
      uploadData = await file.text();
      contentType = "image/svg+xml";
      console.log(
        "🎨 SVG 내용 미리보기:",
        uploadData.substring(0, 200) + "..."
      );
    } else if (isImageFile) {
      // 이미지 파일의 경우 바이너리 데이터 그대로 업로드
      console.log("📷 이미지 파일 업로드 중...");
      uploadData = file;
      contentType = file.type;
    } else {
      throw new Error(`지원하지 않는 파일 타입: ${file.type}`);
    }

    // S3에 파일 업로드 (인터셉터에서 자동으로 토큰 제외됨)
    await apiClient.put(presignedUrl, uploadData, {
      headers: {
        "Content-Type": contentType,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress: GuideUploadProgress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            ),
          };
          console.log("📊 업로드 진행률:", progress.percentage + "%");
          onProgress(progress);
        }
      },
    });

    console.log("✅ S3 업로드 성공!");
  } catch (error) {
    console.error("❌ S3 업로드 실패:", error);
    if (error instanceof Error) {
      console.error("에러 상세:", error.message);
    }
    throw error;
  }
};

/**
 * 가이드 정보 등록 (Admin) - S3 업로드 완료 후 호출
 */
export const registerGuide = async (
  guideS3Key: string,
  svgS3Key: string,
  fileName: string,
  imageS3Key: string,
  subCategoryId: number,
  content?: string,
  tags?: string[]
): Promise<GuideRegisterResponse> => {
  const request: GuideRegisterRequest = {
    guideS3Key,
    svgS3Key,
    fileName,
    imageS3Key,
    subCategoryId,
    content,
    tags,
  };

  const response = await apiClient.post<
    GuideApiResponse<GuideRegisterResponse>
  >("/api/guides", request, { headers: getAdminHeaders() });
  return response.data.result;
};

/**
 * 가이드 다중 삭제 (Admin)
 */
export const deleteGuides = async (guideIds: number[]): Promise<void> => {
  const request: GuideDeleteRequest = { guideIds };

  await apiClient.delete<GuideApiResponse<GuideDeleteResponse>>(`/api/guides`, {
    headers: getAdminHeaders(),
    data: request,
  });
};

/**
 * 가이드 파일 쌍 전체 업로드 프로세스 (통합 함수)
 * 1. Presigned URL 생성
 * 2. S3에 이미지와 XML 파일 업로드
 * 3. 서버에 메타데이터 등록
 */
export const uploadGuidePair = async (
  imageFile: File,
  xmlFile: File,
  svgFile: File,
  fileName: string,
  subCategoryId: number,
  content?: string,
  tags?: string[],
  onProgress?: (progress: number) => void
): Promise<Guide> => {
  try {
    // 1. Presigned URL 생성
    const {
      guideUploadUrl,
      guideS3Key,
      imageUploadUrl,
      imageS3Key,
      svgUploadUrl,
      svgS3Key,
    } = await getGuidePresignedUrl(fileName);

    // 2. 이미지 파일 S3에 업로드
    await uploadGuideToS3(imageUploadUrl, imageFile, (progress) => {
      if (onProgress) {
        onProgress(progress.percentage * 0.4); // 40%까지
      }
    });

    // 3. XML 파일 S3에 업로드
    await uploadGuideToS3(guideUploadUrl, xmlFile, (progress) => {
      if (onProgress) {
        onProgress(40 + progress.percentage * 0.4); // 40%~80%
      }
    });

    // 4. SVG 파일 S3에 업로드
    await uploadGuideToS3(svgUploadUrl, svgFile, (progress) => {
      if (onProgress) {
        onProgress(80 + progress.percentage * 0.2); // 80%~100%
      }
    });

    // 5. 서버에 메타데이터 등록
    if (onProgress) {
      onProgress(80); // 80%
    }

    const guide = await registerGuide(
      guideS3Key,
      svgS3Key,
      fileName,
      imageS3Key,
      subCategoryId,
      content,
      tags
    );

    if (onProgress) {
      onProgress(100); // 100%
    }

    return guide;
  } catch (error) {
    console.error("Guide pair upload failed:", error);
    throw error;
  }
};
