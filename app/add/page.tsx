"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getGanZhiFromBirthTime } from "@/lib/bazi";
import type { BaziRecord } from "@/data/mock-records";
import { appendRecord } from "@/lib/records-storage";

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

function getElementColorClassByChinese(element: string): string {
  if (element === "木") return WU_XING_COLOR_CLASS_MAP.wood;
  if (element === "火") return WU_XING_COLOR_CLASS_MAP.fire;
  if (element === "土") return WU_XING_COLOR_CLASS_MAP.earth;
  if (element === "金") return WU_XING_COLOR_CLASS_MAP.metal;
  if (element === "水") return WU_XING_COLOR_CLASS_MAP.water;
  return "text-slate-700";
}

function getColumnShenSha(
  label: string,
  currentLiuNianShenSha: string[],
  currentDaYunShenSha: string[],
  pillarShenSha: {
    year: string[];
    month: string[];
    day: string[];
    time: string[];
  }
): string[] {
  if (label === "流年") return currentLiuNianShenSha;
  if (label === "大运") return currentDaYunShenSha;
  if (label === "年柱") return pillarShenSha.year;
  if (label === "月柱") return pillarShenSha.month;
  if (label === "日柱") return pillarShenSha.day;
  if (label === "时柱") return pillarShenSha.time;
  return [];
}

