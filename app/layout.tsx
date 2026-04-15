import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chrono Coord | 精准命理观测系统",
  description: "Chrono Coord 精准命理观测系统"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8">
          <header className="mb-8 flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <h1 className="font-mono text-xl font-bold tracking-wide">Chrono Coord</h1>
            <nav className="flex gap-4 text-sm font-medium text-slate-700">
              <Link href="/">首页列表</Link>
              <Link href="/add">添加记录</Link>
            </nav>
          </header>
          <main>{children}</main>
          <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
            © 2026 Chrono Coord. All Rights Reserved.
          </footer>
        </div>
      </body>
    </html>
  );
}
