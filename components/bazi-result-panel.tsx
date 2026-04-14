import type { ReactNode } from "react";
import type { GanZhiResult } from "@/lib/bazi";
import BaziTable from "@/components/bazi-table";
import FortuneCards from "@/components/fortune-cards";

type BaziResultPanelProps = {
  ganZhi: GanZhiResult;
  rightActions?: ReactNode;
};

export default function BaziResultPanel({ ganZhi, rightActions }: BaziResultPanelProps) {
  return (
    <div className="relative space-y-3 rounded-lg border border-zinc-300 bg-white p-0 font-['Songti_SC','STSong','Noto_Serif_SC',serif] text-slate-800">
      <div className="grid grid-cols-4 rounded-t-lg bg-zinc-900 text-center text-sm text-zinc-300">
        <span className="border-r border-zinc-700 py-2">基本信息</span>
        <span className="border-r border-zinc-700 bg-zinc-800 py-2 text-white">基本排盘</span>
        <span className="border-r border-zinc-700 py-2">专业细盘</span>
        <span className="py-2">断事笔记</span>
      </div>
      <BaziTable ganZhi={ganZhi} />
      <FortuneCards ganZhi={ganZhi} />
      <p className="text-center text-xs tracking-[0.12em] text-slate-500">合盘：{ganZhi.full}</p>
      {rightActions ? <div className="px-3 pb-3">{rightActions}</div> : null}
    </div>
  );
}
