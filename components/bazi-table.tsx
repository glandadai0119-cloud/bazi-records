import { useEffect, useRef, useState } from "react";
import type { GanZhiResult } from "@/lib/bazi";

type WuXing = "wood" | "fire" | "earth" | "metal" | "water";

const STEM_WU_XING_MAP: Record<string, WuXing> = {
  甲: "wood",
  乙: "wood",
  丙: "fire",
  丁: "fire",
  戊: "earth",
  己: "earth",
  庚: "metal",
  辛: "metal",
  壬: "water",
  癸: "water"
};

const BRANCH_WU_XING_MAP: Record<string, WuXing> = {
  寅: "wood",
  卯: "wood",
  巳: "fire",
  午: "fire",
  辰: "earth",
  戌: "earth",
  丑: "earth",
  未: "earth",
  申: "metal",
  酉: "metal",
  亥: "water",
  子: "water"
};

const WU_XING_COLOR_CLASS_MAP: Record<WuXing, string> = {
  wood: "text-emerald-700",
  fire: "text-rose-700",
  earth: "text-[#7a5230]",
  metal: "text-[#c79a2b]",
  water: "text-blue-700"
};

const SHI_SHEN_COLOR_CLASS_MAP: Record<string, string> = {
  正印: "text-sky-700",
  偏印: "text-sky-600",
  比肩: "text-violet-700",
  劫财: "text-violet-600",
  食神: "text-emerald-700",
  伤官: "text-emerald-600",
  正财: "text-lime-700",
  偏财: "text-lime-600",
  正官: "text-zinc-800",
  七杀: "text-zinc-700",
  日主: "text-[#7a5230]"
};

const SHEN_SHA_TOOLTIP_MAP: Record<string, string> = {
  天乙贵人: "主贵人扶助，遇事多得助力。",
  太极贵人: "主悟性与慈慧，利于学艺与修为。",
  禄神: "主俸禄与资源，利于事业稳定。",
  羊刃: "主决断与冲劲，宜刚柔并济。",
  天医: "主调护与康宁，重养生与修复。",
  将星: "主领导与号召，利于掌控局面。",
  华盖: "主才华与孤高，利学术艺术。",
  空亡: "主虚实反复，宜防计划落空。"
};

function getGanZhiParts(pillar: string): { stem: string; branch: string } {
  const [stem = "", branch = ""] = Array.from(pillar);
  return { stem, branch };
}

function getStemColorClass(stem: string): string {
  const wuXing = STEM_WU_XING_MAP[stem];
  return wuXing ? WU_XING_COLOR_CLASS_MAP[wuXing] : "text-slate-700";
}

function getBranchColorClass(branch: string): string {
  const wuXing = BRANCH_WU_XING_MAP[branch];
  return wuXing ? WU_XING_COLOR_CLASS_MAP[wuXing] : "text-slate-700";
}

function getShiShenColorClass(shiShen: string): string {
  return SHI_SHEN_COLOR_CLASS_MAP[shiShen] ?? "text-slate-600";
}

type BaziTableProps = {
  ganZhi: GanZhiResult;
  activeDaYun?: GanZhiResult["daYun"][number] | null;
};

