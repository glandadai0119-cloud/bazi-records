import Link from "next/link";
import RecordList from "@/components/record-list";
import { mockRecords } from "@/data/mock-records";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">记录列表</h2>
          <p className="mt-1 text-sm text-slate-600">查看并管理你的八字排盘记录。</p>
        </div>
        <Link
          href="/add"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          添加记录
        </Link>
      </div>
      <RecordList records={mockRecords} />
    </section>
  );
}