export default function AddRecordPage() {
  const router = useRouter();
  const resultPosterRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [notes, setNotes] = useState("");
  const [gender, setGender] = useState<"男" | "女">("男");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const ganZhi = useMemo(
    () => getGanZhiFromBirthTime(birthDate, birthTime, gender),
    [birthDate, birthTime, gender]
  );
  const pillarColumns = ganZhi
    ? [
        { label: "流年", value: ganZhi.currentLiuNian },
        { label: "大运", value: ganZhi.currentDaYun?.ganZhi ?? "--" },
        { label: "年柱", value: ganZhi.year },
        { label: "月柱", value: ganZhi.month },
        { label: "日柱", value: ganZhi.day },
        { label: "时柱", value: ganZhi.time }
      ]
    : [];

  const handleSaveRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !birthDate || !birthTime) {
      setSaveMessage("请先完整填写姓名、出生日期和出生时间。");
      return;
    }
    setIsSaving(true);
    const nextRecord: BaziRecord = {
      id: `${Date.now()}`,
      name: name.trim(),
      gender,
      birthDate,
      birthTime,
      notes: notes.trim(),
      createdAt: new Date().toISOString().slice(0, 10)
    };
    appendRecord(nextRecord);
    setIsSaving(false);
    setSaveMessage("记录已保存到本地，下次打开浏览器仍可查看。");
  };

  const handleExportPoster = async () => {
    if (!resultPosterRef.current || !ganZhi) {
      return;
    }
    setIsExporting(true);
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(resultPosterRef.current, {
      backgroundColor: "#ffffff",
      scale: 2
    });
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const safeName = name.trim() || "八字";
    link.href = url;
    link.download = `${safeName}-排盘海报.png`;
    link.click();
    setIsExporting(false);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">添加记录</h2>
          <p className="mt-1 text-sm text-slate-600">
            这是脚手架版本，表单提交逻辑可后续接数据库或 API。
          </p>
        </div>
        <Link href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900">
          返回列表
        </Link>
      </div>

      <form className="space-y-4 rounded-xl bg-white p-6 shadow-sm" onSubmit={handleSaveRecord}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">
            姓名
            <input
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="请输入姓名"
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-300 focus:ring"
            />
          </label>

          <label className="grid gap-2 text-sm">
            性别
            <select
              name="gender"
              value={gender}
              onChange={(event) => setGender(event.target.value as "男" | "女")}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-300 focus:ring"
            >
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">
            出生日期
            <input
              name="birthDate"
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-300 focus:ring"
            />
          </label>

          <label className="grid gap-2 text-sm">
            出生时间
            <input
              name="birthTime"
              type="time"
              value={birthTime}
              onChange={(event) => setBirthTime(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-300 focus:ring"
            />
          </label>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {ganZhi ? (
            <div
              ref={resultPosterRef}
              className="relative space-y-3 rounded-lg border border-zinc-300 bg-white p-0 font-['Songti_SC','STSong','Noto_Serif_SC',serif] text-slate-800"
            >
              <div className="grid grid-cols-4 rounded-t-lg bg-zinc-900 text-center text-sm text-zinc-300">
                <span className="border-r border-zinc-700 py-2">基本信息</span>
                <span className="border-r border-zinc-700 bg-zinc-800 py-2 text-white">基本排盘</span>
                <span className="border-r border-zinc-700 py-2">专业细盘</span>
                <span className="py-2">断事笔记</span>
              </div>
              <div className="px-3 pb-1 sm:hidden">
                <div className="space-y-2">
                  {[pillarColumns.slice(0, 3), pillarColumns.slice(3, 6)].map((group, groupIndex) => (
                    <div key={`mobile-group-${groupIndex}`} className="grid grid-cols-3 gap-2">
                      {group.map((column) => {
                        const { stem, branch } = getGanZhiParts(column.value);
                        const shenShaTags = getColumnShenSha(
                          column.label,
                          ganZhi.currentLiuNianDetail?.shenSha ?? [],
                          ganZhi.currentDaYun?.shenSha ?? [],
                          ganZhi.pillarShenSha
                        );
                        return (
                          <div
                            key={`mobile-${column.label}`}
                            className="rounded-md border border-zinc-200 bg-zinc-50 p-2 text-center"
                          >
                            <p className="text-[11px] text-zinc-500">{column.label}</p>
                            <p className={`text-2xl font-semibold leading-none ${getStemColorClass(stem)}`}>
                              {stem || "--"}
                            </p>
                            <p className={`mt-1 text-2xl font-semibold leading-none ${getBranchColorClass(branch)}`}>
                              {branch || "--"}
                            </p>
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
                  {[
                    ganZhi.currentLiuNian,
                    ganZhi.currentDaYun?.ganZhi ?? "--",
                    ganZhi.year,
                    ganZhi.month,
                    ganZhi.day,
                    ganZhi.time
                  ].map((pillar, index) => {
                    const { stem } = getGanZhiParts(pillar);
                    return (
                      <div
                        key={`stem-${pillar}-${index}`}
                        className="border-b border-r border-zinc-200 py-2 text-4xl font-semibold leading-none last:border-r-0"
                      >
                        <span className={getStemColorClass(stem)}>{stem || "--"}</span>
                      </div>
                    );
                  })}

                  <div className="border-b border-r border-zinc-200 bg-zinc-50 py-2 text-zinc-500">地支</div>
                  {[
                    ganZhi.currentLiuNian,
                    ganZhi.currentDaYun?.ganZhi ?? "--",
                    ganZhi.year,
                    ganZhi.month,
                    ganZhi.day,
                    ganZhi.time
                  ].map((pillar, index) => {
                    const { branch } = getGanZhiParts(pillar);
                    return (
                      <div
                        key={`branch-${pillar}-${index}`}
                        className="border-b border-r border-zinc-200 py-2 text-4xl font-semibold leading-none last:border-r-0"
                      >
                        <span className={getBranchColorClass(branch)}>{branch || "--"}</span>
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
                  {[
                    "--",
                    "--",
                    ganZhi.yearHideGan,
                    ganZhi.monthHideGan,
                    ganZhi.dayHideGan,
                    ganZhi.timeHideGan
                  ].map((value, index) => (
                    <div
                      key={`hidegan-${index}`}
                      className="border-b border-r border-zinc-200 px-1 py-2 text-xs text-zinc-600 last:border-r-0"
                    >
                      {Array.isArray(value) ? (
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {value.map((item, itemIndex) => {
                            const colorClass = getStemColorClass(item);
                            return (
                              <span key={`${item}-${itemIndex}`} className={colorClass}>
                                {item}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-zinc-400">{value}</span>
                      )}
                    </div>
                  ))}

                  <div className="border-b border-r border-zinc-200 bg-zinc-50 py-2 text-zinc-500">
                    神煞
                  </div>
                  {[
                    ganZhi.currentLiuNianDetail?.shenSha ?? [],
                    ganZhi.currentDaYun?.shenSha ?? [],
                    ganZhi.pillarShenSha.year,
                    ganZhi.pillarShenSha.month,
                    ganZhi.pillarShenSha.day,
                    ganZhi.pillarShenSha.time
                  ].map((tags, index) => (
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
                  ))}

                  <div className="border-r border-zinc-200 bg-zinc-50 py-2 text-zinc-500">
                    十二长生
                  </div>
                  {[
                    "--",
                    "--",
                    ganZhi.yearDiShi,
                    ganZhi.monthDiShi,
                    ganZhi.dayDiShi,
                    ganZhi.timeDiShi
                  ].map((value, index) => (
                    <div
                      key={`dishi-${index}`}
                      className="border-r border-zinc-200 py-2 text-sm text-zinc-700 last:border-r-0"
                    >
                      {value}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-zinc-500">
                  十二长生：长生、沐浴、冠带、临官、帝旺、衰、病、死、墓、绝、胎、养。
                </p>
              </div>
              <div className="space-y-2 rounded-md border border-[#c8ad8f] bg-[#f8f4ef] p-3 text-xs text-slate-700">
                <div className="rounded-md border border-[#d6b794] bg-[#fdf7ef] p-3">
                  <p className="text-xs tracking-[0.2em] text-[#8a6544]">格局分析</p>
                  <p className="mt-1 text-sm font-semibold text-[#5c3d25]">
                    {ganZhi.patternAnalysis.patternName} · 日主{ganZhi.patternAnalysis.dayMasterStrength}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-700">
                    {ganZhi.patternAnalysis.summary}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[#efe2d2] px-2 py-0.5 text-[11px] text-[#7a5230]">
                      喜用神
                    </span>
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
                <p className="font-semibold tracking-[0.2em] text-[#6a4729]">大运</p>
                <p>{ganZhi.yunStartDesc}</p>
                {ganZhi.currentDaYun ? (
                  <p className="text-sm text-slate-800">
                    当前大运：{ganZhi.currentDaYun.ganZhi}（{ganZhi.currentDaYun.startYear}-
                    {ganZhi.currentDaYun.endYear}，{ganZhi.currentDaYun.startAge}-
                    {ganZhi.currentDaYun.endAge}岁）
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
                        className={`relative rounded-md border px-2 py-2 transition-colors duration-150 touch-manipulation active:scale-[0.99] active:brightness-95 ${
                          isCurrent
                            ? "border-[#9a6c43] bg-[#efe2d2] text-[#5c3d25]"
                            : "border-[#d9c5ad] bg-white/80 text-slate-600"
                        }`}
                      >
                        {!!item.shenSha.length && (
                          <div className="absolute right-1 top-1 flex flex-wrap justify-end gap-1">
                            {item.shenSha.slice(0, 2).map((tag) => (
                              <span
                                key={`${item.index}-${tag}`}
                                title={SHEN_SHA_TOOLTIP_MAP[tag] ?? tag}
                                className="rounded border border-[#c8ad8f] bg-[#f8f4ef] px-1 py-0.5 text-[10px] text-[#7a5230]"
                              >
                                {tag}
                              </span>
                            ))}
                            {item.shenSha.length > 2 && (
                              <span
                                title={`完整神煞：${item.shenSha.join("、")}`}
                                className="cursor-help rounded border border-[#c8ad8f] bg-[#f8f4ef] px-1 py-0.5 text-[10px] text-[#7a5230]"
                              >
                                +{item.shenSha.length - 2}
                              </span>
                            )}
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
                          <span className="text-slate-500">藏干十神:</span>
                          {item.hideGanShiShenShort.map((shortName, shortIndex) => (
                            <span
                              key={`${item.ganZhi}-${shortName}-${shortIndex}`}
                              className={getShiShenShortColorClass(shortName)}
                            >
                              {shortName}
                            </span>
                          ))}
                        </p>
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
                          className={`relative rounded-md border px-2 py-2 transition duration-150 touch-manipulation active:scale-[0.99] active:brightness-95 ${
                            isCurrent
                              ? "border-blue-300 bg-blue-50 text-blue-900"
                              : "border-slate-200 bg-white/70 text-slate-700"
                          }`}
                        >
                          {!!item.shenSha.length && (
                            <div className="absolute right-1 top-1 flex flex-wrap justify-end gap-1">
                              {item.shenSha.slice(0, 2).map((tag) => (
                                <span
                                  key={`${item.startYear}-${tag}`}
                                  title={SHEN_SHA_TOOLTIP_MAP[tag] ?? tag}
                                  className="rounded border border-slate-300 bg-white px-1 py-0.5 text-[10px] text-slate-600"
                                >
                                  {tag}
                                </span>
                              ))}
                              {item.shenSha.length > 2 && (
                                <span
                                  title={`完整神煞：${item.shenSha.join("、")}`}
                                  className="cursor-help rounded border border-slate-300 bg-white px-1 py-0.5 text-[10px] text-slate-600"
                                >
                                  +{item.shenSha.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-sm font-semibold">
                            {item.startYear} · {item.ganZhi}
                          </p>
                          <p className="text-xs">{item.startAge}岁</p>
                          <p className="mt-1 flex items-center gap-1 text-[11px]">
                            <span className="text-slate-500">藏干十神:</span>
                            {item.hideGanShiShenShort.map((shortName, shortIndex) => (
                              <span
                                key={`${item.ganZhi}-${shortName}-${shortIndex}`}
                                className={getShiShenShortColorClass(shortName)}
                              >
                                {shortName}
                              </span>
                            ))}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <p className="text-center text-xs tracking-[0.12em] text-slate-500">
                合盘：{ganZhi.full}
              </p>
              <div className="px-3 pb-3">
                <button
                  type="button"
                  onClick={handleExportPoster}
                  disabled={isExporting}
                  className="w-full rounded-md border border-[#c8ad8f] bg-[#fdf7ef] px-3 py-2 text-sm text-[#6a4729] transition hover:bg-[#f7efe4] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isExporting ? "正在生成海报..." : "导出图片海报"}
                </button>
              </div>
            </div>
          ) : (
            <p>请选择出生日期和时间后自动计算天干地支。</p>
          )}
        </div>

        <label className="grid gap-2 text-sm">
          备注
          <textarea
            name="notes"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="例如：关注事业发展、婚恋走势等"
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-300 focus:ring"
          />
        </label>

        {saveMessage ? (
          <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{saveMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "保存中..." : "保存记录"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="ml-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          返回记录列表
        </button>
      </form>
    </section>
  );
}
