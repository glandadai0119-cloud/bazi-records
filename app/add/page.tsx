"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getGanZhiFromBirthTime } from "@/lib/bazi";
import type { BaziRecord } from "@/data/mock-records";
import { appendRecord } from "@/lib/records-storage";
import BaziResultPanel from "@/components/bazi-result-panel";

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
      backgroundColor: "#f8fafc",
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
              className="space-y-3 rounded-xl bg-slate-50 p-4"
            >
              <BaziResultPanel
                ganZhi={ganZhi}
                basicInfo={{
                  name: name.trim(),
                  gender,
                  birthDate,
                  birthTime
                }}
                noteStorageKey={`draft_${name.trim() || "guest"}_${birthDate}_${birthTime}`}
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
