import { Suspense } from "react";
import ResultClient from "./result-client";

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <section className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow-sm">
          正在加载记录详情...
        </section>
      }
    >
      <ResultClient />
    </Suspense>
  );
}
