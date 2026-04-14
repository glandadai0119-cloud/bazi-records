"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getGanZhiFromBirthTime,
  getGanZhiFromLunarBirthTime,
  getGanZhiFromPillars
} from "@/lib/bazi";
import type { BaziRecord } from "@/data/mock-records";
import { appendRecord } from "@/lib/records-storage";
import BaziResultPanel from "@/components/bazi-result-panel";
import { JIA_ZI_OPTIONS } from "@/lib/ganzhi-options";

export default function AddRecordPage() {
  const router = useRouter();
  const resultPosterRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState("");
  const [inputMode, setInputMode] = useState<"solar" | "lunar" | "pillars">("solar");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [pillarYear, setPillarYear] = useState("甲子");
  const [pillarMonth, setPillarMonth] = useState("甲子");
  const [pillarDay, setPillarDay] = useState("甲子");
  const [pillarTime, setPillarTime] = useState("甲子");
  const [notes, setNotes] = useState("");
  const [gender, setGender] = useState<"男" | "女">("男");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const ganZhi = useMemo(() => {
    if (inputMode === "pillars") {
      return getGanZhiFromPillars(
        {
          year: pillarYear,
          month: pillarMonth,
          day: pillarDay,
          time: pillarTime
        },
        gender
      );
    }
    if (inputMode === "lunar") {
      return getGanZhiFromLunarBirthTime(birthDate, birthTime, gender);
    }
    return getGanZhiFromBirthTime(birthDate, birthTime, gender);
  }, [inputMode, pillarYear, pillarMonth, pillarDay, pillarTime, birthDate, birthTime, gender]);

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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="grid gap-2 text-sm">
              年柱
              <select
                value={pillarYear}
                onChange={(event) => setPillarYear(event.target.value)}
                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none ring-slate-300 focus:ring"
              >
                {JIA_ZI_OPTIONS.map((option) => (
                  <option key={`year-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              月柱
              <select
                value={pillarMonth}
                onChange={(event) => setPillarMonth(event.target.value)}
                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none ring-slate-300 focus:ring"
              >
                {JIA_ZI_OPTIONS.map((option) => (
                  <option key={`month-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              日柱
              <select
                value={pillarDay}
                onChange={(event) => setPillarDay(event.target.value)}
                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none ring-slate-300 focus:ring"
              >
                {JIA_ZI_OPTIONS.map((option) => (
                  <option key={`day-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              时柱
              <select
                value={pillarTime}
                onChange={(event) => setPillarTime(event.target.value)}
                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none ring-slate-300 focus:ring"
              >
                {JIA_ZI_OPTIONS.map((option) => (
                  <option key={`time-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
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
                  birthTime: inputMode === "pillars" ? "四柱录入" : birthTime
                }}
                noteStorageKey={`draft_${name.trim() || "guest"}_${inputMode}_${
                  inputMode !== "pillars"
                    ? `${birthDate}_${birthTime}`
                    : `${pillarYear}_${pillarMonth}_${pillarDay}_${pillarTime}`
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
