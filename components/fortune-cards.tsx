import type { GanZhiResult } from "@/lib/bazi";
import PatternAnalysis from "@/components/pattern-analysis";
import ShenShaBadge from "@/components/shen-sha-badge";

type FortuneCardsProps = {
  ganZhi: GanZhiResult;
};

function getShiShenTagClass(shiShen: string): string {
  if (shiShen === "正印") return "border-sky-200 bg-sky-50 text-sky-700";
  if (shiShen === "偏印") return "border-sky-200 bg-sky-50 text-sky-600";
  if (shiShen === "比肩") return "border-violet-200 bg-violet-50 text-violet-700";
  if (shiShen === "劫财") return "border-violet-200 bg-violet-50 text-violet-600";
  if (shiShen === "食神") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (shiShen === "伤官") return "border-emerald-200 bg-emerald-50 text-emerald-600";
  if (shiShen === "正财") return "border-lime-200 bg-lime-50 text-lime-700";
  if (shiShen === "偏财") return "border-lime-200 bg-lime-50 text-lime-600";
  if (shiShen === "正官") return "border-zinc-200 bg-zinc-50 text-zinc-800";
  if (shiShen === "七杀") return "border-zinc-200 bg-zinc-50 text-zinc-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function getShiShenShortColorClass(shortName: string): string {
  if (shortName === "财") return "text-lime-700";
  if (shortName === "官") return "text-zinc-700";
  if (shortName === "印") return "text-sky-700";
  if (shortName === "比") return "text-violet-700";
  if (shortName === "劫") return "text-violet-600";
  if (shortName === "食") return "text-emerald-700";
  if (shortName === "伤") return "text-emerald-600";
  return "text-slate-500";
}

export default function FortuneCards({ ganZhi }: FortuneCardsProps) {
  return (
    <div className="space-y-2 rounded-md border border-[#c8ad8f] bg-[#f8f4ef] p-3 text-xs text-slate-700">
      <PatternAnalysis ganZhi={ganZhi} />
      <p className="font-semibold tracking-[0.2em] text-[#6a4729]">大运</p>
      <p>{ganZhi.yunStartDesc}</p>
      {ganZhi.currentDaYun ? (
        <p className="text-sm text-slate-800">
          当前大运：{ganZhi.currentDaYun.ganZhi}（{ganZhi.currentDaYun.startYear}-
          {ganZhi.currentDaYun.endYear}，{ganZhi.currentDaYun.startAge}-{ganZhi.currentDaYun.endAge}
          岁）
        </p>
      ) : (
        <p>当前日期尚未进入正式大运区间。</p>
      )}
      <div className="grid grid-cols-1 gap-2 pt-1 min-[420px]:grid-cols-2">
        {ganZhi.daYun.map((item) => {
          const isCurrent = ganZhi.currentDaYun?.index === item.index;

          return (
            <div
              key={`${item.index}-${item.ganZhi}`}
              className={`relative min-h-[146px] rounded-md border px-2 py-2 transition-colors duration-150 touch-manipulation active:scale-[0.99] active:brightness-95 ${
                isCurrent
                  ? "border-[#9a6c43] bg-[#efe2d2] text-[#5c3d25]"
                  : "border-[#d9c5ad] bg-white/80 text-slate-600"
              }`}
            >
              {!!item.shenSha.length && (
                <div className="absolute right-1 top-1 flex flex-wrap justify-end gap-1">
                  {item.shenSha.slice(0, 2).map((tag) => (
                    <ShenShaBadge key={`${item.index}-${tag}`} tag={tag} theme="earth" />
                  ))}
                </div>
              )}
              <p className="text-sm font-semibold tracking-[0.08em]">
                {item.index}. {item.ganZhi}
              </p>
              <p className="mt-1 text-xs">
                {item.startYear}-{item.endYear}年
              </p>
              <p className="text-xs">{item.startAge}-{item.endAge}岁</p>
              <p className="mt-1 flex items-center gap-1 text-[11px]">
                <span className="text-slate-500">主气十神:</span>
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getShiShenTagClass(
                    item.stemShiShen
                  )}`}
                >
                  {item.stemShiShen || "--"}
                </span>
              </p>
              <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                藏干短象:
                {item.hideGanShiShenShort.map((shortName, shortIndex) => (
                  <span
                    key={`${item.ganZhi}-${shortName}-${shortIndex}`}
                    className={getShiShenShortColorClass(shortName)}
                  >
                    {shortName}
                  </span>
                ))}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
                {item.hideGanShiShen.map((entry, entryIndex) => (
                  <span key={`${item.ganZhi}-${entry.hideGan}-${entryIndex}`}>
                    <span className="mr-1 text-slate-500">{entry.hideGan}</span>
                    <span
                      className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${getShiShenTagClass(
                        entry.shiShen
                      )}`}
                    >
                      {entry.shiShen}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-2 border-t border-[#d9c5ad] pt-2">
        <p className="font-semibold tracking-[0.2em] text-[#6a4729]">流年</p>
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 md:grid-cols-3">
          {ganZhi.liuNian.map((item) => {
            const isCurrent = item.ganZhi === ganZhi.currentLiuNian;
            return (
              <div
                key={`liunian-${item.startYear}-${item.ganZhi}`}
                className={`relative min-h-[146px] rounded-md border px-2 py-2 transition duration-150 touch-manipulation active:scale-[0.99] active:brightness-95 ${
                  isCurrent
                    ? "border-blue-300 bg-blue-50 text-blue-900"
                    : "border-slate-200 bg-white/70 text-slate-700"
                }`}
              >
                {!!item.shenSha.length && (
                  <div className="absolute right-1 top-1 flex flex-wrap justify-end gap-1">
                    {item.shenSha.slice(0, 2).map((tag) => (
                      <ShenShaBadge key={`${item.startYear}-${tag}`} tag={tag} theme="slate" />
                    ))}
                  </div>
                )}
                <p className="text-sm font-semibold">
                  {item.startYear} · {item.ganZhi}
                </p>
                <p className="text-xs">{item.startAge}岁</p>
                <p className="mt-1 flex items-center gap-1 text-[11px]">
                  <span className="text-slate-500">主气十神:</span>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getShiShenTagClass(
                      item.stemShiShen
                    )}`}
                  >
                    {item.stemShiShen || "--"}
                  </span>
                </p>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                  藏干短象:
                  {item.hideGanShiShenShort.map((shortName, shortIndex) => (
                    <span
                      key={`${item.ganZhi}-${shortName}-${shortIndex}`}
                      className={getShiShenShortColorClass(shortName)}
                    >
                      {shortName}
                    </span>
                  ))}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
                  {item.hideGanShiShen.map((entry, entryIndex) => (
                    <span key={`${item.ganZhi}-${entry.hideGan}-${entryIndex}`}>
                      <span className="mr-1 text-slate-500">{entry.hideGan}</span>
                      <span
                        className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${getShiShenTagClass(
                          entry.shiShen
                        )}`}
                      >
                        {entry.shiShen}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
