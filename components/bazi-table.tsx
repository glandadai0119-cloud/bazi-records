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
};

export default function BaziTable({ ganZhi }: BaziTableProps) {
  const pillarColumns = [
    { label: "流年", value: ganZhi.currentLiuNian },
    { label: "大运", value: ganZhi.currentDaYun?.ganZhi ?? "--" },
    { label: "年柱", value: ganZhi.year },
    { label: "月柱", value: ganZhi.month },
    { label: "日柱", value: ganZhi.day },
    { label: "时柱", value: ganZhi.time }
  ];

  const getColumnShenSha = (label: string): string[] => {
    if (label === "流年") return ganZhi.currentLiuNianDetail?.shenSha ?? [];
    if (label === "大运") return ganZhi.currentDaYun?.shenSha ?? [];
    if (label === "年柱") return ganZhi.pillarShenSha.year;
    if (label === "月柱") return ganZhi.pillarShenSha.month;
    if (label === "日柱") return ganZhi.pillarShenSha.day;
    if (label === "时柱") return ganZhi.pillarShenSha.time;
    return [];
  };

  return (
    <>
      <div className="px-3 pb-1 sm:hidden">
        <div className="space-y-2">
          {[pillarColumns.slice(0, 3), pillarColumns.slice(3, 6)].map((group, groupIndex) => (
            <div key={`mobile-group-${groupIndex}`} className="grid grid-cols-3 gap-2">
              {group.map((column) => {
                const { stem, branch } = getGanZhiParts(column.value);
                const shenShaTags = getColumnShenSha(column.label);
                return (
                  <div
                    key={`mobile-${column.label}`}
                    className="rounded-md border border-zinc-200 bg-zinc-50 p-2 text-center"
                  >
                    <p className="text-[11px] text-zinc-500">{column.label}</p>
                    <div className="mt-1 flex h-10 items-center justify-center overflow-hidden">
                      <p className={`text-[24px] font-semibold leading-[1] ${getStemColorClass(stem)}`}>
                        {stem || "--"}
                      </p>
                    </div>
                    <div className="mt-1 flex h-10 items-center justify-center overflow-hidden">
                      <p className={`text-[24px] font-semibold leading-[1] ${getBranchColorClass(branch)}`}>
                        {branch || "--"}
                      </p>
                    </div>
                    {!!shenShaTags.length && (
                      <div className="mt-1 flex flex-wrap items-center justify-center gap-1">
                        {shenShaTags.slice(0, 2).map((tag) => (
                          <span
                            key={`mobile-tag-${column.label}-${tag}`}
                            title={SHEN_SHA_TOOLTIP_MAP[tag] ?? tag}
                            className="rounded border border-zinc-200 bg-white px-1 py-0.5 text-[10px] text-zinc-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="hidden overflow-x-auto px-3 pb-1 sm:block">
        <div className="grid min-w-[760px] grid-cols-[72px_repeat(6,minmax(0,1fr))] border border-zinc-200 text-center">
          <div className="border-b border-r border-zinc-200 bg-zinc-100 py-2 text-xs text-zinc-500">
            项目
          </div>
          {pillarColumns.map((column) => (
            <div
              key={column.label}
              className="border-b border-r border-zinc-200 bg-zinc-100 py-2 text-sm text-zinc-600 last:border-r-0"
            >
              {column.label}
            </div>
          ))}
          <div className="border-b border-r border-zinc-200 bg-zinc-50 py-2 text-zinc-500">天干</div>
          {pillarColumns.map((column, index) => {
            const { stem } = getGanZhiParts(column.value);
            return (
              <div
                key={`stem-${column.value}-${index}`}
                className="flex h-16 items-center justify-center overflow-hidden border-b border-r border-zinc-200 px-1 py-1 text-[30px] font-semibold leading-[1] last:border-r-0"
              >
                <span className={`${getStemColorClass(stem)} inline-block leading-[1]`}>{stem || "--"}</span>
              </div>
            );
          })}
          <div className="border-b border-r border-zinc-200 bg-zinc-50 py-2 text-zinc-500">地支</div>
          {pillarColumns.map((column, index) => {
            const { branch } = getGanZhiParts(column.value);
            return (
              <div
                key={`branch-${column.value}-${index}`}
                className="flex h-16 items-center justify-center overflow-hidden border-b border-r border-zinc-200 px-1 py-1 text-[30px] font-semibold leading-[1] last:border-r-0"
              >
                <span className={`${getBranchColorClass(branch)} inline-block leading-[1]`}>{branch || "--"}</span>
              </div>
            );
          })}
          <div className="border-b border-r border-zinc-200 bg-zinc-50 py-2 text-zinc-500">十神</div>
          {[
            null,
            null,
            { gan: ganZhi.yearShiShenGan, zhiList: ganZhi.yearShiShenZhi },
            { gan: ganZhi.monthShiShenGan, zhiList: ganZhi.monthShiShenZhi },
            { gan: ganZhi.dayShiShenGan, zhiList: ganZhi.dayShiShenZhi },
            { gan: ganZhi.timeShiShenGan, zhiList: ganZhi.timeShiShenZhi }
          ].map((value, index) => (
            <div
              key={`shishen-${index}`}
              className="border-b border-r border-zinc-200 px-1 py-2 text-xs last:border-r-0"
            >
              {value ? (
                <div className="space-y-1">
                  <span className={`font-semibold ${getShiShenColorClass(value.gan)}`}>
                    {value.gan}
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-1">
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
          <div className="border-b border-r border-zinc-200 bg-zinc-50 py-2 text-zinc-500">藏干</div>
          {["--", "--", ganZhi.yearHideGan, ganZhi.monthHideGan, ganZhi.dayHideGan, ganZhi.timeHideGan].map(
            (value, index) => (
              <div
                key={`hidegan-${index}`}
                className="border-b border-r border-zinc-200 px-1 py-2 text-xs text-zinc-600 last:border-r-0"
              >
                {Array.isArray(value) ? value.join("、") : value}
              </div>
            )
          )}
          <div className="border-b border-r border-zinc-200 bg-zinc-50 py-2 text-zinc-500">神煞</div>
          {pillarColumns.map((column, index) => {
            const tags = getColumnShenSha(column.label);
            return (
              <div
                key={`pillar-shensha-${index}`}
                className="border-b border-r border-zinc-200 px-1 py-2 text-xs text-zinc-700 last:border-r-0"
              >
                {tags.length ? (
                  <div className="flex flex-wrap items-center justify-center gap-1">
                    {tags.map((tag) => (
                      <span
                        key={`tag-${index}-${tag}`}
                        title={SHEN_SHA_TOOLTIP_MAP[tag] ?? tag}
                        className="cursor-help rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 text-[10px] text-zinc-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-zinc-400">--</span>
                )}
              </div>
            );
          })}
          <div className="border-r border-zinc-200 bg-zinc-50 py-2 text-zinc-500">十二长生</div>
          {["--", "--", ganZhi.yearDiShi, ganZhi.monthDiShi, ganZhi.dayDiShi, ganZhi.timeDiShi].map(
            (value, index) => (
              <div
                key={`dishi-${index}`}
                className="border-r border-zinc-200 py-2 text-sm text-zinc-700 last:border-r-0"
              >
                {value}
              </div>
            )
          )}
        </div>
        <p className="mt-2 text-[11px] text-zinc-500">
          十二长生：长生、沐浴、冠带、临官、帝旺、衰、病、死、墓、绝、胎、养。
        </p>
      </div>
    </>
  );
}
