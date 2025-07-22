import axios from "axios";

// 기본 axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 어드민 토큰 처리
apiClient.interceptors.request.use(
  (config) => {
    // S3 presigned URL 요청인지 확인 (S3 URL은 토큰이 필요하지 않음)
    const isS3Request = config.url && (
      config.url.includes('.s3.') || 
      config.url.includes('amazonaws.com') ||
      config.url.includes('s3.')
    );

    if (!isS3Request) {
      // 어드민 토큰 확인 (S3 요청이 아닐 때만)
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("admin_auth_token")
          : null;

      if (token) {
        // Bearer 접두사가 이미 있는지 확인
        const bearerToken = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;
        config.headers.Authorization = bearerToken;
      }
    }

    console.log("API 요청:", config.method?.toUpperCase(), config.url, isS3Request ? "(S3)" : "");
    return config;
  },
  (error) => {
    console.error("요청 인터셉터 에러:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 단순화
apiClient.interceptors.response.use(
  (response) => {
    console.log("API 응답 성공:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("API 응답 에러:", error.response?.status, error.config?.url);

    // 401 에러의 경우 토큰이 유효하지 않다는 것을 알림
    if (error.response?.status === 401) {
      console.log("인증 실패 - 토큰을 확인해주세요");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
