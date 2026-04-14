import type { GanZhiResult } from "@/lib/bazi";

type PatternAnalysisProps = {
  ganZhi: GanZhiResult;
};

function getElementColorClassByChinese(element: string): string {
  if (element === "木") return "text-emerald-700";
  if (element === "火") return "text-rose-700";
  if (element === "土") return "text-[#7a5230]";
  if (element === "金") return "text-[#c79a2b]";
  if (element === "水") return "text-blue-700";
  return "text-slate-700";
}

export default function PatternAnalysis({ ganZhi }: PatternAnalysisProps) {
  return (
    <div className="rounded-md border border-[#d6b794] bg-[#fdf7ef] p-3">
      <p className="text-xs tracking-[0.2em] text-[#8a6544]">格局分析</p>
      <p className="mt-1 text-sm font-semibold text-[#5c3d25]">
        {ganZhi.patternAnalysis.patternName} · 日主{ganZhi.patternAnalysis.dayMasterStrength}
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-700">{ganZhi.patternAnalysis.summary}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="rounded bg-[#efe2d2] px-2 py-0.5 text-[11px] text-[#7a5230]">喜用神</span>
        {ganZhi.patternAnalysis.favorableElements.map((element) => (
          <span
            key={`fav-${element}`}
            className={`rounded border border-[#d9c5ad] bg-white px-2 py-0.5 text-[11px] font-semibold ${getElementColorClassByChinese(
              element
            )}`}
          >
            {element}
          </span>
        ))}
      </div>
    </div>
  );
}
