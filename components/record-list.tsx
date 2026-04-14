"use client";

import { useRouter } from "next/navigation";
import type { BaziRecord } from "@/data/mock-records";

type RecordListProps = {
  records: BaziRecord[];
  onDelete: (id: string) => void;
};

export default function RecordList({ records, onDelete }: RecordListProps) {
  const router = useRouter();

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        暂无记录，请先添加你的第一条八字记录。
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {records.map((record) => (
        <article
          key={record.id}
          onClick={() => router.push(`/result?id=${encodeURIComponent(record.id)}`)}
          className="cursor-pointer rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold">{record.name}</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                {record.gender}
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  const shouldDelete = window.confirm("确定要删除这条记录吗？");
                  if (!shouldDelete) {
                    return;
                  }
                  onDelete(record.id);
                }}
                className="rounded px-2 py-1 text-xs text-slate-400 transition-colors hover:text-red-600"
              >
                删除
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            出生时间：{record.birthDate} {record.birthTime}
          </p>
          <p className="mt-2 text-sm text-slate-700">{record.notes}</p>
          <p className="mt-3 text-xs text-slate-500">创建日期：{record.createdAt}</p>
        </article>
      ))}
    </div>
  );
}
