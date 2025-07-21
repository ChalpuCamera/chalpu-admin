"use client";

import { useState, useEffect, useCallback } from "react";
import svg2vectordrawable from "svg2vectordrawable";
import {
  getGuides,
  deleteGuides,
  uploadGuidePair,
} from "@/app/services/apis/guide";
import {
  Guide,
  FoodCategory,
  FOOD_CATEGORY_OPTIONS,
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
      <div className="flex-1 relative overflow-hidden border rounded bg-gray-200">
        <div className="absolute top-1 left-1 z-10 text-xs bg-black bg-opacity-50 text-white px-1 rounded">
          SVG
        </div>
        {!svgError ? (
          <>
            <object
              data={`https://cdn.chalpu.com/${guide.svgS3Key}`}
              type="image/svg+xml"
              onLoad={handleSvgLoad}
              onError={handleSvgError}
              className={`w-full h-full transition-opacity duration-300 ${
                svgLoading ? "opacity-0" : "opacity-100"
              }`}
              style={{
                objectFit: "contain",
              }}
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
      <div className="flex-1 relative overflow-hidden border rounded bg-gray-50">
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

  // 정렬 상태
  const [sortBy, setSortBy] = useState<"id" | "name" | "category">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
    category: FoodCategory; // 선택된 카테고리
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
      category: FoodCategory.COFFEE,
      content: "",
      tags: [],
      tagInput: "",
      isComposing: false,
    },
  ]);

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

      // 토큰 저장 후 가이드 목록 다시 로드
      loadGuides();
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

  // 가이드 목록 로드
  const loadGuides = useCallback(async () => {
    if (!authToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getGuides({ page: 0, size: 50 });
      setGuides(response.content);
      setSelectedGuides([]); // 가이드 목록이 변경될 때 선택 상태 초기화
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

  useEffect(() => {
    if (mounted && authToken) {
      loadGuides();
    }
  }, [mounted, authToken, loadGuides]);

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
      category: FoodCategory.COFFEE,
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

  // SVG를 안드로이드 Vector Drawable XML로 변환하는 함수
  const convertSvgToAndroidXml = async (svgFile: File): Promise<File> => {
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

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGuides(guides.map((g) => g.guideId));
    } else {
      setSelectedGuides([]);
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

  // 카테고리별 선택
  const handleSelectByCategory = (categoryName: string) => {
    const categoryIds = guides
      .filter((g) => g.categoryName === categoryName)
      .map((g) => g.guideId);

    setSelectedGuides((prev) => {
      const newSelection = [...prev];
      categoryIds.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
    toast.success(
      `'${categoryName}' 카테고리의 가이드 ${categoryIds.length}개를 선택했습니다.`
    );
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

  // 가이드 정렬 함수
  const sortedGuides = [...guides].sort((a, b) => {
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
                          const selectedCategory = Number(
                            e.target.value
                          ) as FoodCategory;
                          setUploadTriples((prev) =>
                            prev.map((t) =>
                              t.id === triple.id
                                ? { ...t, category: selectedCategory }
                                : t
                            )
                          );
                        }}
                        disabled={triple.uploading || triple.completed}
                        className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {FOOD_CATEGORY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
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
            {authToken && sortedGuides.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                {/* 선택 기반 삭제 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={
                          selectedGuides.length === guides.length &&
                          guides.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                      <Label htmlFor="select-all" className="text-sm">
                        전체 선택 ({selectedGuides.length}/{guides.length})
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

                      {/* 카테고리별 빠른 선택 */}
                      {(() => {
                        const categories = [
                          ...new Set(guides.map((g) => g.categoryName)),
                        ];
                        return (
                          categories.length > 1 && (
                            <div className="relative">
                              <select
                                className="p-1 text-xs border rounded bg-white"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleSelectByCategory(e.target.value);
                                    e.target.value = ""; // 선택 초기화
                                  }
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled>
                                  카테고리 선택
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
            ) : sortedGuides.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                업로드된 가이드가 없습니다.
              </div>
            ) : (
              <div className="h-[32rem] overflow-auto">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedGuides.map((guide) => (
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
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGuideXmlDownload(guide)}
                              className="h-7 px-2 text-xs"
                            >
                              XML 다운로드
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
                    {sortedGuides.map((guide) => (
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
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGuideXmlDownload(guide)}
                              className="h-7 px-2 text-xs"
                            >
                              XML 다운로드
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
      </div>
    </div>
  );
}
