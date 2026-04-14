"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { BaziRecord } from "@/data/mock-records";
import { getGanZhiFromBirthTime } from "@/lib/bazi";
import { getStoredRecordById } from "@/lib/records-storage";

export default function ResultClient() {
  const searchParams = useSearchParams();
  const recordId = searchParams.get("id") ?? "";
  const [record, setRecord] = useState<BaziRecord | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !recordId) {
      setRecord(null);
      return;
    }
    setRecord(getStoredRecordById(recordId));
  }, [recordId]);

  const ganZhi = useMemo(() => {
    if (!record) {
      return null;
    }
    return getGanZhiFromBirthTime(record.birthDate, record.birthTime, record.gender);
  }, [record]);

  if (!recordId) {
    return (
      <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <p className="text-slate-700">缺少记录 ID，请从记录列表进入详情。</p>
        <Link href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900">
          返回记录列表
        </Link>
      </section>
    );
  }

  if (!record) {
    return (
      <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <p className="text-slate-700">未找到该记录，可能已被清理或尚未保存到本地。</p>
        <Link href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900">
          返回记录列表
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">排盘结果</h2>
          <p className="mt-1 text-sm text-slate-600">查看已保存记录的基础排盘信息。</p>
        </div>
        <Link href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900">
          返回记录列表
        </Link>
      </div>

      <article className="space-y-3 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{record.name}</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
            {record.gender}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          出生时间：{record.birthDate} {record.birthTime}
        </p>
        {record.notes ? <p className="text-sm text-slate-700">备注：{record.notes}</p> : null}
        <p className="text-xs text-slate-500">创建日期：{record.createdAt}</p>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          {ganZhi ? (
            <div className="space-y-1">
              <p>年柱：{ganZhi.year}</p>
              <p>月柱：{ganZhi.month}</p>
              <p>日柱：{ganZhi.day}</p>
              <p>时柱：{ganZhi.time}</p>
              <p className="text-slate-500">合盘：{ganZhi.full}</p>
            </div>
          ) : (
            <p className="text-slate-600">该记录缺少有效出生时间，暂无法计算排盘。</p>
          )}
        </div>
      </article>
    </section>
  );
}
