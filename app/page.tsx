"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RecordList from "@/components/record-list";
import { mockRecords, type BaziRecord } from "@/data/mock-records";
import { getStoredRecords, removeStoredRecordById } from "@/lib/records-storage";

export default function HomePage() {
  const [records, setRecords] = useState<BaziRecord[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = getStoredRecords();
    if (stored.length > 0) {
      setRecords(stored);
    } else {
      setRecords(mockRecords);
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("bazi_records", JSON.stringify(records));
  }, [records, hasHydrated]);

  const handleDeleteRecord = (id: string) => {
    const next = removeStoredRecordById(id);
    setRecords(next);
  };

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
      <RecordList records={records} onDelete={handleDeleteRecord} />
    </section>
  );
}
