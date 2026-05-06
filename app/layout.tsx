import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "상상우리 — 시니어 일자리 매칭",
  description: "시니어와 일자리를 자동으로 연결하는 매칭 시스템",
};

const navLinks = [
  { href: "/register", label: "프로필 등록" },
  { href: "/recommendations", label: "추천 목록" },
  { href: "/admin", label: "담당자 대시보드" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-700 tracking-tight"
            >
              상상우리
            </Link>
            <nav className="flex gap-6">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-lg font-semibold text-gray-700 hover:text-blue-700 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-10">
          {children}
        </main>

        <footer className="border-t border-gray-200 py-6 text-center text-base text-gray-500">
          © 2026 상상우리. 시니어 일자리 매칭 서비스.
        </footer>
      </body>
    </html>
  );
}