export default function BaziTable({ ganZhi, activeDaYun }: BaziTableProps) {
  const effectiveDaYun = activeDaYun ?? ganZhi.currentDaYun ?? null;
  const hasHourPillar = ganZhi.time.trim().length >= 2 && ganZhi.time !== "--";
  const pillarColumns = [
    { label: "流年", value: ganZhi.currentLiuNian },
    { label: "大运", value: effectiveDaYun?.ganZhi ?? "--" },
    { label: "年柱", value: ganZhi.year },
    { label: "月柱", value: ganZhi.month },
    { label: "日柱", value: ganZhi.day },
    ...(hasHourPillar ? [{ label: "时柱", value: ganZhi.time }] : [])
  ] as Array<{ label: string; value: string }>;
  const desktopGridRef = useRef<HTMLDivElement | null>(null);
  const [columnWidth, setColumnWidth] = useState(0);
  const isNarrowColumn = columnWidth > 0 && columnWidth < 60;
  const labelTextClass = isNarrowColumn ? "text-[10px]" : "text-[11px]";
  const metaTextClass = isNarrowColumn ? "text-[10px]" : "text-[11px]";
  const pillarTextClass = isNarrowColumn ? "text-[24px]" : "text-[28px]";
  const shenShaMaxRows = isNarrowColumn ? 1 : 2;
  const alignCenterClass = "text-center";

  useEffect(() => {
    if (!desktopGridRef.current || typeof window === "undefined" || typeof ResizeObserver === "undefined") {
      return;
    }
    const element = desktopGridRef.current;
    const updateColumnWidth = () => {
      const baseLabelWidth = 52;
      const next = Math.max(0, (element.clientWidth - baseLabelWidth) / pillarColumns.length);
      setColumnWidth(next);
    };
    updateColumnWidth();
    const observer = new ResizeObserver(() => {
      updateColumnWidth();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [pillarColumns.length]);

  const getColumnShenSha = (label: string): string[] => {
    if (label === "流年") return ganZhi.currentLiuNianDetail?.shenSha ?? [];
    if (label === "大运") return effectiveDaYun?.shenSha ?? [];
    if (label === "年柱") return ganZhi.pillarShenSha.year;
    if (label === "月柱") return ganZhi.pillarShenSha.month;
    if (label === "日柱") return ganZhi.pillarShenSha.day;
    if (label === "时柱") return ganZhi.pillarShenSha.time;
    return [];
  };

  const shenShaDisplayMap = (() => {
    const entries = pillarColumns.map((column) => {
      const tags = getColumnShenSha(column.label);
      const compactTags = tags.slice(0, isNarrowColumn ? 2 : 4);
      const rows = compactTags.reduce<string[][]>((acc, tag, tagIndex) => {
        const rowIndex = Math.floor(tagIndex / 2);
        if (!acc[rowIndex]) {
          acc[rowIndex] = [];
        }
        acc[rowIndex].push(tag);
        return acc;
      }, []);
      return [column.label, { tags, rows }] as const;
    });
    return new Map(entries);
  })();

  return (
    <>
      <div className="px-2 pb-1 sm:hidden">
        <div className="space-y-1.5">
          {[pillarColumns.slice(0, 3), pillarColumns.slice(3, 6)].map((group, groupIndex) => (
            <div key={`mobile-group-${groupIndex}`} className="grid grid-cols-3 gap-1.5">
              {group.map((column) => {
                const { stem, branch } = getGanZhiParts(column.value);
                const shenShaTags = getColumnShenSha(column.label);
                const shenShaText = shenShaTags.slice(0, 4).join(" ");
                return (
                  <div
                    key={`mobile-${column.label}`}
                    className="rounded-md border border-zinc-200 bg-zinc-50 p-1.5 text-center"
                  >
                    <p className="text-[10px] text-zinc-500">{column.label}</p>
                    <div className="mt-0.5 flex h-8 items-center justify-center overflow-hidden">
                      <p className={`text-[24px] font-semibold leading-[1] ${getStemColorClass(stem)}`}>
                        {stem || "--"}
                      </p>
                    </div>
                    <div className="mt-0.5 flex h-8 items-center justify-center overflow-hidden">
                      <p className={`text-[24px] font-semibold leading-[1] ${getBranchColorClass(branch)}`}>
                        {branch || "--"}
                      </p>
                    </div>
                    {!!shenShaTags.length && (
                      <p className="mt-0.5 line-clamp-2 text-[10px] text-zinc-600">{shenShaText}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="hidden overflow-hidden px-2 pb-1 sm:block">
        <div
          ref={desktopGridRef}
          className="grid w-full overflow-hidden border border-zinc-200"
          style={{ gridTemplateColumns: `52px repeat(${pillarColumns.length}, 1fr)` }}
        >
          <div className={`border-b border-r border-zinc-200 bg-zinc-100 py-1 text-[10px] text-zinc-500 ${alignCenterClass}`}>
            项目
          </div>
          {pillarColumns.map((column) => (
            <div
              key={column.label}
              className={`border-b border-r border-zinc-200 bg-zinc-100 py-1 text-zinc-600 last:border-r-0 ${labelTextClass} ${alignCenterClass}`}
            >
              {column.label}
            </div>
          ))}
          <div className={`border-b border-r border-zinc-200 bg-zinc-50 py-1 text-zinc-500 ${metaTextClass} ${alignCenterClass}`}>天干</div>
          {pillarColumns.map((column, index) => {
            const { stem } = getGanZhiParts(column.value);
            return (
              <div
                key={`stem-${column.value}-${index}`}
                className={`flex h-12 items-center justify-center overflow-hidden border-b border-r border-zinc-200 px-0.5 py-0.5 font-semibold leading-[1] last:border-r-0 ${pillarTextClass}`}
              >
                <span className={`${getStemColorClass(stem)} inline-block leading-[1]`}>{stem || "--"}</span>
              </div>
            );
          })}
          <div className={`border-b border-r border-zinc-200 bg-zinc-50 py-1 text-zinc-500 ${metaTextClass} ${alignCenterClass}`}>地支</div>
          {pillarColumns.map((column, index) => {
            const { branch } = getGanZhiParts(column.value);
            return (
              <div
                key={`branch-${column.value}-${index}`}
                className={`flex h-12 items-center justify-center overflow-hidden border-b border-r border-zinc-200 px-0.5 py-0.5 font-semibold leading-[1] last:border-r-0 ${pillarTextClass}`}
              >
                <span className={`${getBranchColorClass(branch)} inline-block leading-[1]`}>{branch || "--"}</span>
              </div>
            );
          })}
          <div className={`border-b border-r border-zinc-200 bg-zinc-50 py-1 text-zinc-500 ${metaTextClass} ${alignCenterClass}`}>十神</div>
          {[
            ganZhi.currentLiuNianDetail
              ? {
                  gan: ganZhi.currentLiuNianDetail.stemShiShen,
                  zhiList: ganZhi.currentLiuNianDetail.hideGanShiShen.map((entry) => entry.shiShen)
                }
              : null,
            effectiveDaYun
              ? {
                  gan: effectiveDaYun?.stemShiShen ?? "",
                  zhiList: effectiveDaYun?.hideGanShiShen.map((entry) => entry.shiShen) ?? []
                }
              : null,
            { gan: ganZhi.yearShiShenGan, zhiList: ganZhi.yearShiShenZhi },
            { gan: ganZhi.monthShiShenGan, zhiList: ganZhi.monthShiShenZhi },
            { gan: ganZhi.dayShiShenGan, zhiList: ganZhi.dayShiShenZhi },
            ...(hasHourPillar ? [{ gan: ganZhi.timeShiShenGan, zhiList: ganZhi.timeShiShenZhi }] : [])
          ].map((value, index) => (
            <div
              key={`shishen-${index}`}
              className={`border-b border-r border-zinc-200 px-0.5 py-1 last:border-r-0 ${metaTextClass} ${alignCenterClass}`}
            >
              {value ? (
                <div className="space-y-0.5">
                  <span className={`font-semibold ${getShiShenColorClass(value.gan)}`}>
                    {value.gan}
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-0.5 text-zinc-600">
                    {value.zhiList.map((item, itemIndex) => (
                      <span key={`${item}-${itemIndex}`} className={getShiShenColorClass(item)}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <span className="text-zinc-400">--</span>
              )}
            </div>
          ))}
          <div className={`border-b border-r border-zinc-200 bg-zinc-50 py-1 text-zinc-500 ${metaTextClass} ${alignCenterClass}`}>藏干</div>
          {[
            ganZhi.currentLiuNianDetail?.hideGanShiShen.map((entry) => entry.hideGan).join(" ") ?? "--",
            effectiveDaYun?.hideGanShiShen.map((entry) => entry.hideGan).join(" ") ?? "--",
            ganZhi.yearHideGan,
            ganZhi.monthHideGan,
            ganZhi.dayHideGan,
            ...(hasHourPillar ? [ganZhi.timeHideGan] : [])
          ].map(
            (value, index) => (
              <div
                key={`hidegan-${index}`}
                className={`border-b border-r border-zinc-200 px-0.5 py-1 text-zinc-600 last:border-r-0 ${metaTextClass} ${alignCenterClass} whitespace-nowrap`}
              >
                {Array.isArray(value) ? value.join(" ") : value}
              </div>
            )
          )}
          <div className={`border-b border-r border-zinc-200 bg-zinc-50 py-1 text-zinc-500 ${metaTextClass} ${alignCenterClass}`}>神煞</div>
          {pillarColumns.map((column, index) => {
            const value = shenShaDisplayMap.get(column.label);
            const rows = value?.rows ?? [];
            const tags = value?.tags ?? [];
            return (
              <div
                key={`pillar-shensha-${index}`}
                className={`border-b border-r border-zinc-200 px-0.5 py-1 text-zinc-700 last:border-r-0 ${isNarrowColumn ? "text-[9px]" : "text-[10px]"} ${alignCenterClass}`}
              >
                {tags.length ? (
                  <div className="space-y-0.5 text-zinc-600">
                    {rows.slice(0, shenShaMaxRows).map((row, rowIndex) => (
                      <p key={`tag-row-${index}-${rowIndex}`} className="truncate leading-4">
                        {row.map((tag) => (
                          <span key={`tag-${index}-${tag}`} title={SHEN_SHA_TOOLTIP_MAP[tag] ?? tag}>
                            {tag}
                            {" "}
                          </span>
                        ))}
                      </p>
                    ))}
                  </div>
                ) : (
                  <span className="text-zinc-400">--</span>
                )}
              </div>
            );
          })}
          <div className={`border-r border-zinc-200 bg-zinc-50 py-1 text-zinc-500 ${metaTextClass} ${alignCenterClass}`}>十二长生</div>
          {[
            ganZhi.currentLiuNianDetail?.diShi ?? "--",
            effectiveDaYun?.diShi ?? "--",
            ganZhi.yearDiShi,
            ganZhi.monthDiShi,
            ganZhi.dayDiShi,
            ...(hasHourPillar ? [ganZhi.timeDiShi] : [])
          ].map(
            (value, index) => (
              <div
                key={`dishi-${index}`}
                className={`border-r border-zinc-200 py-1 text-zinc-700 last:border-r-0 ${metaTextClass} ${alignCenterClass}`}
              >
                {value}
              </div>
            )
          )}
        </div>
        <p className="mt-1 text-[10px] text-zinc-500">
          十二长生：长生、沐浴、冠带、临官、帝旺、衰、病、死、墓、绝、胎、养。
        </p>
      </div>
    </>
  );
}
