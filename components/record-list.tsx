import Link from "next/link";
import type { BaziRecord } from "@/data/mock-records";

type RecordListProps = {
  records: BaziRecord[];
};

export default function RecordList({ records }: RecordListProps) {
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
        <Link
          key={record.id}
          href={`/result?id=${encodeURIComponent(record.id)}`}
          className="block rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        >
          <article className="cursor-pointer">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{record.name}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                {record.gender}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              出生时间：{record.birthDate} {record.birthTime}
            </p>
            <p className="mt-2 text-sm text-slate-700">{record.notes}</p>
            <p className="mt-3 text-xs text-slate-500">创建日期：{record.createdAt}</p>
          </article>
        </Link>
      ))}
    </div>
  );
}
