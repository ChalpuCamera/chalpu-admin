import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
