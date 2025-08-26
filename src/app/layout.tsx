import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const metadata = {
  title: 'Chalpu Admin',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
      </head>
      <body className="min-h-screen bg-gray-50">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
