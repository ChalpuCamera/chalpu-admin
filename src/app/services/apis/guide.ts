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
  SubCategoryListResponse,
  SubCategory,
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
  guideS3Key: string | null,
  svgS3Key: string,
  fileName: string,
  imageS3Key: string,
  subCategoryId: number,
  content?: string | null,
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
 * 서브카테고리 목록 조회 (Admin)
 */
export const getSubCategories = async (): Promise<SubCategoryListResponse> => {
  const response = await apiClient.get<SubCategoryListResponse>("/api/sub-categories", {
    headers: getAdminHeaders(),
  });
  
  // 한글 순서로 정렬
  const sortedResult = response.data.result.sort((a, b) => 
    a.name.localeCompare(b.name, 'ko')
  );
  
  return {
    ...response.data,
    result: sortedResult
  };
};

/**
 * 서브카테고리 상세 조회 (Admin)
 */
export const getSubCategory = async (id: number): Promise<SubCategory> => {
  const response = await apiClient.get<GuideApiResponse<SubCategory>>(
    `/api/sub-categories/${id}`,
    { headers: getAdminHeaders() }
  );
  return response.data.result;
};

/**
 * 서브카테고리 팁 수정 (Admin)
 */
export const updateSubCategoryTips = async (
  id: number,
  tips: string
): Promise<SubCategory> => {
  const response = await apiClient.patch<GuideApiResponse<SubCategory>>(
    `/api/sub-categories/${id}`,
    { tips },
    { headers: getAdminHeaders() }
  );
  return response.data.result;
};

/**
 * 가이드 정보 수정 (Admin)
 */
export const updateGuide = async (
  guideId: number,
  data: { content?: string; subCategoryId?: number; fileName?: string }
): Promise<void> => {
  await apiClient.patch(`/api/guides/${guideId}`, data, {
    headers: getAdminHeaders(),
  });
};

/**
 * 가이드 파일 쌍 전체 업로드 프로세스 (통합 함수)
 * 1. Presigned URL 생성
 * 2. S3에 이미지와 SVG 파일 업로드 (XML은 선택적)
 * 3. 서버에 메타데이터 등록
 */
export const uploadGuidePair = async (
  imageFile: File,
  xmlFile: File | null,
  svgFile: File,
  fileName: string,
  subCategoryId: number,
  content?: string | null,
  tags?: string[],
  onProgress?: (progress: number) => void
): Promise<Guide> => {
  try {
    console.log(`📋 업로드 시작: ${fileName}`);
    console.log(`파일 정보:`, {
      imageFile: imageFile.name,
      svgFile: svgFile.name,
      xmlFile: xmlFile?.name || 'null',
      subCategoryId,
      tags: tags?.length || 0
    });
    
    // 1. Presigned URL 생성
    console.log(`🔗 Presigned URL 생성 중: ${fileName}`);
    const {
      guideUploadUrl,
      guideS3Key,
      imageUploadUrl,
      imageS3Key,
      svgUploadUrl,
      svgS3Key,
    } = await getGuidePresignedUrl(fileName);
    
    console.log(`✅ Presigned URL 생성 완료:`, {
      imageS3Key,
      svgS3Key,
      guideS3Key
    });

    // 2. 이미지 파일 S3에 업로드
    console.log(`📷 이미지 파일 업로드 시작: ${imageFile.name}`);
    await uploadGuideToS3(imageUploadUrl, imageFile, (progress) => {
      if (onProgress) {
        onProgress(progress.percentage * 0.5); // XML 없으면 50%까지
      }
    });
    console.log(`✅ 이미지 파일 업로드 완료: ${imageFile.name}`);

    // 3. XML 파일 S3에 업로드 (null이 아닐 때만)
    let finalGuideS3Key: string | null = null;
    if (xmlFile) {
      console.log(`📄 XML 파일 업로드 시작: ${xmlFile.name}`);
      await uploadGuideToS3(guideUploadUrl, xmlFile, (progress) => {
        if (onProgress) {
          onProgress(50 + progress.percentage * 0.25); // 50%~75%
        }
      });
      console.log(`✅ XML 파일 업로드 완료: ${xmlFile.name}`);
      finalGuideS3Key = guideS3Key;
    } else {
      // XML 파일이 없으면 null로 설정
      console.log(`⏭️ XML 파일 업로드 건너뜀 - null로 설정`);
      finalGuideS3Key = null;
      if (onProgress) {
        onProgress(75); // XML 업로드 건너뜀
      }
    }

    // 4. SVG 파일 S3에 업로드
    console.log(`🎨 SVG 파일 업로드 시작: ${svgFile.name}`);
    await uploadGuideToS3(svgUploadUrl, svgFile, (progress) => {
      if (onProgress) {
        onProgress(75 + progress.percentage * 0.25); // 75%~100%
      }
    });
    console.log(`✅ SVG 파일 업로드 완료: ${svgFile.name}`);

    // 5. 서버에 메타데이터 등록
    console.log(`📝 서버에 메타데이터 등록 시작: ${fileName}`);
    if (onProgress) {
      onProgress(80); // 80%
    }

    const guide = await registerGuide(
      finalGuideS3Key,
      svgS3Key,
      fileName,
      imageS3Key,
      subCategoryId,
      content, // null 그대로 전송
      tags
    );
    console.log(`✅ 메타데이터 등록 완료: ${fileName}`);

    if (onProgress) {
      onProgress(100); // 100%
    }

    return guide;
  } catch (error) {
    console.error("Guide pair upload failed:", error);
    throw error;
  }
};
