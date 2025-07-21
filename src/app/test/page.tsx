"use client";

import { useState } from "react";
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
import svg2vectordrawable from "svg2vectordrawable";

export default function SvgToXmlPage() {
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [xmlContent, setXmlContent] = useState<string>("");
  const [converting, setConverting] = useState(false);
  const [previewSvg, setPreviewSvg] = useState<string>("");

  // SVG를 안드로이드 Vector Drawable XML로 변환하는 함수
  const convertSvgToAndroidXml = async (svgFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const svgContent = e.target?.result as string;
          const result = svg2vectordrawable(svgContent);
          console.log(result);
          resolve(result);
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

  // SVG 파일 선택
  const handleSvgSelect = (file: File) => {
    setSvgFile(file);
    setXmlContent("");

    // SVG 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewSvg(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  // SVG to XML 변환
  const handleConvert = async () => {
    if (!svgFile) {
      toast.error("SVG 파일을 선택해주세요.");
      return;
    }

    setConverting(true);
    try {
      const xmlResult = await convertSvgToAndroidXml(svgFile);
      setXmlContent(xmlResult);
      toast.success("SVG가 성공적으로 XML로 변환되었습니다!");
    } catch (error) {
      console.error("변환 실패:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "SVG 변환 중 오류가 발생했습니다."
      );
    } finally {
      setConverting(false);
    }
  };

  // XML 다운로드
  const handleDownload = () => {
    if (!xmlContent || !svgFile) return;

    const fileName = svgFile.name.replace(/\.svg$/i, ".xml");
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
  };

  // 파일 제거
  const handleRemoveFile = () => {
    setSvgFile(null);
    setXmlContent("");
    setPreviewSvg("");

    // 파일 input 초기화
    const input = document.getElementById("svg-file") as HTMLInputElement;
    if (input) input.value = "";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">SVG to XML Converter</h1>
          <p className="text-gray-600 text-lg">
            SVG 파일을 안드로이드 Vector Drawable XML로 변환하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 파일 업로드 및 변환 */}
          <Card>
            <CardHeader>
              <CardTitle>SVG 파일 업로드</CardTitle>
              <CardDescription>
                변환할 SVG 파일을 선택하고 XML로 변환하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 파일 선택 */}
              <div className="space-y-2">
                <Label htmlFor="svg-file">SVG 파일 선택</Label>
                <Input
                  id="svg-file"
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSvgSelect(file);
                  }}
                  className="cursor-pointer"
                />
              </div>

              {/* 선택된 파일 정보 */}
              {svgFile && (
                <div className="p-3 bg-green-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 text-sm">
                      ✓ {svgFile.name} ({(svgFile.size / 1024).toFixed(1)}KB)
                    </span>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      제거
                    </button>
                  </div>
                </div>
              )}

              {/* SVG 미리보기 */}
              {previewSvg && (
                <div className="space-y-2">
                  <Label>SVG 미리보기</Label>
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                    <div
                      className="w-20 h-20"
                      dangerouslySetInnerHTML={{ __html: previewSvg }}
                    />
                  </div>
                </div>
              )}

              {/* 변환 버튼 */}
              <Button
                onClick={handleConvert}
                disabled={!svgFile || converting}
                className="w-full"
                size="lg"
              >
                {converting ? "변환 중..." : "XML로 변환"}
              </Button>
            </CardContent>
          </Card>

          {/* XML 결과 및 다운로드 */}
          <Card>
            <CardHeader>
              <CardTitle>변환된 XML</CardTitle>
              <CardDescription>
                안드로이드 Vector Drawable XML 결과
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {xmlContent ? (
                <>
                  {/* XML 미리보기 */}
                  <div className="space-y-2">
                    <Label>XML 코드</Label>
                    <textarea
                      value={xmlContent}
                      readOnly
                      className="w-full h-64 p-3 text-xs font-mono border border-gray-300 rounded-md bg-gray-50 resize-none"
                    />
                  </div>

                  {/* 다운로드 버튼 */}
                  <Button onClick={handleDownload} className="w-full" size="lg">
                    XML 파일 다운로드
                  </Button>

                  {/* 파일 정보 */}
                  <div className="text-sm text-gray-600 text-center">
                    파일명: {svgFile?.name.replace(/\.svg$/i, ".xml")}
                  </div>
                </>
              ) : (
                <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 mb-4"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p>SVG 파일을 변환하면 여기에 XML이 표시됩니다</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 사용법 안내 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>사용법</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold">SVG 파일 업로드</h3>
                <p className="text-sm text-gray-600">
                  변환할 SVG 파일을 선택하세요
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold">XML로 변환</h3>
                <p className="text-sm text-gray-600">
                  변환 버튼을 클릭하여 XML 생성
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold">XML 다운로드</h3>
                <p className="text-sm text-gray-600">
                  변환된 XML 파일을 다운로드
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
