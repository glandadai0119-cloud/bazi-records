"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  findSolarCandidatesByPillars,
  type PillarSolarCandidate,
  getGanZhiFromBirthTime,
  getGanZhiFromLunarBirthTime,
  getGanZhiFromPillars
} from "@/lib/bazi";
import type { BaziRecord } from "@/data/mock-records";
import { appendRecord } from "@/lib/records-storage";
import BaziResultPanel from "@/components/bazi-result-panel";

const TIAN_GAN_OPTIONS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const DI_ZHI_OPTIONS = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
const MONTH_BRANCH_ORDER = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"] as const;

const WU_HU_DUN_START_GAN: Record<string, string> = {
  甲: "丙",
  己: "丙",
  乙: "戊",
  庚: "戊",
  丙: "庚",
  辛: "庚",
  丁: "壬",
  壬: "壬",
  戊: "甲",
  癸: "甲"
};

const WU_SHU_DUN_START_GAN: Record<string, string> = {
  甲: "甲",
  己: "甲",
  乙: "丙",
  庚: "丙",
  丙: "戊",
  辛: "戊",
  丁: "庚",
  壬: "庚",
  戊: "壬",
  癸: "壬"
};

function isValidGanzhi(tiankan: string, dizhi: string): boolean {
  const ganIndex = TIAN_GAN_OPTIONS.indexOf(tiankan as (typeof TIAN_GAN_OPTIONS)[number]);
  const zhiIndex = DI_ZHI_OPTIONS.indexOf(dizhi as (typeof DI_ZHI_OPTIONS)[number]);
  if (ganIndex < 0 || zhiIndex < 0) {
    return false;
  }
  return ganIndex % 2 === zhiIndex % 2;
}

function getExpectedMonthStem(yearStem: string, monthBranch: string): string | null {
  const startGan = WU_HU_DUN_START_GAN[yearStem];
  const monthIndex = MONTH_BRANCH_ORDER.indexOf(monthBranch as (typeof MONTH_BRANCH_ORDER)[number]);
  if (!startGan || monthIndex < 0) {
    return null;
  }
  const startGanIndex = TIAN_GAN_OPTIONS.indexOf(startGan as (typeof TIAN_GAN_OPTIONS)[number]);
  return TIAN_GAN_OPTIONS[(startGanIndex + monthIndex) % 10];
}

function getExpectedTimeStem(dayStem: string, timeBranch: string): string | null {
  const startGan = WU_SHU_DUN_START_GAN[dayStem];
  const timeIndex = DI_ZHI_OPTIONS.indexOf(timeBranch as (typeof DI_ZHI_OPTIONS)[number]);
  if (!startGan || timeIndex < 0) {
    return null;
  }
  const startGanIndex = TIAN_GAN_OPTIONS.indexOf(startGan as (typeof TIAN_GAN_OPTIONS)[number]);
  return TIAN_GAN_OPTIONS[(startGanIndex + timeIndex) % 10];
}

function prioritizeRecommended(options: readonly string[], recommended: string | null): string[] {
  if (!recommended || !options.includes(recommended)) {
    return [...options];
  }
  return [recommended, ...options.filter((item) => item !== recommended)];
}

