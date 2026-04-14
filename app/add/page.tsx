"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getGanZhiFromBirthTime } from "@/lib/bazi";

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

export default function AddRecordPage() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [gender, setGender] = useState<"男" | "女">("男");
  const ganZhi = useMemo(
    () => getGanZhiFromBirthTime(birthDate, birthTime, gender),
    [birthDate, birthTime, gender]
  );

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

      <form className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">
            姓名
            <input
              name="name"
              type="text"
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
            <div className="relative space-y-3 rounded-lg border border-zinc-300 bg-white p-0 font-['Songti_SC','STSong','Noto_Serif_SC',serif] text-slate-800">
              <div className="grid grid-cols-4 rounded-t-lg bg-zinc-900 text-center text-sm text-zinc-300">
                <span className="border-r border-zinc-700 py-2">基本信息</span>
                <span className="border-r border-zinc-700 bg-zinc-800 py-2 text-white">基本排盘</span>
                <span className="border-r border-zinc-700 py-2">专业细盘</span>
                <span className="py-2">断事笔记</span>
              </div>
              <div className="overflow-x-auto px-3 pb-1">
                <div className="grid min-w-[760px] grid-cols-[72px_repeat(6,minmax(0,1fr))] border border-zinc-200 text-center">
                  <div className="border-b border-r border-zinc-200 bg-zinc-100 py-2 text-xs text-zinc-500">
                    项目
                  </div>
                  {[
                    { label: "流年", value: ganZhi.currentLiuNian },
                    { label: "大运", value: ganZhi.currentDaYun?.ganZhi ?? "--" },
                    { label: "年柱", value: ganZhi.year },
                    { label: "月柱", value: ganZhi.month },
                    { label: "日柱", value: ganZhi.day },
                    { label: "时柱", value: ganZhi.time }
                  ].map((column) => (
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

                  <div className="border-r border-zinc-200 bg-zinc-50 py-2 text-zinc-500">长生</div>
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
              </div>
              <div className="space-y-2 rounded-md border border-[#c8ad8f] bg-[#f8f4ef] p-3 text-xs text-slate-700">
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
                <div className="grid gap-2 pt-1 sm:grid-cols-2">
                  {ganZhi.daYun.map((item) => {
                    const isCurrent = ganZhi.currentDaYun?.index === item.index;

                    return (
                      <div
                        key={`${item.index}-${item.ganZhi}`}
                        className={`relative rounded-md border px-2 py-2 transition-colors ${
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
                  <div className="grid gap-2 sm:grid-cols-3">
                    {ganZhi.liuNian.map((item) => {
                      const isCurrent = item.ganZhi === ganZhi.currentLiuNian;
                      return (
                        <div
                          key={`liunian-${item.startYear}-${item.ganZhi}`}
                          className={`relative rounded-md border px-2 py-2 ${
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
            placeholder="例如：关注事业发展、婚恋走势等"
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-300 focus:ring"
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          保存记录（示例）
        </button>
      </form>
    </section>
  );
}
