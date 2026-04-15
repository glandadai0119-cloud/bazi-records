"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { GanZhiResult } from "@/lib/bazi";
import BaziTable from "@/components/bazi-table";
import FortuneCards from "@/components/fortune-cards";

type TabKey = "基本信息" | "基本排盘" | "专业细盘" | "断事笔记";

type BasicInfo = {
  name: string;
  gender: "男" | "女";
  birthDate: string;
  birthTime: string;
  createdAt?: string;
};

type BaziResultPanelProps = {
  ganZhi: GanZhiResult;
  basicInfo: BasicInfo;
  noteStorageKey?: string;
  rightActions?: ReactNode;
};

const TAB_LIST: TabKey[] = ["基本信息", "基本排盘", "专业细盘", "断事笔记"];

const GAN_WU_XING_MAP: Record<string, "木" | "火" | "土" | "金" | "水"> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水"
};

const WU_XING_BAR_STYLE_MAP: Record<"木" | "火" | "土" | "金" | "水", string> = {
  木: "bg-emerald-600",
  火: "bg-rose-600",
  土: "bg-[#8a5a34]",
  金: "bg-[#c79a2b]",
  水: "bg-blue-600"
};

export default function BaziResultPanel({
  ganZhi,
  basicInfo,
  noteStorageKey,
  rightActions
}: BaziResultPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("基本排盘");
  const [activeDaYunIndex, setActiveDaYunIndex] = useState<number | null>(
    ganZhi.currentDaYun?.index ?? ganZhi.daYun[0]?.index ?? null
  );
  const [note, setNote] = useState("");
  const [savedTip, setSavedTip] = useState("");
  const storageKey = useMemo(
    () => (noteStorageKey ? `bazi_note_${noteStorageKey}` : ""),
    [noteStorageKey]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !storageKey) {
      return;
    }
    const cached = window.localStorage.getItem(storageKey);
    if (cached) {
      setNote(cached);
    }
  }, [storageKey]);

  const hiddenStemDistribution = useMemo(() => {
    const allHideGanGroups = [
      ganZhi.yearHideGan,
      ganZhi.monthHideGan,
      ganZhi.dayHideGan,
      ganZhi.timeHideGan
    ];
    const totals: Record<"木" | "火" | "土" | "金" | "水", number> = {
      木: 0,
      火: 0,
      土: 0,
      金: 0,
      水: 0
    };
    allHideGanGroups.forEach((group) => {
      const weight =
        group.length === 1
          ? [1]
          : group.length === 2
            ? [0.7, 0.3]
            : group.length === 3
              ? [0.6, 0.25, 0.15]
              : group.map(() => 1 / group.length);
      group.forEach((gan, index) => {
        const wuXing = GAN_WU_XING_MAP[gan];
        if (!wuXing) {
          return;
        }
        totals[wuXing] += weight[index] ?? 0;
      });
    });
    const sum = Object.values(totals).reduce((acc, value) => acc + value, 0);
    const items = (Object.keys(totals) as Array<"木" | "火" | "土" | "金" | "水">).map(
      (element) => ({
        element,
        score: totals[element],
        percent: sum > 0 ? (totals[element] / sum) * 100 : 0
      })
    );
    return items.sort((left, right) => right.score - left.score);
  }, [ganZhi.dayHideGan, ganZhi.monthHideGan, ganZhi.timeHideGan, ganZhi.yearHideGan]);
  const hasHourPillar = useMemo(() => {
    const value = ganZhi.time.trim();
    return value.length >= 2 && value !== "--";
  }, [ganZhi.time]);
  const basePillarItems = useMemo(
    () => [
      { label: "年柱", value: ganZhi.year },
      { label: "月柱", value: ganZhi.month },
      { label: "日柱", value: ganZhi.day }
    ],
    [ganZhi.day, ganZhi.month, ganZhi.year]
  );
  const displayPillarItems = useMemo(
    () => (hasHourPillar ? [...basePillarItems, { label: "时柱", value: ganZhi.time }] : basePillarItems),
    [basePillarItems, ganZhi.time, hasHourPillar]
  );
  const activeDaYun = useMemo(
    () => ganZhi.daYun.find((item) => item.index === activeDaYunIndex) ?? ganZhi.currentDaYun ?? ganZhi.daYun[0] ?? null,
    [activeDaYunIndex, ganZhi.currentDaYun, ganZhi.daYun]
  );

  useEffect(() => {
    setActiveDaYunIndex(ganZhi.currentDaYun?.index ?? ganZhi.daYun[0]?.index ?? null);
  }, [ganZhi.currentDaYun, ganZhi.daYun]);

  const handleSaveNote = () => {
    if (typeof window === "undefined" || !storageKey) {
      return;
    }
    window.localStorage.setItem(storageKey, note);
    setSavedTip("笔记已保存到本地。");
    window.setTimeout(() => setSavedTip(""), 1500);
  };

  return (
    <div className="relative space-y-3 rounded-lg border border-zinc-300 bg-white p-0 font-['Songti_SC','STSong','Noto_Serif_SC',serif] text-slate-800">
      <div className="grid grid-cols-4 rounded-t-lg bg-zinc-900 text-center text-xs text-zinc-300">
        {TAB_LIST.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 transition-colors ${
              activeTab === tab ? "bg-zinc-800 text-white" : "text-zinc-300"
            } ${
              tab === "断事笔记" ? "" : "border-r border-zinc-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === "基本信息" ? (
        <div className="space-y-2 px-4 pb-4 text-sm text-slate-700">
          <p>姓名：{basicInfo.name || "未填写"}</p>
          <p>性别：{basicInfo.gender}</p>
          <p>
            生辰：{basicInfo.birthDate} {basicInfo.birthTime}
          </p>
          <p>{ganZhi.yunStartDesc}</p>
          {basicInfo.createdAt ? <p>创建日期：{basicInfo.createdAt}</p> : null}
          <p className="text-slate-500">合盘：{ganZhi.full}</p>
        </div>
      ) : null}
      {activeTab === "基本排盘" ? (
        <>
          <div className="px-3 pb-1">
            <div className={`grid gap-2 ${hasHourPillar ? "grid-cols-4" : "grid-cols-3"}`}>
              {displayPillarItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-md border border-[#e6ded2] bg-[#fbf8f3] px-2 py-2 text-center"
                >
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="mt-1 text-xl font-semibold tracking-[0.08em] text-slate-800">{item.value || "--"}</p>
                </div>
              ))}
            </div>
            {!hasHourPillar ? (
              <div className="mt-2 rounded-md border border-dashed border-[#d8c8b3] bg-[#fdf8f1] px-3 py-2">
                <p className="text-sm font-medium text-[#6a4729]">时辰未知（完善信息解锁精准详批）</p>
                <p className="mt-1 text-xs text-slate-600">
                  建议补充出生时辰后重新排盘；也可在此放置品牌二维码与服务指引，提升海报传播效率。
                </p>
              </div>
            ) : null}
          </div>
          <BaziTable ganZhi={ganZhi} activeDaYun={activeDaYun} />
          {!hasHourPillar ? (
            <div className="mx-3 mt-2 rounded-md border border-[#e6ded2] bg-[#fbf8f3] px-3 py-2">
              <p className="text-xs font-medium text-slate-700">五行比例（缺时柱时的参考补位）</p>
              <div className="mt-2 space-y-1.5">
                {hiddenStemDistribution.map((item) => (
                  <div key={`quick-${item.element}`} className="grid grid-cols-[24px_1fr_48px] items-center gap-2">
                    <span className="text-[11px] text-slate-700">{item.element}</span>
                    <div className="h-1.5 overflow-hidden rounded bg-slate-100">
                      <div
                        className={`h-full rounded ${WU_XING_BAR_STYLE_MAP[item.element]}`}
                        style={{ width: `${item.percent.toFixed(1)}%` }}
                      />
                    </div>
                    <span className="text-right text-[11px] text-slate-500">{item.percent.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <FortuneCards
            ganZhi={ganZhi}
            activeLuckIndex={activeDaYunIndex}
            onActiveLuckChange={setActiveDaYunIndex}
          />
          {!hasHourPillar ? (
            <p className="px-3 text-center text-xs font-medium text-amber-700">
              注：当前由于缺失出生时辰，仅根据“三柱”生成，结果仅供参考。
            </p>
          ) : null}
          <p className="text-center text-xs tracking-[0.12em] text-slate-500">合盘：{ganZhi.full}</p>
        </>
      ) : null}
      {activeTab === "专业细盘" ? (
        <div className="space-y-2 px-4 pb-4 text-sm text-slate-700">
          <p className="font-medium text-slate-800">藏干占比（按主次权重估算）</p>
          <div className="space-y-2">
            {hiddenStemDistribution.map((item) => (
              <div key={item.element} className="grid grid-cols-[32px_1fr_52px] items-center gap-2">
                <span className="text-xs text-slate-700">{item.element}</span>
                <div className="h-2 overflow-hidden rounded bg-slate-100">
                  <div
                    className={`h-full rounded ${WU_XING_BAR_STYLE_MAP[item.element]}`}
                    style={{ width: `${item.percent.toFixed(1)}%` }}
                  />
                </div>
                <span className="text-right text-xs text-slate-500">{item.percent.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <p className="pt-1 text-xs text-slate-500">
            藏干明细：年({ganZhi.yearHideGan.join("、")}) 月({ganZhi.monthHideGan.join("、")}) 日(
            {ganZhi.dayHideGan.join("、")}) 时({ganZhi.timeHideGan.join("、")})
          </p>
        </div>
      ) : null}
      {activeTab === "断事笔记" ? (
        <div className="space-y-2 px-4 pb-4 text-sm text-slate-700">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={5}
            placeholder="记录你的断事思路、应期观察与验证结果..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-slate-300 focus:ring"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveNote}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white hover:bg-slate-700"
            >
              保存笔记
            </button>
            {savedTip ? <span className="text-xs text-emerald-700">{savedTip}</span> : null}
          </div>
        </div>
      ) : null}
      {rightActions ? (
        <div data-html2canvas-ignore="true" data-export-controls="true" className="px-3 pb-3">
          {rightActions}
        </div>
      ) : null}
    </div>
  );
}
