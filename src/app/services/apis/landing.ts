// 랜딩 페이지 API - SEO 최적화를 위해 fetch 사용
// 인증이 필요하지 않은 단순 API이므로 fetch가 적합

// 선착순 무료 체험 신청 요청 타입 (API 스펙에 맞춤)
interface ContactRequest {
  info: string;
  message: string; // 설문 응답 또는 메시지
}

// 선착순 무료 체험 신청 응답 타입
interface ContactResponse {
  message: string;
}

// 선착순 무료 체험 신청 API
const sendContact = async (data: ContactRequest): Promise<ContactResponse> => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_BASE_URL;

  const response = await fetch(`${baseURL}/landing/inquiry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "문의 전송에 실패했습니다");
  }

  return response.json();
};

export { sendContact };
export type { ContactRequest, ContactResponse };