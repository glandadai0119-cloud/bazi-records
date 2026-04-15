"use client";

import { useEffect, useState } from "react";
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
  const [shenShaMode, setShenShaMode] = useState<"compact" | "full">("compact");
  const [activeLuckIndex, setActiveLuckIndex] = useState<number | null>(ganZhi.currentDaYun?.index ?? null);
  const [titleVisible, setTitleVisible] = useState(true);
  const getVisibleShenSha = (tags: string[]) => (shenShaMode === "compact" ? tags.slice(0, 3) : tags);
  const activeLuck =
    ganZhi.daYun.find((item) => item.index === activeLuckIndex) ?? ganZhi.currentDaYun ?? ganZhi.daYun[0] ?? null;

  useEffect(() => {
    setActiveLuckIndex(ganZhi.currentDaYun?.index ?? ganZhi.daYun[0]?.index ?? null);
  }, [ganZhi.currentDaYun, ganZhi.daYun]);

  useEffect(() => {
    setTitleVisible(false);
    const timer = window.setTimeout(() => {
      setTitleVisible(true);
    }, 20);
    return () => window.clearTimeout(timer);
  }, [activeLuckIndex]);

  return (
    <div className="space-y-2 rounded-md border border-[#c8ad8f] bg-[#f8f4ef] p-3 text-xs text-slate-700">
      <PatternAnalysis ganZhi={ganZhi} />
      <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
        <p className="text-xs tracking-[0.2em] text-slate-500">性格画像</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{ganZhi.personalityProfile.dayMasterSummary}</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{ganZhi.personalityProfile.patternSummary}</p>
      </div>
      <p className="font-semibold tracking-[0.2em] text-[#6a4729]">大运</p>
      <p>{ganZhi.yunStartDesc}</p>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-500">神煞显示：</span>
        <button
          type="button"
          onClick={() => setShenShaMode("compact")}
          className={`rounded border px-2 py-0.5 text-[11px] transition-colors ${
            shenShaMode === "compact"
              ? "border-[#c8ad8f] bg-[#efe2d2] text-[#6a4729]"
              : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          精简
        </button>
        <button
          type="button"
          onClick={() => setShenShaMode("full")}
          className={`rounded border px-2 py-0.5 text-[11px] transition-colors ${
            shenShaMode === "full"
              ? "border-[#c8ad8f] bg-[#efe2d2] text-[#6a4729]"
              : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          完整
        </button>
      </div>
      {activeLuck ? (
        <p
          className={`text-sm text-slate-800 transition-opacity duration-300 ${
            titleVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          当前大运：{activeLuck.ganZhi}（{activeLuck.startYear}-{activeLuck.endYear}，
          {activeLuck.startAge}-{activeLuck.endAge}岁）
        </p>
      ) : (
        <p>当前日期尚未进入正式大运区间。</p>
      )}
      <div className="grid grid-cols-1 gap-2 pt-1 min-[420px]:grid-cols-2">
        {ganZhi.daYun.map((item) => {
          const isCurrent = activeLuck?.index === item.index;

          return (
            <div
              key={`${item.index}-${item.ganZhi}`}
              onClick={() => setActiveLuckIndex(item.index)}
              className={`min-h-[172px] cursor-pointer rounded-md border px-2 py-2 transition-colors duration-150 touch-manipulation active:scale-[0.99] active:brightness-95 ${
                isCurrent
                  ? "border-2 border-[#b39b7d] bg-[#efe2d2] text-[#5c3d25]"
                  : "border-[#d9c5ad] bg-white/80 text-slate-600"
              }`}
            >
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
              <div className="mt-2 flex flex-wrap gap-1 border-t border-[#d9c5ad] pt-1.5">
                {item.shenSha.length ? (
                  <>
                    {getVisibleShenSha(item.shenSha).map((tag) => (
                      <ShenShaBadge key={`${item.index}-${tag}`} tag={tag} theme="earth" />
                    ))}
                    {shenShaMode === "compact" && item.shenSha.length > 3 ? (
                      <span className="rounded border border-[#c8ad8f] bg-[#f8f4ef] px-1.5 py-0.5 text-[10px] text-[#7a5230]">
                        +{item.shenSha.length - 3}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span className="text-[10px] text-slate-400">无神煞</span>
                )}
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
                className={`min-h-[172px] rounded-md border px-2 py-2 transition duration-150 touch-manipulation active:scale-[0.99] active:brightness-95 ${
                  isCurrent
                    ? "border-blue-300 bg-blue-50 text-blue-900"
                    : "border-slate-200 bg-white/70 text-slate-700"
                }`}
              >
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
                <div className="mt-2 flex flex-wrap gap-1 border-t border-slate-200 pt-1.5">
                  {item.shenSha.length ? (
                    <>
                      {getVisibleShenSha(item.shenSha).map((tag) => (
                        <ShenShaBadge key={`${item.startYear}-${tag}`} tag={tag} theme="slate" />
                      ))}
                      {shenShaMode === "compact" && item.shenSha.length > 3 ? (
                        <span className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] text-slate-600">
                          +{item.shenSha.length - 3}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-400">无神煞</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
