"use client";

import { useState, useEffect, useCallback } from "react";
import svg2vectordrawable from "svg2vectordrawable";
import {
  getGuides,
  deleteGuides,
  uploadGuidePair,
  getSubCategories,
  updateGuide,
  getSubCategory,
  updateSubCategoryTips,
} from "@/app/services/apis/guide";
import {
  Guide,
  SubCategory,
} from "@/app/services/types/guide";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

// SVG-이미지 나란히 보기 컴포넌트
const SvgImagePreview = ({
  guide,
  className,
}: {
  guide: Guide;
  className?: string;
}) => {
  const [svgError, setSvgError] = useState(false);
  const [svgLoading, setSvgLoading] = useState(true);

  const handleSvgLoad = () => {
    console.log("SVG object 로드 성공");
    setSvgLoading(false);
  };

  const handleSvgError = () => {
    console.log("SVG object 로드 실패");
    setSvgError(true);
    setSvgLoading(false);
  };

  return (
    <div className="w-full h-full flex space-x-2">
      {/* SVG 미리보기 */}
      <div className="flex-1 relative overflow-hidden border rounded">
        <div className="absolute top-1 left-1 z-10 text-xs bg-black bg-opacity-50 text-white px-1 rounded">
          SVG
        </div>
        {!svgError ? (
          <>
            <img
              src={`https://cdn.chalpu.com/${guide.svgS3Key}`}
              alt={`SVG preview of ${guide.fileName}`}
              onLoad={handleSvgLoad}
              onError={handleSvgError}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                svgLoading ? "opacity-0" : "opacity-100"
              }`}
            />
            {svgLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xs text-gray-500">SVG 로딩 중...</div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs text-red-500">SVG 로드 실패</div>
          </div>
        )}
      </div>

      {/* 이미지 미리보기 */}
      <div className="flex-1 relative overflow-hidden border rounded">
        <div className="absolute top-1 left-1 z-10 text-xs bg-black bg-opacity-50 text-white px-1 rounded">
          IMG
        </div>
        <Image
          src={`https://cdn.chalpu.com/${guide.imageS3Key}`}
          alt={guide.fileName}
          fill
          className={`${className} object-contain`}
        />
      </div>
    </div>
  );
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  // 토큰 관리 상태
  const [authToken, setAuthToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [tokenStatus, setTokenStatus] = useState<"none" | "valid" | "invalid">(
    "none"
  );

  // 뷰 모드 상태 (그리드/리스트)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 선택된 가이드 관리
  const [selectedGuides, setSelectedGuides] = useState<number[]>([]);

  // 일괄삭제 모달 관리
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [batchDeleteIds, setBatchDeleteIds] = useState<string>("");

  // 카테고리 수정 모달 관리
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    subCategoryId: 0,
    content: "",
    fileName: "",
  });

  // 정렬 상태
  const [sortBy, setSortBy] = useState<"id" | "name" | "category">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // 카테고리 필터링 상태
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [selectedSubCategoryFilter, setSelectedSubCategoryFilter] = useState<string>("all");

  // 파일 트리플 업로드 관련 상태 (SVG, XML, 이미지)
  interface FileUploadTriple {
    id: string;
    svgFile: File | null; // SVG 파일 (UI 미리보기용)
    xmlFile: File | null; // XML 파일 (안드로이드용, SVG에서 자동 변환)
    imageFile: File | null; // 이미지 파일
    fileName: string;
    uploading: boolean;
    progress: number;
    error: string | null;
    completed: boolean;
    nameMatchError: boolean;
    category: number; // 선택된 서브카테고리 ID
    content?: string; // 가이드 설명
    tags: string[]; // 태그 목록
    tagInput: string; // 태그 입력 필드
    isComposing: boolean; // 한글 입력 상태 관리
  }

  const [uploadTriples, setUploadTriples] = useState<FileUploadTriple[]>([
    {
      id: "triple-1",
      svgFile: null,
      xmlFile: null,
      imageFile: null,
      fileName: "",
      uploading: false,
      progress: 0,
      error: null,
      completed: false,
      nameMatchError: false,
      category: 1, // 기본값으로 첫 번째 서브카테고리 ID 설정
      content: "",
      tags: [],
      tagInput: "",
      isComposing: false,
    },
  ]);

  // 일괄등록 관련 상태
  const [batchSvgFiles, setBatchSvgFiles] = useState<File[]>([]);
  const [batchImageFiles, setBatchImageFiles] = useState<File[]>([]);
  const [batchMatchedPairs, setBatchMatchedPairs] = useState<
    Array<{
      baseName: string;
      svgFile: File;
      imageFile: File;
    }>
  >([]);
  const [batchUnmatchedFiles, setBatchUnmatchedFiles] = useState<File[]>([]);

  // 일괄등록 진행 상황 상태
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [batchUploadProgress, setBatchUploadProgress] = useState(0);
  const [currentBatchUploadIndex, setCurrentBatchUploadIndex] = useState(0);

  // 팁 편집 모달 관리
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [tipsContent, setTipsContent] = useState("");
  
  // 팁 관리용 선택된 카테고리
  const [selectedTipsCategory, setSelectedTipsCategory] = useState<string>("all");

  // 서브카테고리 목록 로드
  const loadSubCategories = useCallback(async () => {
    if (!authToken) return;

    try {
      const response = await getSubCategories();
      setSubCategories(response.result);
      
      // 서브카테고리 로드 후 업로드 트리플의 기본 카테고리 설정
      if (response.result.length > 0) {
        setUploadTriples((prev) =>
          prev.map((triple) => ({
            ...triple,
            category: triple.category === 1 ? response.result[0].id : triple.category,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load sub-categories:", error);
      toast.error("서브카테고리 목록을 불러오는데 실패했습니다.");
    }
  }, [authToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // 클라이언트에서만 렌더링하도록 설정
  useEffect(() => {
    setMounted(true);

    // 로컬 스토리지에서 저장된 토큰 불러오기
    const savedToken = localStorage.getItem("admin_auth_token");
    if (savedToken) {
      setAuthToken(savedToken);
      setTokenInput(savedToken);
      setTokenStatus("valid");
    }
  }, []);

  // 토큰 저장 함수
  const saveToken = () => {
    if (!tokenInput.trim()) {
      toast.error("토큰을 입력해주세요.");
      return;
    }

    try {
      localStorage.setItem("admin_auth_token", tokenInput.trim());
      setAuthToken(tokenInput.trim());
      setTokenStatus("valid");
      toast.success("토큰이 저장되었습니다.");

      // 토큰 저장 후 가이드 목록과 서브카테고리 목록 다시 로드
      loadGuides();
      loadSubCategories();
    } catch (error) {
      console.error("Failed to save token:", error);
      toast.error("토큰 저장에 실패했습니다.");
    }
  };

  // 토큰 제거 함수
  const removeToken = () => {
    localStorage.removeItem("admin_auth_token");
    setAuthToken("");
    setTokenInput("");
    setTokenStatus("none");
    setGuides([]);
    toast.success("토큰이 제거되었습니다.");
  };

  // SVG 파일 일괄 선택 처리
  const handleBatchSvgSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      const svgFiles = files.filter((file) =>
        /^image_\d+\.svg$/i.test(file.name)
      );
      setBatchSvgFiles(svgFiles);
    },
    []
  );

  // 이미지 파일 일괄 선택 처리
  const handleBatchImageSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      const imageFiles = files.filter((file) =>
        /^image_\d+\.(png|jpg|jpeg)$/i.test(file.name)
      );
      setBatchImageFiles(imageFiles);
    },
    []
  );

  // 일괄등록 매칭 업데이트
  const updateBatchMatching = useCallback(() => {
    const matchedPairs: Array<{
      baseName: string;
      svgFile: File;
      imageFile: File;
    }> = [];
    const unmatchedFiles: File[] = [];

    // SVG 파일들을 기준으로 매칭 (image_00x 패턴)
    batchSvgFiles.forEach((svgFile) => {
      const baseName = svgFile.name.replace(/\.svg$/i, "");
      const matchingImage = batchImageFiles.find(
        (imgFile) => imgFile.name.replace(/\.(png|jpg|jpeg)$/i, "") === baseName
      );

      if (matchingImage) {
        matchedPairs.push({
          baseName,
          svgFile,
          imageFile: matchingImage,
        });
      } else {
        unmatchedFiles.push(svgFile);
      }
    });

    // 매칭되지 않은 이미지 파일들 추가
    batchImageFiles.forEach((imgFile) => {
      const baseName = imgFile.name.replace(/\.(png|jpg|jpeg)$/i, "");
      const hasMatchingSvg = batchSvgFiles.some(
        (svgFile) => svgFile.name.replace(/\.svg$/i, "") === baseName
      );

      if (!hasMatchingSvg) {
        unmatchedFiles.push(imgFile);
      }
    });

    setBatchMatchedPairs(matchedPairs);
    setBatchUnmatchedFiles(unmatchedFiles);
  }, [batchSvgFiles, batchImageFiles]);

  // SVG를 안드로이드 Vector Drawable XML로 변환하는 함수
  const convertSvgToAndroidXml = useCallback(
    async (svgFile: File): Promise<File> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const svgContent = e.target?.result as string;
            const xmlContent = await svg2vectordrawable(svgContent);

            // 새로운 XML 파일명 생성
            const originalName = svgFile.name.replace(/\.svg$/i, "");
            const xmlFileName = `${originalName}.xml`;

            // Blob을 File로 변환
            const blob = new Blob([xmlContent], { type: "application/xml" });
            const xmlFile = new File([blob], xmlFileName, {
              type: "application/xml",
              lastModified: Date.now(),
            });

            resolve(xmlFile);
          } catch (error) {
            console.error("SVG 파싱 오류:", error);
            reject(
              new Error(
                "SVG를 안드로이드 Vector Drawable로 변환 중 오류가 발생했습니다."
              )
            );
          }
        };

        reader.onerror = () => {
          reject(new Error("파일 읽기 중 오류가 발생했습니다."));
        };

        reader.readAsText(svgFile);
      });
    },
    []
  );

  // 가이드 목록 로드
  const loadGuides = useCallback(async () => {
    if (!authToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getGuides({ page: 0, size: 1000 });
      setGuides(response.content);
      setSelectedGuides([]); // 가이드 목록이 변경될 때 선택 상태 초기화
      setSelectedCategoryFilter("all"); // 카테고리 필터도 초기화
      setSelectedSubCategoryFilter("all"); // 서브 카테고리 필터도 초기화
      setTokenStatus("valid");
    } catch (error) {
      console.error("Failed to load guides:", error);
      setTokenStatus("invalid");
      toast.error(
        "가이드 목록을 불러오는데 실패했습니다. 토큰을 확인해주세요."
      );
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  // 일괄등록 처리
  const processBatchFiles = useCallback(async () => {
    if (batchMatchedPairs.length === 0) {
      toast.error("매칭된 파일 쌍이 없습니다.");
      return;
    }

    try {
      setIsBatchUploading(true);
      setBatchUploadProgress(0);
      setCurrentBatchUploadIndex(0);

      let successCount = 0;
      let errorCount = 0;

      // 각 파일 쌍을 순차적으로 업로드
      for (let i = 0; i < batchMatchedPairs.length; i++) {
        const pair = batchMatchedPairs[i];
        setCurrentBatchUploadIndex(i + 1);

        try {
          // SVG에서 XML 변환
          const xmlFile = await convertSvgToAndroidXml(pair.svgFile);

          // 랜덤 서브카테고리 선택
          const randomCategory = subCategories.length > 0 
            ? subCategories[Math.floor(Math.random() * subCategories.length)].id
            : 1;

          // 서버에 직접 업로드
          await uploadGuidePair(
            pair.imageFile,
            xmlFile,
            pair.svgFile,
            pair.baseName,
            randomCategory,
            `일괄등록된 ${pair.baseName} 가이드`,
            [`일괄등록`, `자동생성`],
            (progress) => {
              const totalProgress =
                ((i + progress / 100) / batchMatchedPairs.length) * 100;
              setBatchUploadProgress(Math.round(totalProgress));
            }
          );

          successCount++;
          toast.success(`${pair.baseName} 업로드 완료!`);
        } catch (error) {
          errorCount++;
          console.error(`${pair.baseName} 업로드 실패:`, error);
          toast.error(
            `${pair.baseName} 업로드 실패: ${
              error instanceof Error ? error.message : "알 수 없는 오류"
            }`
          );
        }
      }

      // 업로드 완료 후 상태 초기화
      setIsBatchUploading(false);
      setBatchUploadProgress(0);
      setCurrentBatchUploadIndex(0);

      // 일괄등록 상태 초기화
      setBatchSvgFiles([]);
      setBatchImageFiles([]);
      setBatchMatchedPairs([]);
      setBatchUnmatchedFiles([]);

      // 파일 input 초기화
      const svgInput = document.getElementById(
        "batch-svg-upload"
      ) as HTMLInputElement;
      const imageInput = document.getElementById(
        "batch-image-upload"
      ) as HTMLInputElement;
      if (svgInput) svgInput.value = "";
      if (imageInput) imageInput.value = "";

      // 최종 결과 표시
      if (successCount > 0) {
        toast.success(
          `일괄등록 완료! 성공: ${successCount}개, 실패: ${errorCount}개`
        );
        // 가이드 목록 새로고침
        loadGuides();
      } else {
        toast.error("모든 파일 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("일괄등록 처리 중 오류:", error);
      toast.error("일괄등록 처리 중 오류가 발생했습니다.");
    }
  }, [batchMatchedPairs, convertSvgToAndroidXml, loadGuides]);

  // 토큰 테스트 함수
  const testToken = async () => {
    if (!authToken) {
      toast.error("저장된 토큰이 없습니다.");
      return;
    }

    try {
      // 간단한 API 호출로 토큰 유효성 테스트
      await getGuides({ page: 0, size: 1 });
      setTokenStatus("valid");
      toast.success("토큰이 유효합니다.");
    } catch {
      setTokenStatus("invalid");
      toast.error("토큰이 유효하지 않습니다.");
    }
  };

  useEffect(() => {
    if (mounted && authToken) {
      loadGuides();
      loadSubCategories();
    }
  }, [mounted, authToken, loadGuides, loadSubCategories]);

  // 일괄등록 파일 상태 변경 시 매칭 업데이트
  useEffect(() => {
    updateBatchMatching();
  }, [updateBatchMatching]);

  // 새 파일 트리플 추가
  const addNewTriple = () => {
    const newTriple: FileUploadTriple = {
      id: `triple-${Date.now()}`,
      svgFile: null,
      xmlFile: null,
      imageFile: null,
      fileName: "",
      uploading: false,
      progress: 0,
      error: null,
      completed: false,
      nameMatchError: false,
      category: subCategories.length > 0 ? subCategories[0].id : 1,
      content: "",
      tags: [],
      tagInput: "",
      isComposing: false,
    };
    setUploadTriples((prev) => [...prev, newTriple]);
  };

  // 파일 트리플 제거
  const removeTriple = (id: string) => {
    setUploadTriples((prev) => prev.filter((triple) => triple.id !== id));
  };

  // 파일명 매칭 검증 함수 (3개 파일)
  const validateTripleFileNameMatch = (
    svgFile: File | null,
    imageFile: File | null
  ) => {
    if (!svgFile || !imageFile) return { isValid: true, fileName: "" };

    const svgName = svgFile.name.replace(/\.svg$/i, "");
    const imageName = imageFile.name.replace(/\.(png|jpg|jpeg)$/i, "");

    return {
      isValid: svgName === imageName,
      fileName: svgName === imageName ? svgName : "",
    };
  };

  // SVG 파일 선택 (XML은 자동 생성)
  const handleSvgSelect = async (tripleId: string, file: File) => {
    try {
      // SVG에서 XML 자동 생성
      const xmlFile = await convertSvgToAndroidXml(file);

      setUploadTriples((prev) =>
        prev.map((triple) => {
          if (triple.id === tripleId) {
            const validation = validateTripleFileNameMatch(
              file,
              triple.imageFile
            );
            return {
              ...triple,
              svgFile: file,
              xmlFile: xmlFile,
              fileName: validation.fileName,
              nameMatchError: !validation.isValid,
            };
          }
          return triple;
        })
      );

      toast.success(`${file.name}을 선택하고 XML을 자동 생성했습니다.`);
    } catch (error) {
      console.error("SVG 처리 중 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "SVG 처리 중 오류가 발생했습니다."
      );
    }
  };

  // 이미지 파일 선택
  const handleImageSelect = (tripleId: string, file: File) => {
    setUploadTriples((prev) =>
      prev.map((triple) => {
        if (triple.id === tripleId) {
          const validation = validateTripleFileNameMatch(triple.svgFile, file);
          return {
            ...triple,
            imageFile: file,
            fileName: validation.fileName,
            nameMatchError: !validation.isValid,
          };
        }
        return triple;
      })
    );
  };

  // SVG 파일 제거 (XML도 함께 제거)
  const removeSvgFile = (tripleId: string) => {
    setUploadTriples((prev) =>
      prev.map((triple) => {
        if (triple.id === tripleId) {
          // 이미지 파일이 있으면 이미지 파일명으로, 없으면 빈 문자열
          const fileName = triple.imageFile
            ? triple.imageFile.name.replace(/\.(png|jpg|jpeg)$/i, "")
            : "";
          return {
            ...triple,
            svgFile: null,
            xmlFile: null, // SVG가 제거되면 XML도 함께 제거
            fileName,
            nameMatchError: false,
          };
        }
        return triple;
      })
    );
    // 파일 input 초기화
    const input = document.getElementById(
      `svg-${tripleId}`
    ) as HTMLInputElement;
    if (input) input.value = "";
  };

  // 이미지 파일 제거
  const removeImageFile = (tripleId: string) => {
    setUploadTriples((prev) =>
      prev.map((triple) => {
        if (triple.id === tripleId) {
          // SVG 파일이 있으면 SVG 파일명으로, 없으면 빈 문자열
          const fileName = triple.svgFile
            ? triple.svgFile.name.replace(/\.svg$/i, "")
            : "";
          return {
            ...triple,
            imageFile: null,
            fileName,
            nameMatchError: false,
          };
        }
        return triple;
      })
    );
    // 파일 input 초기화
    const input = document.getElementById(
      `image-${tripleId}`
    ) as HTMLInputElement;
    if (input) input.value = "";
  };

  // 개별 파일 트리플 업로드
  const uploadTriple = async (triple: FileUploadTriple) => {
    if (!triple.imageFile || !triple.xmlFile || !triple.svgFile || !authToken)
      return;

    setUploadTriples((prev) =>
      prev.map((t) =>
        t.id === triple.id
          ? { ...t, uploading: true, progress: 0, error: null }
          : t
      )
    );

    try {
      await uploadGuidePair(
        triple.imageFile,
        triple.xmlFile!,
        triple.svgFile!,
        triple.fileName,
        triple.category,
        triple.content,
        triple.tags,
        (progress) => {
          setUploadTriples((prev) =>
            prev.map((t) => (t.id === triple.id ? { ...t, progress } : t))
          );
        }
      );

      setUploadTriples((prev) =>
        prev.map((t) =>
          t.id === triple.id
            ? { ...t, progress: 100, completed: true, uploading: false }
            : t
        )
      );

      // 개별 업로드 완료 후 가이드 목록 새로고침
      toast.success(`${triple.fileName} 업로드 완료`);
      loadGuides();
    } catch (error) {
      console.error("업로드 실패:", error);
      setUploadTriples((prev) =>
        prev.map((t) =>
          t.id === triple.id
            ? {
                ...t,
                uploading: false,
                error: error instanceof Error ? error.message : "업로드 실패",
              }
            : t
        )
      );
      toast.error(`${triple.fileName} 업로드 실패`);
    }
    window.location.reload();
  };

  // 전체 업로드
  const uploadAll = async () => {
    const validTriples = uploadTriples.filter(
      (triple) =>
        triple.imageFile &&
        triple.xmlFile &&
        triple.svgFile &&
        !triple.completed &&
        !triple.nameMatchError
    );

    let successCount = 0;
    for (const triple of validTriples) {
      try {
        await uploadTriple(triple);
        successCount++;
      } catch (error) {
        console.error(`Failed to upload triple ${triple.fileName}:`, error);
      }
    }

    // 업로드 완료 후 가이드 목록 새로고침 (성공한 업로드가 있을 때만)
    if (successCount > 0) {
      toast.success(
        `${successCount}개의 파일 트리플이 성공적으로 업로드되었습니다.`
      );
      loadGuides();
    }
    window.location.reload();
  };

  // 단일 가이드 삭제 처리
  const handleDeleteGuide = async (guide: Guide) => {
    if (!authToken) {
      toast.error("먼저 인증 토큰을 설정해주세요.");
      return;
    }

    if (!confirm(`${guide.fileName}을(를) 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteGuides([guide.guideId]);
      setGuides((prev) => prev.filter((g) => g.guideId !== guide.guideId));
      setSelectedGuides((prev) => prev.filter((id) => id !== guide.guideId));
      toast.success("가이드가 삭제되었습니다.");
    } catch (error) {
      console.error("Failed to delete guide:", error);
      toast.error("가이드 삭제에 실패했습니다.");
    }
  };

  // 선택된 가이드들 다중 삭제
  const handleDeleteSelectedGuides = async () => {
    if (!authToken) {
      toast.error("먼저 인증 토큰을 설정해주세요.");
      return;
    }

    if (selectedGuides.length === 0) {
      toast.error("삭제할 가이드를 선택해주세요.");
      return;
    }

    if (
      !confirm(`선택된 ${selectedGuides.length}개의 가이드를 삭제하시겠습니까?`)
    ) {
      return;
    }

    try {
      await deleteGuides(selectedGuides);
      setGuides((prev) =>
        prev.filter((g) => !selectedGuides.includes(g.guideId))
      );
      setSelectedGuides([]);
      toast.success(`${selectedGuides.length}개의 가이드가 삭제되었습니다.`);
    } catch (error) {
      console.error("Failed to delete guides:", error);
      toast.error("가이드 삭제에 실패했습니다.");
    }
  };

  // 가이드 선택/해제
  const handleSelectGuide = (guideId: number, checked: boolean) => {
    if (checked) {
      setSelectedGuides((prev) => [...prev, guideId]);
    } else {
      setSelectedGuides((prev) => prev.filter((id) => id !== guideId));
    }
  };


  // ID 목록으로 일괄삭제
  const handleBatchDeleteByIds = async () => {
    if (!authToken) {
      toast.error("먼저 인증 토큰을 설정해주세요.");
      return;
    }

    if (!batchDeleteIds.trim()) {
      toast.error("삭제할 가이드 ID를 입력해주세요.");
      return;
    }

    try {
      // 쉼표로 구분된 ID들을 파싱
      const idsArray = batchDeleteIds
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id) && id > 0);

      if (idsArray.length === 0) {
        toast.error("유효한 가이드 ID를 입력해주세요.");
        return;
      }

      // 존재하지 않는 ID 확인
      const existingIds = guides.map((g) => g.guideId);
      const invalidIds = idsArray.filter((id) => !existingIds.includes(id));

      if (invalidIds.length > 0) {
        toast.error(`존재하지 않는 ID: ${invalidIds.join(", ")}`);
        return;
      }

      if (
        !confirm(
          `입력된 ${
            idsArray.length
          }개의 가이드를 삭제하시겠습니까?\nID: ${idsArray.join(", ")}`
        )
      ) {
        return;
      }

      await deleteGuides(idsArray);
      setGuides((prev) => prev.filter((g) => !idsArray.includes(g.guideId)));
      setSelectedGuides((prev) => prev.filter((id) => !idsArray.includes(id)));
      setBatchDeleteIds("");
      setShowBatchDeleteModal(false);
      toast.success(`${idsArray.length}개의 가이드가 삭제되었습니다.`);
    } catch (error) {
      console.error("Failed to delete guides by IDs:", error);
      toast.error("가이드 삭제에 실패했습니다.");
    }
  };

  // 전체 가이드 삭제
  const handleDeleteAllGuides = async () => {
    if (!authToken) {
      toast.error("먼저 인증 토큰을 설정해주세요.");
      return;
    }

    if (guides.length === 0) {
      toast.error("삭제할 가이드가 없습니다.");
      return;
    }

    if (
      !confirm(
        `정말로 모든 가이드 ${guides.length}개를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    try {
      const allIds = guides.map((g) => g.guideId);
      await deleteGuides(allIds);
      setGuides([]);
      setSelectedGuides([]);
      toast.success(`모든 가이드 ${allIds.length}개가 삭제되었습니다.`);
    } catch (error) {
      console.error("Failed to delete all guides:", error);
      toast.error("전체 가이드 삭제에 실패했습니다.");
    }
  };

  // 카테고리별 삭제
  const handleDeleteByCategory = async (categoryName: string) => {
    if (!authToken) {
      toast.error("먼저 인증 토큰을 설정해주세요.");
      return;
    }

    const categoryGuides = guides.filter(
      (g) => g.categoryName === categoryName
    );

    if (categoryGuides.length === 0) {
      toast.error(`'${categoryName}' 카테고리에 삭제할 가이드가 없습니다.`);
      return;
    }

    if (
      !confirm(
        `'${categoryName}' 카테고리의 가이드 ${categoryGuides.length}개를 모두 삭제하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      const categoryIds = categoryGuides.map((g) => g.guideId);
      await deleteGuides(categoryIds);
      setGuides((prev) => prev.filter((g) => !categoryIds.includes(g.guideId)));
      setSelectedGuides((prev) =>
        prev.filter((id) => !categoryIds.includes(id))
      );
      toast.success(
        `'${categoryName}' 카테고리의 가이드 ${categoryIds.length}개가 삭제되었습니다.`
      );
    } catch (error) {
      console.error("Failed to delete guides by category:", error);
      toast.error("카테고리별 가이드 삭제에 실패했습니다.");
    }
  };


  // 선택된 가이드 ID 복사
  const copySelectedIds = async () => {
    if (selectedGuides.length === 0) {
      toast.error("선택된 가이드가 없습니다.");
      return;
    }

    try {
      const idsText = selectedGuides.join(", ");
      await navigator.clipboard.writeText(idsText);
      toast.success(`선택된 가이드 ID가 복사되었습니다: ${idsText}`);
    } catch {
      toast.error("클립보드 복사에 실패했습니다.");
    }
  };

  // 가이드 필터링 및 정렬 함수
  const filteredAndSortedGuides = [...guides]
    .filter((guide) => {
      // 메인 카테고리 필터링
      const mainCategoryMatch = selectedCategoryFilter === "all" || guide.categoryName === selectedCategoryFilter;
      
      // 서브 카테고리 필터링
      const subCategoryMatch = selectedSubCategoryFilter === "all" || guide.subCategoryName === selectedSubCategoryFilter;
      
      return mainCategoryMatch && subCategoryMatch;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "id":
          comparison = a.guideId - b.guideId;
          break;
        case "name":
          comparison = a.fileName.localeCompare(b.fileName);
          break;
        case "category":
          comparison =
            a.categoryName.localeCompare(b.categoryName) ||
            a.subCategoryName.localeCompare(b.subCategoryName) ||
            a.fileName.localeCompare(b.fileName);
          break;
        default:
          return 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  // 정렬 변경 핸들러
  const handleSortChange = (newSortBy: "id" | "name" | "category") => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  // 토큰 상태에 따른 색상
  const getTokenStatusColor = () => {
    switch (tokenStatus) {
      case "valid":
        return "text-green-600";
      case "invalid":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const getTokenStatusText = () => {
    switch (tokenStatus) {
      case "valid":
        return "✅ 유효한 토큰";
      case "invalid":
        return "❌ 유효하지 않은 토큰";
      default:
        return "⚠️ 토큰 없음";
    }
  };

  // 카테고리 수정 모달 열기
  const openEditModal = (guide: Guide) => {
    setEditingGuide(guide);
    setEditForm({
      subCategoryId: subCategories.find(sc => 
        sc.categoryName === guide.categoryName && sc.name === guide.subCategoryName
      )?.id || 0,
      content: guide.content || "",
      fileName: guide.fileName,
    });
    setShowEditModal(true);
  };

  // 가이드 정보 수정 처리
  const handleUpdateGuide = async () => {
    if (!editingGuide || !authToken) {
      toast.error("수정할 가이드 정보가 없습니다.");
      return;
    }

    try {
      const updateData: { content?: string; subCategoryId?: number; fileName?: string } = {};
      
      if (editForm.subCategoryId !== 0) {
        updateData.subCategoryId = editForm.subCategoryId;
      }
      
      if (editForm.content !== editingGuide.content) {
        updateData.content = editForm.content;
      }
      
      if (editForm.fileName !== editingGuide.fileName) {
        updateData.fileName = editForm.fileName;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("변경된 내용이 없습니다.");
        setShowEditModal(false);
        return;
      }

      await updateGuide(editingGuide.guideId, updateData);
      
      // 가이드 목록 새로고침
      await loadGuides();
      
      setShowEditModal(false);
      setEditingGuide(null);
      toast.success("가이드 정보가 수정되었습니다.");
    } catch (error) {
      console.error("Failed to update guide:", error);
      toast.error("가이드 수정에 실패했습니다.");
    }
  };

  // 팁 편집 모달 열기
  const handleEditTips = async (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    try {
      const details = await getSubCategory(subCategory.id);
      setTipsContent(details.tips || "");
      setShowTipsModal(true);
    } catch (error) {
      console.error("Failed to load subcategory details:", error);
      toast.error("서브카테고리 정보를 불러오는데 실패했습니다.");
      setTipsContent(subCategory.tips || "");
      setShowTipsModal(true);
    }
  };

  // 팁 저장 처리
  const handleSaveTips = async () => {
    if (!editingSubCategory) {
      toast.error("편집할 카테고리 정보가 없습니다.");
      return;
    }

    try {
      await updateSubCategoryTips(editingSubCategory.id, tipsContent);
      
      // 서브카테고리 목록 업데이트
      setSubCategories(prev =>
        prev.map(cat =>
          cat.id === editingSubCategory.id
            ? { ...cat, tips: tipsContent }
            : cat
        )
      );
      
      toast.success("팁이 성공적으로 저장되었습니다.");
      setShowTipsModal(false);
      setEditingSubCategory(null);
      setTipsContent("");
    } catch (error) {
      console.error("Failed to update tips:", error);
      toast.error("팁 저장에 실패했습니다.");
    }
  };

  // 팁 편집 모달 닫기
  const handleCloseTipsModal = () => {
    setShowTipsModal(false);
    setEditingSubCategory(null);
    setTipsContent("");
  };

  // 가이드 목록에서 XML 다운로드 함수
  const handleGuideXmlDownload = async (guide: Guide) => {
    try {
      const xmlUrl = `https://cdn.chalpu.com/${guide.guideS3Key}`;

      // XML 파일 내용을 가져옵니다 (이미 서버에서 변환된 XML)
      const response = await fetch(xmlUrl);
      if (!response.ok) {
        throw new Error(`XML 파일을 가져올 수 없습니다: ${response.status}`);
      }

      const xmlContent = await response.text();

      // 파일명 설정 (확장자를 .xml로 보장)
      const fileName = guide.fileName.endsWith(".xml")
        ? guide.fileName
        : guide.fileName.replace(/\.[^.]+$/, ".xml");

      // Blob을 생성하고 다운로드합니다
      const blob = new Blob([xmlContent], { type: "application/xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${fileName} 파일이 다운로드되었습니다.`);
    } catch (error) {
      console.error("XML 다운로드 실패:", error);
      toast.error("XML 파일 다운로드에 실패했습니다.");
    }
  };

  // 클라이언트에서만 렌더링 (하이드레이션 에러 방지)
  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">가이드 관리</h1>
          <p className="text-gray-600">
            XML 가이드 파일을 업로드하고 관리하세요.
          </p>
        </div>

        {/* 토큰 설정 영역 */}
        <Card className="mb-8 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔐 인증 토큰 설정
              <span className={`text-sm font-normal ${getTokenStatusColor()}`}>
                {getTokenStatusText()}
              </span>
            </CardTitle>
            <CardDescription>
              API 요청을 위한 인증 토큰을 설정하세요. 토큰은 브라우저에 안전하게
              저장됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="token-input">Bearer Token</Label>
                  <Input
                    id="token-input"
                    type="password"
                    placeholder="Bearer 토큰을 입력하세요..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <Button onClick={saveToken} className="mb-0">
                  저장
                </Button>
                {authToken && (
                  <>
                    <Button onClick={testToken} variant="outline">
                      테스트
                    </Button>
                    <Button onClick={removeToken} variant="destructive">
                      제거
                    </Button>
                  </>
                )}
              </div>

              {authToken && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    현재 토큰:{" "}
                    <code className="bg-white px-1 rounded text-xs">
                      {authToken.substring(0, 20)}...
                    </code>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 토큰이 없을 때 경고 메시지 */}
        {!authToken && (
          <Card className="mb-8 border-l-4 border-l-yellow-500 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">⚠️</span>
                <p className="text-yellow-800">
                  API를 사용하려면 먼저 인증 토큰을 설정해주세요.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 일괄등록 영역 */}
        <Card
          className={`mb-8 ${
            !authToken ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <CardHeader>
            <CardTitle>일괄등록</CardTitle>
            <CardDescription>
              여러 개의 PNG/SVG 파일을 한번에 선택하여 자동으로 매칭하고 등록할
              수 있습니다. 파일명은 &quot;image_001.svg&quot;와
              &quot;image_001.png&quot; 형태여야 하며, 동일한 번호의 파일들이
              자동으로 쌍으로 매칭됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label
                    htmlFor="batch-svg-upload"
                    className="text-sm font-medium"
                  >
                    SVG 파일 선택 (여러 개 선택 가능)
                  </Label>
                  <input
                    id="batch-svg-upload"
                    type="file"
                    multiple
                    accept=".svg,image/svg+xml"
                    onChange={handleBatchSvgSelect}
                    className="w-full p-2 border rounded-md text-sm"
                    disabled={!authToken}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="batch-image-upload"
                    className="text-sm font-medium"
                  >
                    이미지 파일 선택 (여러 개 선택 가능)
                  </Label>
                  <input
                    id="batch-image-upload"
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                    onChange={handleBatchImageSelect}
                    className="w-full p-2 border rounded-md text-sm"
                    disabled={!authToken}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={processBatchFiles}
                  disabled={
                    !authToken ||
                    (batchSvgFiles.length === 0 &&
                      batchImageFiles.length === 0) ||
                    isBatchUploading
                  }
                  className="px-8"
                >
                  {isBatchUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      업로드 중... ({currentBatchUploadIndex}/
                      {batchMatchedPairs.length})
                    </div>
                  ) : (
                    "일괄등록 처리"
                  )}
                </Button>
              </div>

              {isBatchUploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>전체 진행률</span>
                    <span>{batchUploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${batchUploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {(batchSvgFiles.length > 0 || batchImageFiles.length > 0) && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">
                    선택된 파일 (SVG: {batchSvgFiles.length}개, 이미지:{" "}
                    {batchImageFiles.length}개)
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-purple-600 mb-1">
                        SVG 파일 ({batchSvgFiles.length}개)
                      </h5>
                      <div className="space-y-1">
                        {batchSvgFiles.map((file, index) => (
                          <div key={index} className="text-purple-700">
                            ✓ {file.name}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-600 mb-1">
                        이미지 파일 ({batchImageFiles.length}개)
                      </h5>
                      <div className="space-y-1">
                        {batchImageFiles.map((file, index) => (
                          <div key={index} className="text-blue-700">
                            ✓ {file.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {batchMatchedPairs.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 rounded-md">
                      <h5 className="font-medium text-green-800 mb-2">
                        매칭된 쌍 ({batchMatchedPairs.length}개)
                      </h5>
                      <div className="space-y-1 text-sm">
                        {batchMatchedPairs.map((pair, index) => (
                          <div key={index} className="text-green-700">
                            ✓ {pair.baseName} (SVG + 이미지)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {batchUnmatchedFiles.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                      <h5 className="font-medium text-yellow-800 mb-2">
                        매칭되지 않은 파일 ({batchUnmatchedFiles.length}개)
                      </h5>
                      <div className="space-y-1 text-sm">
                        {batchUnmatchedFiles.map((file, index) => (
                          <div key={index} className="text-yellow-700">
                            ⚠ {file.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 파일 업로드 영역 */}
        <Card
          className={`mb-8 ${
            !authToken ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <CardHeader>
            <CardTitle>파일 업로드</CardTitle>
            <CardDescription>
              이미지(PNG/JPG)와 XML/SVG 파일을 쌍으로 업로드하세요. SVG 파일은
              자동으로 XML로 변환됩니다. 파일 이름은 동일해야 하며, 카테고리와
              설명, 태그를 추가로 설정할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {uploadTriples.map((triple, index) => (
                <div
                  key={triple.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">
                      파일 트리플 {index + 1}
                      {triple.fileName && (
                        <span className="ml-2 text-sm text-gray-600">
                          ({triple.fileName})
                        </span>
                      )}
                    </h3>
                    {uploadTriples.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTriple(triple.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        제거
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* SVG 파일 선택 */}
                    <div className="space-y-2">
                      <Label
                        htmlFor={`svg-${triple.id}`}
                        className="text-sm font-medium"
                      >
                        SVG 파일 (UI용)
                      </Label>
                      <div className="relative">
                        <input
                          id={`svg-${triple.id}`}
                          type="file"
                          accept=".svg,image/svg+xml"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSvgSelect(triple.id, file);
                          }}
                          className="w-full p-2 border rounded-md text-sm"
                          disabled={triple.uploading || triple.completed}
                        />
                        {triple.svgFile && (
                          <div className="mt-2 p-2 bg-purple-50 rounded text-sm flex items-center justify-between">
                            <span className="text-purple-700">
                              ✓ {triple.svgFile.name}
                            </span>
                            <button
                              onClick={() => removeSvgFile(triple.id)}
                              disabled={triple.uploading || triple.completed}
                              className="text-red-500 hover:text-red-700 ml-2 disabled:opacity-50"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* XML 파일 상태 (자동 생성) */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        XML 파일 (자동 변환)
                      </Label>
                      <div className="relative">
                        <div className="w-full p-2 border border-dashed rounded-md text-sm bg-gray-100 text-gray-500">
                          SVG에서 자동 생성됨
                        </div>
                        {triple.xmlFile && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-green-700">
                                ✓ {triple.xmlFile.name}
                                <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                  자동 생성됨
                                </span>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 이미지 파일 선택 */}
                    <div className="space-y-2">
                      <Label
                        htmlFor={`image-${triple.id}`}
                        className="text-sm font-medium"
                      >
                        이미지 파일 (PNG/JPG)
                      </Label>
                      <div className="relative">
                        <input
                          id={`image-${triple.id}`}
                          type="file"
                          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageSelect(triple.id, file);
                          }}
                          className="w-full p-2 border rounded-md text-sm"
                          disabled={triple.uploading || triple.completed}
                        />
                        {triple.imageFile && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm flex items-center justify-between">
                            <span className="text-blue-700">
                              ✓ {triple.imageFile.name}
                            </span>
                            <button
                              onClick={() => removeImageFile(triple.id)}
                              disabled={triple.uploading || triple.completed}
                              className="text-red-500 hover:text-red-700 ml-2 disabled:opacity-50"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 카테고리 및 추가 정보 입력 */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 카테고리 선택 */}
                    <div className="space-y-2">
                      <Label
                        htmlFor={`category-${triple.id}`}
                        className="text-sm font-medium"
                      >
                        카테고리 *
                      </Label>
                      <select
                        id={`category-${triple.id}`}
                        value={triple.category}
                        onChange={(e) => {
                          const selectedCategory = Number(e.target.value);
                          setUploadTriples((prev) =>
                            prev.map((t) =>
                              t.id === triple.id
                                ? { ...t, category: selectedCategory }
                                : t
                            )
                          );
                        }}
                        disabled={triple.uploading || triple.completed || subCategories.length === 0}
                        className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {subCategories.length === 0 ? (
                          <option disabled>서브카테고리 로딩 중...</option>
                        ) : (
                          subCategories.map((subCategory) => (
                            <option key={subCategory.id} value={subCategory.id}>
                              {subCategory.categoryName} - {subCategory.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* 설명 입력 */}
                    <div className="space-y-2">
                      <Label
                        htmlFor={`content-${triple.id}`}
                        className="text-sm font-medium"
                      >
                        설명 (선택사항)
                      </Label>
                      <Input
                        id={`content-${triple.id}`}
                        type="text"
                        placeholder="가이드에 대한 설명을 입력하세요..."
                        value={triple.content || ""}
                        onChange={(e) => {
                          setUploadTriples((prev) =>
                            prev.map((t) =>
                              t.id === triple.id
                                ? { ...t, content: e.target.value }
                                : t
                            )
                          );
                        }}
                        disabled={triple.uploading || triple.completed}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* 태그 입력 */}
                  <div className="mt-4 space-y-2">
                    <Label
                      htmlFor={`tags-${triple.id}`}
                      className="text-sm font-medium"
                    >
                      태그 (선택사항)
                    </Label>
                    <Input
                      id={`tags-${triple.id}`}
                      type="text"
                      placeholder="태그를 입력하고 Enter나 쉼표를 누르세요 (예: 맛있는)"
                      value={triple.tagInput}
                      onChange={(e) => {
                        setUploadTriples((prev) =>
                          prev.map((t) =>
                            t.id === triple.id
                              ? { ...t, tagInput: e.target.value }
                              : t
                          )
                        );
                      }}
                      onCompositionStart={() => {
                        setUploadTriples((prev) =>
                          prev.map((t) =>
                            t.id === triple.id ? { ...t, isComposing: true } : t
                          )
                        );
                      }}
                      onCompositionEnd={() => {
                        setUploadTriples((prev) =>
                          prev.map((t) =>
                            t.id === triple.id
                              ? { ...t, isComposing: false }
                              : t
                          )
                        );
                      }}
                      onKeyDown={(e) => {
                        // composition 중이면 태그 추가하지 않음
                        if (triple.isComposing) return;

                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          const newTag = triple.tagInput.trim();
                          if (newTag && !triple.tags.includes(newTag)) {
                            setUploadTriples((prev) =>
                              prev.map((t) =>
                                t.id === triple.id
                                  ? {
                                      ...t,
                                      tags: [...t.tags, newTag],
                                      tagInput: "",
                                    }
                                  : t
                              )
                            );
                          } else if (newTag) {
                            // 이미 존재하는 태그인 경우 입력 필드만 초기화
                            setUploadTriples((prev) =>
                              prev.map((t) =>
                                t.id === triple.id ? { ...t, tagInput: "" } : t
                              )
                            );
                          }
                        } else if (
                          e.key === "Backspace" &&
                          triple.tagInput === "" &&
                          triple.tags.length > 0
                        ) {
                          // 입력 필드가 비어있고 백스페이스를 누르면 마지막 태그 삭제
                          setUploadTriples((prev) =>
                            prev.map((t) =>
                              t.id === triple.id
                                ? {
                                    ...t,
                                    tags: t.tags.slice(0, -1),
                                  }
                                : t
                            )
                          );
                        }
                      }}
                      onBlur={() => {
                        // 포커스를 잃을 때도 태그 추가 (composition 중이 아닐 때만)
                        if (!triple.isComposing) {
                          const newTag = triple.tagInput.trim();
                          if (newTag && !triple.tags.includes(newTag)) {
                            setUploadTriples((prev) =>
                              prev.map((t) =>
                                t.id === triple.id
                                  ? {
                                      ...t,
                                      tags: [...t.tags, newTag],
                                      tagInput: "",
                                    }
                                  : t
                              )
                            );
                          }
                        }
                      }}
                      disabled={triple.uploading || triple.completed}
                      className="text-sm"
                    />

                    {/* 태그 표시 */}
                    {triple.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {triple.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {tag}
                            <button
                              onClick={() => {
                                setUploadTriples((prev) =>
                                  prev.map((t) =>
                                    t.id === triple.id
                                      ? {
                                          ...t,
                                          tags: t.tags.filter(
                                            (_, i) => i !== tagIndex
                                          ),
                                        }
                                      : t
                                  )
                                );
                              }}
                              disabled={triple.uploading || triple.completed}
                              className="ml-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 태그 입력 도움말 */}
                    <div className="text-xs text-gray-500">
                      • Enter 키나 쉼표로 태그 추가 • 백스페이스로 마지막 태그
                      삭제 • 중복 태그는 자동으로 제거됩니다
                    </div>
                  </div>

                  {/* 파일명 불일치 에러 메시지 */}
                  {triple.nameMatchError && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-md">
                      <div className="flex items-center text-orange-700">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        파일명이 일치하지 않습니다. SVG와 이미지 파일의
                        이름(확장자 제외)이 동일해야 합니다.
                      </div>
                    </div>
                  )}

                  {/* 업로드 상태 */}
                  {triple.uploading && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          업로드 중...
                        </span>
                        <span className="text-sm text-gray-600">
                          {triple.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${triple.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 완료 상태 */}
                  {triple.completed && (
                    <div className="mt-4 p-3 bg-green-50 rounded-md">
                      <div className="flex items-center text-green-700">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        업로드 완료
                      </div>
                    </div>
                  )}

                  {/* 에러 상태 */}
                  {triple.error && (
                    <div className="mt-4 p-3 bg-red-50 rounded-md">
                      <div className="flex items-center text-red-700">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {triple.error}
                      </div>
                    </div>
                  )}

                  {/* 개별 업로드 버튼 */}
                  {triple.imageFile &&
                    triple.xmlFile &&
                    triple.svgFile &&
                    !triple.completed && (
                      <div className="mt-4">
                        <Button
                          onClick={() => uploadTriple(triple)}
                          disabled={triple.uploading || triple.nameMatchError}
                          className="w-full"
                        >
                          {triple.uploading
                            ? "업로드 중..."
                            : triple.nameMatchError
                            ? "파일명 불일치"
                            : "이 트리플 업로드"}
                        </Button>
                      </div>
                    )}
                </div>
              ))}

              {/* 컨트롤 버튼들 */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={addNewTriple}
                  disabled={!authToken}
                >
                  + 파일 트리플 추가
                </Button>

                <Button
                  onClick={uploadAll}
                  disabled={
                    !authToken ||
                    uploadTriples.some((t) => t.uploading) ||
                    !uploadTriples.some(
                      (t) =>
                        t.imageFile &&
                        t.xmlFile &&
                        t.svgFile &&
                        !t.completed &&
                        !t.nameMatchError
                    )
                  }
                  className="px-6"
                >
                  전체 업로드
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 가이드 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>가이드 목록</CardTitle>
                <CardDescription>
                  업로드된 가이드를 확인하고 관리하세요.
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                {/* 정렬 옵션 */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">정렬:</span>
                  <div className="flex space-x-1">
                    <Button
                      variant={sortBy === "id" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSortChange("id")}
                      className="text-xs"
                    >
                      ID {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                    </Button>
                    <Button
                      variant={sortBy === "name" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSortChange("name")}
                      className="text-xs"
                    >
                      이름{" "}
                      {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </Button>
                    <Button
                      variant={sortBy === "category" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSortChange("category")}
                      className="text-xs"
                    >
                      카테고리{" "}
                      {sortBy === "category" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </Button>
                  </div>
                </div>

                {/* 뷰 모드 */}
                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                    그리드
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    리스트
                  </Button>
                </div>
              </div>
            </div>
            {authToken && guides.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                {/* 선택 기반 삭제 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={
                          selectedGuides.length === filteredAndSortedGuides.length &&
                          filteredAndSortedGuides.length > 0 &&
                          filteredAndSortedGuides.every(guide => selectedGuides.includes(guide.guideId))
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // 현재 필터링된 가이드들만 선택
                            const newSelectedGuides = [...new Set([...selectedGuides, ...filteredAndSortedGuides.map(g => g.guideId)])];
                            setSelectedGuides(newSelectedGuides);
                          } else {
                            // 현재 필터링된 가이드들만 선택 해제
                            const filteredIds = filteredAndSortedGuides.map(g => g.guideId);
                            setSelectedGuides(prev => prev.filter(id => !filteredIds.includes(id)));
                          }
                        }}
                      />
                      <Label htmlFor="select-all" className="text-sm">
                        전체 선택 ({selectedGuides.filter(id => filteredAndSortedGuides.some(g => g.guideId === id)).length}/{filteredAndSortedGuides.length})
                      </Label>
                    </div>

                    {/* 빠른 선택 버튼들 */}
                    <div className="flex items-center gap-2">
                      {selectedGuides.length > 0 && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedGuides([])}
                          >
                            선택 해제
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copySelectedIds}
                          >
                            ID 복사
                          </Button>
                        </>
                      )}

                      {/* 메인 카테고리 필터 */}
                      {(() => {
                        const categories = [
                          ...new Set(guides.map((g) => g.categoryName)),
                        ];
                        return (
                          categories.length > 1 && (
                            <div className="flex items-center gap-2">
                              <select
                                className="p-1 text-xs border rounded bg-white"
                                value={selectedCategoryFilter}
                                onChange={(e) => {
                                  setSelectedCategoryFilter(e.target.value);
                                  setSelectedSubCategoryFilter("all"); // 메인 카테고리 변경 시 서브 카테고리 초기화
                                }}
                              >
                                <option value="all">
                                  전체 메인 ({guides.length}개)
                                </option>
                                {categories.map((category) => {
                                  const count = guides.filter(
                                    (g) => g.categoryName === category
                                  ).length;
                                  return (
                                    <option key={category} value={category}>
                                      {category} ({count}개)
                                    </option>
                                  );
                                })}
                              </select>

                              {/* 서브 카테고리 필터 */}
                              <select
                                className="p-1 text-xs border rounded bg-white"
                                value={selectedSubCategoryFilter}
                                onChange={(e) => {
                                  setSelectedSubCategoryFilter(e.target.value);
                                }}
                              >
                                <option value="all">
                                  전체 서브 ({(() => {
                                    const filtered = selectedCategoryFilter === "all" 
                                      ? guides 
                                      : guides.filter(g => g.categoryName === selectedCategoryFilter);
                                    return filtered.length;
                                  })()}개)
                                </option>
                                {(() => {
                                  const availableGuides = selectedCategoryFilter === "all" 
                                    ? guides 
                                    : guides.filter(g => g.categoryName === selectedCategoryFilter);
                                  
                                  const subCategories = [
                                    ...new Set(availableGuides.map((g) => g.subCategoryName)),
                                  ];

                                  return subCategories.map((subCategory) => {
                                    const count = availableGuides.filter(
                                      (g) => g.subCategoryName === subCategory
                                    ).length;
                                    return (
                                      <option key={subCategory} value={subCategory}>
                                        {subCategory} ({count}개)
                                      </option>
                                    );
                                  });
                                })()}
                              </select>
                            </div>
                          )
                        );
                      })()}
                    </div>
                  </div>
                  {selectedGuides.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelectedGuides}
                    >
                      선택된 {selectedGuides.length}개 삭제
                    </Button>
                  )}
                </div>

                {/* 일괄삭제 옵션들 */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* ID 목록으로 삭제 */}
                  <Dialog
                    open={showBatchDeleteModal}
                    onOpenChange={setShowBatchDeleteModal}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        ID로 일괄삭제
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>ID 목록으로 일괄삭제</DialogTitle>
                        <DialogDescription>
                          삭제할 가이드의 ID를 쉼표로 구분하여 입력하세요.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="batch-delete-ids">
                            가이드 ID 목록
                          </Label>
                          <Input
                            id="batch-delete-ids"
                            placeholder="예: 1, 2, 3, 5, 8"
                            value={batchDeleteIds}
                            onChange={(e) => setBatchDeleteIds(e.target.value)}
                          />
                          <div className="flex gap-2 mt-2">
                            {selectedGuides.length > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setBatchDeleteIds(selectedGuides.join(", "))
                                }
                              >
                                선택된 ID 사용 ({selectedGuides.length}개)
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setBatchDeleteIds(
                                  guides.map((g) => g.guideId).join(", ")
                                )
                              }
                            >
                              모든 ID 사용 ({guides.length}개)
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>
                            현재 가이드 ID:{" "}
                            {guides.map((g) => g.guideId).join(", ")}
                          </div>
                          {selectedGuides.length > 0 && (
                            <div className="mt-1">
                              선택된 ID: {selectedGuides.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setBatchDeleteIds("");
                            setShowBatchDeleteModal(false);
                          }}
                        >
                          취소
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleBatchDeleteByIds}
                        >
                          삭제
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* 전체 삭제 */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAllGuides}
                  >
                    전체 삭제 ({guides.length}개)
                  </Button>

                  {/* 카테고리별 삭제 - 드롭다운 메뉴 */}
                  {(() => {
                    const categories = [
                      ...new Set(guides.map((g) => g.categoryName)),
                    ];
                    return (
                      categories.length > 1 && (
                        <div className="relative">
                          <select
                            className="p-2 text-sm border rounded-md bg-white"
                            onChange={(e) => {
                              if (e.target.value) {
                                handleDeleteByCategory(e.target.value);
                                e.target.value = ""; // 선택 초기화
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled>
                              카테고리별 삭제
                            </option>
                            {categories.map((category) => {
                              const count = guides.filter(
                                (g) => g.categoryName === category
                              ).length;
                              return (
                                <option key={category} value={category}>
                                  {category} ({count}개)
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )
                    );
                  })()}
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!authToken ? (
              <div className="text-center py-8 text-gray-500">
                인증 토큰을 설정하면 가이드 목록을 확인할 수 있습니다.
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">로딩 중...</p>
              </div>
            ) : guides.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                업로드된 가이드가 없습니다.
              </div>
            ) : filteredAndSortedGuides.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                선택한 카테고리에 가이드가 없습니다.
              </div>
            ) : (
              <div className="h-[32rem] overflow-auto">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAndSortedGuides.map((guide) => (
                      <div
                        key={guide.guideId}
                        className={`border rounded-lg p-3 transition-all ${
                          selectedGuides.includes(guide.guideId)
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="mb-3">
                          <div className="flex justify-between items-start mb-2">
                            <Checkbox
                              id={`guide-${guide.guideId}`}
                              checked={selectedGuides.includes(guide.guideId)}
                              onCheckedChange={(checked) =>
                                handleSelectGuide(
                                  guide.guideId,
                                  checked as boolean
                                )
                              }
                            />
                          </div>
                          <div className="relative w-full h-24 bg-gray-100 border rounded overflow-hidden">
                            <SvgImagePreview
                              guide={guide}
                              className="object-contain"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-900 truncate text-sm">
                            {guide.fileName}
                          </h3>
                          <div className="text-xs text-gray-500">
                            <p>ID: {guide.guideId}</p>
                            <p>
                              카테고리(메인 - 서브): {guide.categoryName} -{" "}
                              {guide.subCategoryName}
                            </p>
                            {guide.content && <p>설명: {guide.content}</p>}
                            {guide.tags && <p>태그: {guide.tags.join(", ")}</p>}
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(guide)}
                              className="h-7 px-2 text-xs"
                            >
                              수정
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGuideXmlDownload(guide)}
                              className="h-7 px-2 text-xs"
                            >
                              XML
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteGuide(guide)}
                              className="h-7 px-2 text-xs"
                            >
                              삭제
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredAndSortedGuides.map((guide) => (
                      <div
                        key={guide.guideId}
                        className={`border rounded-lg p-3 flex items-center justify-between transition-all ${
                          selectedGuides.includes(guide.guideId)
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`guide-list-${guide.guideId}`}
                            checked={selectedGuides.includes(guide.guideId)}
                            onCheckedChange={(checked) =>
                              handleSelectGuide(
                                guide.guideId,
                                checked as boolean
                              )
                            }
                          />
                          <div className="relative w-32 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                            <SvgImagePreview
                              guide={guide}
                              className="object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate text-sm">
                              {guide.fileName}
                            </h3>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>ID: {guide.guideId}</span>
                              <span>
                                카테고리(메인 - 서브): {guide.categoryName} -{" "}
                                {guide.subCategoryName}
                              </span>
                              {guide.content && (
                                <span>설명: {guide.content}</span>
                              )}
                              {guide.tags && (
                                <span>태그: {guide.tags.join(", ")}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(guide)}
                              className="h-7 px-2 text-xs"
                            >
                              수정
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGuideXmlDownload(guide)}
                              className="h-7 px-2 text-xs"
                            >
                              XML
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteGuide(guide)}
                              className="h-7 px-2 text-xs"
                            >
                              삭제
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 카테고리별 팁 관리 */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>카테고리별 팁 관리</CardTitle>
                <CardDescription>
                  각 카테고리에 대한 팁을 작성하고 관리하세요.
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="tips-category-filter" className="text-sm font-medium">
                  카테고리 선택:
                </Label>
                <select
                  id="tips-category-filter"
                  value={selectedTipsCategory}
                  onChange={(e) => setSelectedTipsCategory(e.target.value)}
                  className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">전체 카테고리</option>
                  {Array.from(new Set(subCategories.map(cat => cat.categoryName))).map(categoryName => (
                    <option key={categoryName} value={categoryName}>
                      {categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!authToken ? (
              <div className="text-center py-8 text-gray-500">
                인증 토큰을 설정하면 팁을 관리할 수 있습니다.
              </div>
            ) : subCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                서브카테고리를 불러오는 중...
              </div>
            ) : (
              <div className="space-y-4">
                {subCategories
                  .filter(subCategory => 
                    selectedTipsCategory === "all" || 
                    subCategory.categoryName === selectedTipsCategory
                  )
                  .map((subCategory) => (
                    <div
                      key={subCategory.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-sm text-blue-600">
                            {subCategory.categoryName}
                          </span>
                          <span className="text-gray-400">&gt;</span>
                          <span className="font-medium">{subCategory.name}</span>
                        </div>
                        {subCategory.tips ? (
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-20 overflow-hidden">
                            <div className="whitespace-pre-wrap overflow-hidden text-ellipsis">
                              {subCategory.tips.length > 100 
                                ? `${subCategory.tips.substring(0, 100)}...`
                                : subCategory.tips
                              }
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">
                            팁이 없습니다. 클릭하여 추가하세요.
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTips(subCategory)}
                        className="ml-4"
                      >
                        {subCategory.tips ? "편집" : "추가"}
                      </Button>
                    </div>
                  ))}
                {subCategories.filter(subCategory => 
                  selectedTipsCategory === "all" || 
                  subCategory.categoryName === selectedTipsCategory
                ).length === 0 && selectedTipsCategory !== "all" && (
                  <div className="text-center py-8 text-gray-500">
                    선택한 카테고리에 서브카테고리가 없습니다.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 가이드 수정 모달 */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>가이드 정보 수정</DialogTitle>
              <DialogDescription>
                가이드의 카테고리, 설명, 파일명을 수정할 수 있습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {editingGuide && (
                <>
                  <div className="text-sm text-gray-600">
                    <p>가이드 ID: {editingGuide.guideId}</p>
                    <p>현재 파일명: {editingGuide.fileName}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">카테고리</Label>
                    <select
                      id="edit-category"
                      value={editForm.subCategoryId}
                      onChange={(e) =>
                        setEditForm(prev => ({
                          ...prev,
                          subCategoryId: Number(e.target.value)
                        }))
                      }
                      className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0}>변경하지 않음</option>
                      {subCategories.map((subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {subCategory.categoryName} - {subCategory.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-content">설명</Label>
                    <Input
                      id="edit-content"
                      type="text"
                      placeholder="가이드에 대한 설명을 입력하세요..."
                      value={editForm.content}
                      onChange={(e) =>
                        setEditForm(prev => ({
                          ...prev,
                          content: e.target.value
                        }))
                      }
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-fileName">파일명</Label>
                    <Input
                      id="edit-fileName"
                      type="text"
                      placeholder="파일명을 입력하세요..."
                      value={editForm.fileName}
                      onChange={(e) =>
                        setEditForm(prev => ({
                          ...prev,
                          fileName: e.target.value
                        }))
                      }
                      className="text-sm"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingGuide(null);
                }}
              >
                취소
              </Button>
              <Button onClick={handleUpdateGuide}>
                수정 완료
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 팁 편집 모달 */}
        <Dialog open={showTipsModal} onOpenChange={(open) => !open && handleCloseTipsModal()}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>팁 편집</DialogTitle>
              <DialogDescription>
                {editingSubCategory && (
                  <>
                    {editingSubCategory.categoryName} &gt; {editingSubCategory.name} 카테고리의 팁을 편집합니다.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tips-editor">팁 내용</Label>
                <Textarea
                  id="tips-editor"
                  value={tipsContent}
                  onChange={(e) => setTipsContent(e.target.value)}
                  placeholder="이 카테고리에 대한 팁을 작성해주세요..."
                  className="min-h-[200px] resize-y"
                />
              </div>
              
              <div className="text-sm text-gray-500">
                <p>• 멀티라인 텍스트를 입력할 수 있습니다.</p>
                <p>• Enter 키를 사용하여 줄바꿈할 수 있습니다.</p>
                <p>• 가이드 보기 섹션에서 카테고리별로 표시됩니다.</p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCloseTipsModal}
              >
                취소
              </Button>
              <Button onClick={handleSaveTips}>
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
