"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { BaziRecord } from "@/data/mock-records";
import { getGanZhiFromBirthTime } from "@/lib/bazi";
import { getStoredRecordById, removeStoredRecordById } from "@/lib/records-storage";
import BaziResultPanel from "@/components/bazi-result-panel";

export default function ResultClient() {
  const router = useRouter();
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
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">排盘结果</h2>
          <p className="mt-1 text-sm text-slate-600">查看已保存记录的专业排盘信息。</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const shouldDelete = window.confirm("确定要删除这条记录吗？");
              if (!shouldDelete) {
                return;
              }
              removeStoredRecordById(record.id);
              router.push("/");
            }}
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            删除此记录
          </button>
          <Link href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            返回记录列表
          </Link>
        </div>
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
      </article>

      {ganZhi ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <BaziResultPanel ganZhi={ganZhi} />
        </div>
      ) : (
        <section className="rounded-xl bg-white p-6 text-slate-600 shadow-sm">
          该记录缺少有效出生时间，暂无法计算排盘。
        </section>
      )}
    </section>
  );
}