export default function AddRecordPage() {
  const router = useRouter();
  const resultPosterRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState("");
  const [inputMode, setInputMode] = useState<"solar" | "lunar" | "pillars">("solar");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [yearStem, setYearStem] = useState("甲");
  const [yearBranch, setYearBranch] = useState("子");
  const [monthStem, setMonthStem] = useState("丙");
  const [monthBranch, setMonthBranch] = useState("寅");
  const [dayStem, setDayStem] = useState("甲");
  const [dayBranch, setDayBranch] = useState("子");
  const [timeStem, setTimeStem] = useState("甲");
  const [timeBranch, setTimeBranch] = useState("子");
  const [referenceSolarDateTime, setReferenceSolarDateTime] = useState("");
  const [referenceYear, setReferenceYear] = useState(`${new Date().getFullYear()}`);
  const [searchStartYear, setSearchStartYear] = useState("1900");
  const [searchEndYear, setSearchEndYear] = useState("2030");
  const [candidateDateTimes, setCandidateDateTimes] = useState<PillarSolarCandidate[]>([]);
  const [searchHint, setSearchHint] = useState("");
  const [hasSearchedCandidates, setHasSearchedCandidates] = useState(false);
  const [pillarWarning, setPillarWarning] = useState("");
  const [strictRuleMode, setStrictRuleMode] = useState(false);
  const [notes, setNotes] = useState("");
  const [gender, setGender] = useState<"男" | "女">("男");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const normalizedReferenceDateTime =
    referenceSolarDateTime ||
    (referenceYear && !Number.isNaN(Number(referenceYear))
      ? `${referenceYear}-01-01T12:00`
      : "");
  const pillarYear = `${yearStem}${yearBranch}`;
  const pillarMonth = `${monthStem}${monthBranch}`;
  const pillarDay = `${dayStem}${dayBranch}`;
  const pillarTime = `${timeStem}${timeBranch}`;
  const yearBranchOptions = DI_ZHI_OPTIONS.filter((branch) => isValidGanzhi(yearStem, branch));
  const yearStemOptions = TIAN_GAN_OPTIONS.filter((stem) => isValidGanzhi(stem, yearBranch));
  const monthBranchOptions = DI_ZHI_OPTIONS.filter((branch) => isValidGanzhi(monthStem, branch));
  const monthStemBaseOptions = TIAN_GAN_OPTIONS.filter((stem) => isValidGanzhi(stem, monthBranch));
  const expectedMonthStem = getExpectedMonthStem(yearStem, monthBranch);
  const monthStemOptions = useMemo(
    () =>
      expectedMonthStem && monthStemBaseOptions.includes(expectedMonthStem)
        ? [expectedMonthStem]
        : monthStemBaseOptions,
    [expectedMonthStem, monthStemBaseOptions]
  );
  const dayBranchOptions = DI_ZHI_OPTIONS.filter((branch) => isValidGanzhi(dayStem, branch));
  const dayStemOptions = TIAN_GAN_OPTIONS.filter((stem) => isValidGanzhi(stem, dayBranch));
  const timeBranchOptions = DI_ZHI_OPTIONS.filter((branch) => isValidGanzhi(timeStem, branch));
  const timeStemBaseOptions = TIAN_GAN_OPTIONS.filter((stem) => isValidGanzhi(stem, timeBranch));
  const expectedTimeStem = getExpectedTimeStem(dayStem, timeBranch);
  const timeStemOptions = useMemo(
    () =>
      expectedTimeStem && timeStemBaseOptions.includes(expectedTimeStem)
        ? [expectedTimeStem]
        : timeStemBaseOptions,
    [expectedTimeStem, timeStemBaseOptions]
  );
  const orderedMonthStemOptions = useMemo(
    () => prioritizeRecommended(monthStemOptions, expectedMonthStem),
    [monthStemOptions, expectedMonthStem]
  );
  const orderedTimeStemOptions = useMemo(
    () => prioritizeRecommended(timeStemOptions, expectedTimeStem),
    [timeStemOptions, expectedTimeStem]
  );
  const isMonthStemLocked =
    strictRuleMode &&
    monthStemOptions.length === 1 &&
    Boolean(expectedMonthStem) &&
    monthStemOptions[0] === expectedMonthStem;
  const isTimeStemLocked =
    strictRuleMode &&
    timeStemOptions.length === 1 &&
    Boolean(expectedTimeStem) &&
    timeStemOptions[0] === expectedTimeStem;
  const ganZhi = useMemo(() => {
    if (inputMode === "pillars") {
      return getGanZhiFromPillars(
        {
          year: pillarYear,
          month: pillarMonth,
          day: pillarDay,
          time: pillarTime
        },
        gender,
        normalizedReferenceDateTime
      );
    }
    if (inputMode === "lunar") {
      return getGanZhiFromLunarBirthTime(birthDate, birthTime, gender);
    }
    return getGanZhiFromBirthTime(birthDate, birthTime, gender);
  }, [
    inputMode,
    pillarYear,
    pillarMonth,
    pillarDay,
    pillarTime,
    birthDate,
    birthTime,
    gender,
    normalizedReferenceDateTime
  ]);

  const handleSaveRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setSaveMessage("请先填写姓名。");
      return;
    }
    if (inputMode !== "pillars" && (!birthDate || !birthTime)) {
      setSaveMessage("公历/农历模式下请完整填写出生日期和出生时间。");
      return;
    }
    setIsSaving(true);
    const nextRecord: BaziRecord = {
      id: `${Date.now()}`,
      name: name.trim(),
      gender,
      birthDate: inputMode === "pillars" ? "" : birthDate,
      birthTime: inputMode === "pillars" ? "" : birthTime,
      inputMode,
      pillars:
        inputMode === "pillars"
          ? {
              year: pillarYear,
              month: pillarMonth,
              day: pillarDay,
              time: pillarTime
            }
          : undefined,
      referenceSolarDateTime:
        inputMode === "pillars" && normalizedReferenceDateTime
          ? normalizedReferenceDateTime
          : undefined,
      notes: notes.trim(),
      createdAt: new Date().toISOString().slice(0, 10)
    };
    appendRecord(nextRecord);
    setIsSaving(false);
    setSaveMessage("记录已保存到本地，下次打开浏览器仍可查看。");
  };

  const handleFindCandidateYears = useCallback(() => {
    setHasSearchedCandidates(true);
    const start = Number(searchStartYear);
    const end = Number(searchEndYear);
    if (Number.isNaN(start) || Number.isNaN(end)) {
      setSearchHint("请先填写有效的查找范围年份。");
      return;
    }
    if (start > end) {
      setSearchHint("查找范围无效：起始年份不能大于结束年份。");
      return;
    }
    const candidates = findSolarCandidatesByPillars(
      {
        year: pillarYear,
        month: pillarMonth,
        day: pillarDay,
        time: pillarTime
      },
      start,
      end
    );
    if (!candidates.length) {
      setCandidateDateTimes([]);
      setSearchHint("该范围内未找到对应日期，请调整四柱或扩大年份范围。");
      return;
    }
    setCandidateDateTimes(candidates);
    setReferenceSolarDateTime((currentValue) =>
      currentValue && candidates.some((item) => item.value === currentValue)
        ? currentValue
        : candidates[0].value
    );
    setReferenceYear(`${candidates[0].year}`);
    setSearchHint(`已找到 ${candidates.length} 个候选日期，可直接选择。`);
  }, [pillarYear, pillarMonth, pillarDay, pillarTime, searchStartYear, searchEndYear]);

  useEffect(() => {
    if (inputMode !== "pillars") {
      return;
    }
    handleFindCandidateYears();
  }, [inputMode, handleFindCandidateYears]);

  useEffect(() => {
    if (!yearBranchOptions.includes(yearBranch as (typeof DI_ZHI_OPTIONS)[number])) {
      const fallback = yearBranchOptions[0];
      setYearBranch(fallback);
      setPillarWarning(`年柱组合不合法，已自动修正为 ${yearStem}${fallback}。`);
    }
  }, [yearStem, yearBranch, yearBranchOptions]);

  useEffect(() => {
    if (!yearStemOptions.includes(yearStem as (typeof TIAN_GAN_OPTIONS)[number])) {
      const fallback = yearStemOptions[0];
      setYearStem(fallback);
      setPillarWarning(`年柱组合不合法，已自动修正为 ${fallback}${yearBranch}。`);
    }
  }, [yearBranch, yearStem, yearStemOptions]);

  useEffect(() => {
    if (!dayBranchOptions.includes(dayBranch as (typeof DI_ZHI_OPTIONS)[number])) {
      const fallback = dayBranchOptions[0];
      setDayBranch(fallback);
      setPillarWarning(`日柱组合不合法，已自动修正为 ${dayStem}${fallback}。`);
    }
  }, [dayStem, dayBranch, dayBranchOptions]);

  useEffect(() => {
    if (!dayStemOptions.includes(dayStem as (typeof TIAN_GAN_OPTIONS)[number])) {
      const fallback = dayStemOptions[0];
      setDayStem(fallback);
      setPillarWarning(`日柱组合不合法，已自动修正为 ${fallback}${dayBranch}。`);
    }
  }, [dayBranch, dayStem, dayStemOptions]);

  useEffect(() => {
    if (!monthBranchOptions.includes(monthBranch as (typeof DI_ZHI_OPTIONS)[number])) {
      const fallback = monthBranchOptions[0];
      setMonthBranch(fallback);
      setPillarWarning(`月柱地支不合法，已自动修正为 ${monthStem}${fallback}。`);
    }
  }, [monthStem, monthBranch, monthBranchOptions]);

  useEffect(() => {
    if (!monthStemOptions.includes(monthStem as (typeof TIAN_GAN_OPTIONS)[number])) {
      const fallback = monthStemOptions[0];
      setMonthStem(fallback);
      setPillarWarning(`月柱已按五虎遁规则自动修正为 ${fallback}${monthBranch}。`);
    }
  }, [monthStem, monthBranch, monthStemOptions]);

  useEffect(() => {
    if (expectedMonthStem && monthStemOptions.includes(expectedMonthStem)) {
      setMonthStem(expectedMonthStem);
      setPillarWarning(`月干已按五虎遁推荐为 ${expectedMonthStem}。如需特殊录入可手动调整。`);
    }
  }, [expectedMonthStem, yearStem, monthBranch, monthStemOptions]);

  useEffect(() => {
    if (!timeBranchOptions.includes(timeBranch as (typeof DI_ZHI_OPTIONS)[number])) {
      const fallback = timeBranchOptions[0];
      setTimeBranch(fallback);
      setPillarWarning(`时柱地支不合法，已自动修正为 ${timeStem}${fallback}。`);
    }
  }, [timeStem, timeBranch, timeBranchOptions]);

  useEffect(() => {
    if (!timeStemOptions.includes(timeStem as (typeof TIAN_GAN_OPTIONS)[number])) {
      const fallback = timeStemOptions[0];
      setTimeStem(fallback);
      setPillarWarning(`时柱已按五鼠遁规则自动修正为 ${fallback}${timeBranch}。`);
    }
  }, [timeStem, timeBranch, timeStemOptions]);

  useEffect(() => {
    if (expectedTimeStem && timeStemOptions.includes(expectedTimeStem)) {
      setTimeStem(expectedTimeStem);
      setPillarWarning(`时干已按五鼠遁推荐为 ${expectedTimeStem}。如需特殊录入可手动调整。`);
    }
  }, [expectedTimeStem, dayStem, timeBranch, timeStemOptions]);

  const closestCandidateValue = useMemo(() => {
    if (!candidateDateTimes.length) {
      return "";
    }
    const targetYear = Number(referenceYear);
    if (!Number.isNaN(targetYear)) {
      return [...candidateDateTimes].sort(
        (left, right) => Math.abs(left.year - targetYear) - Math.abs(right.year - targetYear)
      )[0].value;
    }
    const currentYear = new Date().getFullYear();
    return [...candidateDateTimes].sort(
      (left, right) => Math.abs(left.year - currentYear) - Math.abs(right.year - currentYear)
    )[0].value;
  }, [candidateDateTimes, referenceYear]);

  const handleExportPoster = async () => {
    if (!resultPosterRef.current || !ganZhi) {
      return;
    }
    setIsExporting(true);
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(resultPosterRef.current, {
      backgroundColor: "#f8fafc",
      scale: 3,
      ignoreElements: (element) =>
        element.getAttribute("data-html2canvas-ignore") === "true" ||
        element.getAttribute("data-export-controls") === "true",
      onclone: (doc) => {
        const controls = doc.querySelectorAll("[data-export-controls='true']");
        controls.forEach((node) => {
          if (node instanceof HTMLElement) {
            node.style.display = "none";
          }
        });
      }
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

          <div className="grid gap-2 text-sm">
            <span>性别</span>
            <div className="inline-flex rounded-full border border-[#ddd3c5] bg-[#f8f4ed] p-1">
              <button
                type="button"
                onClick={() => setGender("男")}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  gender === "男" ? "bg-[#2f2a24] text-white" : "text-slate-600"
                }`}
              >
                男
              </button>
              <button
                type="button"
                onClick={() => setGender("女")}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  gender === "女" ? "bg-[#2f2a24] text-white" : "text-slate-600"
                }`}
              >
                女
              </button>
            </div>
          </div>
        </div>
        <div className="rounded-full border border-[#ddd3c5] bg-[#f8f4ed] p-1">
          <div className="grid grid-cols-3 gap-1 text-sm">
            <button
              type="button"
              onClick={() => setInputMode("solar")}
              className={`rounded-full px-3 py-2 transition ${
                inputMode === "solar"
                  ? "bg-[#2f2a24] text-white"
                  : "text-slate-600 hover:bg-white/60"
              }`}
            >
              公历
            </button>
            <button
              type="button"
              onClick={() => setInputMode("lunar")}
              className={`rounded-full px-3 py-2 transition ${
                inputMode === "lunar"
                  ? "bg-[#2f2a24] text-white"
                  : "text-slate-600 hover:bg-white/60"
              }`}
            >
              农历
            </button>
            <button
              type="button"
              onClick={() => setInputMode("pillars")}
              className={`rounded-full px-3 py-2 transition ${
                inputMode === "pillars"
                  ? "bg-[#2f2a24] text-white"
                  : "text-slate-600 hover:bg-white/60"
              }`}
            >
              四柱
            </button>
          </div>
        </div>

        {inputMode !== "pillars" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              {inputMode === "lunar" ? "出生日期（农历）" : "出生日期（公历）"}
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
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="grid gap-2 text-sm">
                年柱
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={yearStem}
                    onChange={(event) => setYearStem(event.target.value)}
                    className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none ring-slate-300 focus:ring"
                  >
                    {yearStemOptions.map((option) => (
                      <option key={`year-stem-${option}`} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <select
                    value={yearBranch}
                    onChange={(event) => setYearBranch(event.target.value)}
                    className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none ring-slate-300 focus:ring"
                  >
                    {yearBranchOptions.map((option) => (
                      <option key={`year-branch-${option}`} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="grid gap-2 text-sm">
                <span className="inline-flex items-center gap-1">
                  月柱
                  {expectedMonthStem ? (
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">
                      {isMonthStemLocked ? "规" : "推荐"}
                    </span>
                  ) : null}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={monthStem}
                    onChange={(event) => setMonthStem(event.target.value)}
                    disabled={isMonthStemLocked}
                    className={`w-full min-w-0 rounded-lg border px-2 py-2 text-sm outline-none ring-slate-300 focus:ring ${
                      isMonthStemLocked
                        ? "cursor-not-allowed border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-300"
                    }`}
                  >
                    {orderedMonthStemOptions.map((option) => (
                      <option key={`month-stem-${option}`} value={option}>
                        {option}
                        {expectedMonthStem === option ? "（推荐）" : ""}
                      </option>
                    ))}
                  </select>
                  <select
                    value={monthBranch}
                    onChange={(event) => setMonthBranch(event.target.value)}
                    className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none ring-slate-300 focus:ring"
                  >
                    {monthBranchOptions.map((option) => (
                      <option key={`month-branch-${option}`} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="grid gap-2 text-sm">
                日柱
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={dayStem}
                    onChange={(event) => setDayStem(event.target.value)}
                    className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none ring-slate-300 focus:ring"
                  >
                    {dayStemOptions.map((option) => (
                      <option key={`day-stem-${option}`} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <select
                    value={dayBranch}
                    onChange={(event) => setDayBranch(event.target.value)}
                    className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none ring-slate-300 focus:ring"
                  >
                    {dayBranchOptions.map((option) => (
                      <option key={`day-branch-${option}`} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="grid gap-2 text-sm">
                <span className="inline-flex items-center gap-1">
                  时柱
                  {expectedTimeStem ? (
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">
                      {isTimeStemLocked ? "规" : "推荐"}
                    </span>
                  ) : null}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={timeStem}
                    onChange={(event) => setTimeStem(event.target.value)}
                    disabled={isTimeStemLocked}
                    className={`w-full min-w-0 rounded-lg border px-2 py-2 text-sm outline-none ring-slate-300 focus:ring ${
                      isTimeStemLocked
                        ? "cursor-not-allowed border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-300"
                    }`}
                  >
                    {orderedTimeStemOptions.map((option) => (
                      <option key={`time-stem-${option}`} value={option}>
                        {option}
                        {expectedTimeStem === option ? "（推荐）" : ""}
                      </option>
                    ))}
                  </select>
                  <select
                    value={timeBranch}
                    onChange={(event) => setTimeBranch(event.target.value)}
                    className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none ring-slate-300 focus:ring"
                  >
                    {timeBranchOptions.map((option) => (
                      <option key={`time-branch-${option}`} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={strictRuleMode}
                onChange={(event) => setStrictRuleMode(event.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              严格模式（锁定月干/时干推荐结果）
            </label>
            {pillarWarning ? <p className="text-xs text-red-500">{pillarWarning}</p> : null}
            <div className="rounded-lg border border-[#e6ded2] bg-[#fbf8f3] px-3 py-2.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm">
                  <span>公历出生日期（基准）</span>
                  <input
                    name="referenceSolarDateTime"
                    type="datetime-local"
                    value={referenceSolarDateTime}
                    onChange={(event) => setReferenceSolarDateTime(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none ring-slate-300 focus:ring"
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span>参考年份（可手输）</span>
                  <input
                    name="referenceYear"
                    type="number"
                    value={referenceYear}
                    onChange={(event) => {
                      const nextYear = event.target.value;
                      setReferenceYear(nextYear);
                      if (referenceSolarDateTime) {
                        const timePart = referenceSolarDateTime.includes("T")
                          ? referenceSolarDateTime.split("T")[1]
                          : "12:00";
                        const monthDayPart =
                          referenceSolarDateTime.length >= 10
                            ? referenceSolarDateTime.slice(5, 10)
                            : "01-01";
                        setReferenceSolarDateTime(`${nextYear}-${monthDayPart}T${timePart}`);
                      }
                    }}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none ring-slate-300 focus:ring"
                  />
                </label>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <label className="grid gap-1 text-xs text-slate-600">
                  <span>查找范围起始年</span>
                  <input
                    type="number"
                    value={searchStartYear}
                    onChange={(event) => setSearchStartYear(event.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none ring-slate-300 focus:ring"
                  />
                </label>
                <label className="grid gap-1 text-xs text-slate-600">
                  <span>查找范围结束年</span>
                  <input
                    type="number"
                    value={searchEndYear}
                    onChange={(event) => setSearchEndYear(event.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none ring-slate-300 focus:ring"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleFindCandidateYears}
                  className="h-9 self-end rounded-md border border-[#c8ad8f] bg-white px-3 text-sm text-[#6a4729] transition hover:bg-[#f7efe4]"
                >
                  搜索匹配日期
                </button>
              </div>
              {candidateDateTimes.length ? (
                <div className="mt-3 space-y-2">
                  <h4 className="text-sm font-medium text-slate-700">候选日期</h4>
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {candidateDateTimes.map((candidate) => {
                      const isSelected = candidate.value === referenceSolarDateTime;
                      const isClosest = candidate.value === closestCandidateValue;
                      const hasReferenceYear = !Number.isNaN(Number(referenceYear));
                      return (
                        <button
                          key={candidate.value}
                          type="button"
                          onClick={() => {
                            setReferenceSolarDateTime(candidate.value);
                            setReferenceYear(`${candidate.year}`);
                            const [nextDate = "", nextTime = ""] = candidate.value.split("T");
                            setBirthDate(nextDate);
                            setBirthTime(nextTime);
                          }}
                          className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                            isSelected
                              ? "border-2 border-blue-500 bg-blue-50"
                              : "border border-slate-200 bg-gray-50 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm text-slate-800">{candidate.solarLabel}</p>
                            <p className="shrink-0 text-xs text-slate-500">农历：{candidate.lunarLabel}</p>
                          </div>
                          {isClosest ? (
                            <span
                              className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] ${
                                hasReferenceYear
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {hasReferenceYear ? "最接近参考年" : "推荐"}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-gray-50 px-3 py-3 text-xs text-slate-500">
                  {hasSearchedCandidates
                    ? "未找到匹配日期，请检查干支组合是否正确。"
                    : "正在根据干支搜索匹配的日期..."}
                </div>
              )}
              {searchHint ? <p className="mt-1 text-xs text-slate-500">{searchHint}</p> : null}
              <p className="mt-1 text-xs text-slate-500">
                此时间仅用于计算起运时间与流年展示，排盘核心仍以四柱干支为准。
              </p>
              <p className="mt-1 text-xs text-slate-500">
                录入古籍案例时，建议选择一个接近的公历年份以获取参考大运。
              </p>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {ganZhi ? (
            <div
              ref={resultPosterRef}
              className="space-y-3 rounded-xl bg-slate-50 p-4"
            >
              <BaziResultPanel
                ganZhi={ganZhi}
                basicInfo={{
                  name: name.trim(),
                  gender,
                  birthDate:
                    inputMode !== "pillars"
                      ? birthDate
                      : `${pillarYear}年 ${pillarMonth}月 ${pillarDay}日 ${pillarTime}时`,
                  birthTime:
                    inputMode === "pillars"
                      ? `四柱录入${
                          referenceSolarDateTime
                            ? `（参考公历 ${referenceSolarDateTime.replace("T", " ")}）`
                            : "（未设置参考公历时间）"
                        }`
                      : birthTime
                }}
                noteStorageKey={`draft_${name.trim() || "guest"}_${inputMode}_${
                  inputMode !== "pillars"
                    ? `${birthDate}_${birthTime}`
                    : `${pillarYear}_${pillarMonth}_${pillarDay}_${pillarTime}_${
                        referenceSolarDateTime || "no_ref_time"
                      }`
                }`}
                rightActions={
                  <button
                    type="button"
                    onClick={handleExportPoster}
                    disabled={isExporting}
                    className="w-full rounded-md border border-[#c8ad8f] bg-[#fdf7ef] px-3 py-2 text-sm text-[#6a4729] transition hover:bg-[#f7efe4] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isExporting ? "正在生成海报..." : "导出图片海报"}
                  </button>
                }
              />
            </div>
          ) : (
            <p>{inputMode === "pillars" ? "请选择四柱干支后开始排盘。" : "请选择出生日期和时间后自动计算天干地支。"}</p>
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
          {isSaving ? "排盘中..." : "开始排盘"}
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
