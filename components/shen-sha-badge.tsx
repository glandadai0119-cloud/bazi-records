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
  空亡: "主虚实反复，宜防计划落空。"
};

export default function ShenShaBadge({ tag, theme = "earth" }: ShenShaBadgeProps) {
  const themeClass =
    theme === "earth"
      ? "border-[#c8ad8f] bg-[#f8f4ef] text-[#7a5230]"
      : "border-slate-300 bg-white text-slate-600";
  return (
    <span
      title={SHEN_SHA_TOOLTIP_MAP[tag] ?? tag}
      className={`cursor-help rounded border px-1 py-0.5 text-[10px] ${themeClass}`}
    >
      {tag}
    </span>
  );
}
