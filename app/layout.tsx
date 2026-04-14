import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "八字记录",
  description: "八字排盘记录与管理"
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
            <h1 className="text-xl font-bold">八字记录网站</h1>
            <nav className="flex gap-4 text-sm font-medium text-slate-700">
              <Link href="/">首页列表</Link>
              <Link href="/add">添加记录</Link>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
