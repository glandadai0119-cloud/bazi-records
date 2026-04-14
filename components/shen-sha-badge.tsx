type ShenShaBadgeProps = {
  tag: string;
  theme?: "earth" | "slate";
};

const SHEN_SHA_TOOLTIP_MAP: Record<string, string> = {
  天乙贵人: "主贵人扶助，遇事多得助力。",
  太极贵人: "主悟性与慈慧，利于学艺与修为。",
  禄神: "主俸禄与资源，利于事业稳定。",
  羊刃: "主决断与冲劲，宜刚柔并济。",
  天医: "主调护与康宁，重养生与修复。",
  将星: "主领导与号召，利于掌控局面。",
  华盖: "主才华与孤高，利学术艺术。",
  空亡: "主虚实反复，宜防计划落空。",
  驿马: "主奔波变动，利出行迁移与转机。",
  桃花: "主人缘魅力，利社交情感与曝光。"
};

export default function ShenShaBadge({ tag, theme = "earth" }: ShenShaBadgeProps) {
  const tagClassMap: Record<string, string> = {
    天乙贵人: "border-violet-200 bg-violet-50 text-violet-700",
    太极贵人: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
    天医: "border-cyan-200 bg-cyan-50 text-cyan-700",
    禄神: "border-emerald-200 bg-emerald-50 text-emerald-700",
    驿马: "border-indigo-200 bg-indigo-50 text-indigo-700",
    桃花: "border-pink-200 bg-pink-50 text-pink-700",
    羊刃: "border-rose-200 bg-rose-50 text-rose-700",
    空亡: "border-slate-200 bg-slate-50 text-slate-600",
    华盖: "border-amber-200 bg-amber-50 text-amber-700",
    将星: "border-blue-200 bg-blue-50 text-blue-700"
  };
  const fallbackClass =
    theme === "earth"
      ? "border-[#c8ad8f] bg-[#f8f4ef] text-[#7a5230]"
      : "border-slate-300 bg-white text-slate-600";
  const colorClass = tagClassMap[tag] ?? fallbackClass;
  return (
    <span
      title={SHEN_SHA_TOOLTIP_MAP[tag] ?? tag}
      className={`cursor-help rounded border px-1.5 py-0.5 text-[10px] ${colorClass}`}
    >
      {tag}
    </span>
  );
}
