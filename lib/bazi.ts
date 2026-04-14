import { Solar } from "lunar-javascript";

type WuXing = "wood" | "fire" | "earth" | "metal" | "water";

type GanYinYang = "yang" | "yin";

type DaYunOrLiuNianItem = {
  index: number;
  ganZhi: string;
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  hideGanShiShenShort: string[];
  shenSha: string[];
};

type GanZhiResult = {
  year: string;
  month: string;
  day: string;
  time: string;
  full: string;
  yearShiShenGan: string;
  monthShiShenGan: string;
  dayShiShenGan: string;
  timeShiShenGan: string;
  yearShiShenZhi: string[];
  monthShiShenZhi: string[];
  dayShiShenZhi: string[];
  timeShiShenZhi: string[];
  yearHideGan: string[];
  monthHideGan: string[];
  dayHideGan: string[];
  timeHideGan: string[];
  yearDiShi: string;
  monthDiShi: string;
  dayDiShi: string;
  timeDiShi: string;
  yunStartDesc: string;
  daYun: DaYunOrLiuNianItem[];
  currentDaYun: DaYunOrLiuNianItem | null;
  currentLiuNian: string;
  liuNian: DaYunOrLiuNianItem[];
  currentLiuNianDetail: DaYunOrLiuNianItem | null;
};

const GAN_WU_XING_MAP: Record<string, WuXing> = {
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

const GAN_YIN_YANG_MAP: Record<string, GanYinYang> = {
  甲: "yang",
  乙: "yin",
  丙: "yang",
  丁: "yin",
  戊: "yang",
  己: "yin",
  庚: "yang",
  辛: "yin",
  壬: "yang",
  癸: "yin"
};

const ZHI_HIDE_GAN_MAP: Record<string, string[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "庚", "戊"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"]
};

const ELEMENT_GENERATES: Record<WuXing, WuXing> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood"
};

const ELEMENT_CONTROLS: Record<WuXing, WuXing> = {
  wood: "earth",
  fire: "metal",
  earth: "water",
  metal: "wood",
  water: "fire"
};

const TIAN_YI_GUI_REN_ZHI_MAP: Record<string, string[]> = {
  甲: ["丑", "未"],
  戊: ["丑", "未"],
  乙: ["子", "申"],
  己: ["子", "申"],
  丙: ["亥", "酉"],
  丁: ["亥", "酉"],
  庚: ["寅", "午"],
  辛: ["寅", "午"],
  壬: ["卯", "巳"],
  癸: ["卯", "巳"]
};

const TAI_JI_GUI_REN_ZHI_MAP: Record<string, string[]> = {
  甲: ["子", "午"],
  乙: ["子", "午"],
  丙: ["卯", "酉"],
  丁: ["卯", "酉"],
  戊: ["辰", "戌", "丑", "未"],
  己: ["辰", "戌", "丑", "未"],
  庚: ["寅", "亥"],
  辛: ["寅", "亥"],
  壬: ["巳", "申"],
  癸: ["巳", "申"]
};

const LU_SHEN_ZHI_MAP: Record<string, string> = {
  甲: "寅",
  乙: "卯",
  丙: "巳",
  丁: "午",
  戊: "巳",
  己: "午",
  庚: "申",
  辛: "酉",
  壬: "亥",
  癸: "子"
};

const YANG_REN_ZHI_MAP: Record<string, string> = {
  甲: "卯",
  乙: "寅",
  丙: "午",
  丁: "巳",
  戊: "午",
  己: "巳",
  庚: "酉",
  辛: "申",
  壬: "子",
  癸: "亥"
};

const SHEN_SHA_PRIORITY: Record<string, number> = {
  天乙贵人: 1,
  太极贵人: 2,
  禄神: 3,
  羊刃: 4
};

function getGanZhiParts(ganZhi: string): { gan: string; zhi: string } {
  const [gan = "", zhi = ""] = Array.from(ganZhi);
  return { gan, zhi };
}

function getShiShenByGan(dayGan: string, targetGan: string): string {
  const dayWuXing = GAN_WU_XING_MAP[dayGan];
  const targetWuXing = GAN_WU_XING_MAP[targetGan];
  const dayYinYang = GAN_YIN_YANG_MAP[dayGan];
  const targetYinYang = GAN_YIN_YANG_MAP[targetGan];

  if (!dayWuXing || !targetWuXing || !dayYinYang || !targetYinYang) {
    return "";
  }

  const samePolarity = dayYinYang === targetYinYang;
  if (dayWuXing === targetWuXing) {
    return samePolarity ? "比肩" : "劫财";
  }
  if (ELEMENT_GENERATES[dayWuXing] === targetWuXing) {
    return samePolarity ? "食神" : "伤官";
  }
  if (ELEMENT_CONTROLS[dayWuXing] === targetWuXing) {
    return samePolarity ? "偏财" : "正财";
  }
  if (ELEMENT_CONTROLS[targetWuXing] === dayWuXing) {
    return samePolarity ? "七杀" : "正官";
  }
  return samePolarity ? "偏印" : "正印";
}

function getShiShenShortName(shiShen: string): string {
  if (shiShen.includes("财")) return "财";
  if (shiShen === "正官" || shiShen === "七杀") return "官";
  if (shiShen.includes("印")) return "印";
  if (shiShen === "比肩") return "比";
  if (shiShen === "劫财") return "劫";
  if (shiShen === "食神") return "食";
  if (shiShen === "伤官") return "伤";
  return shiShen;
}

/**
 * 根据日干和地支，输出地支藏干对应的十神信息。
 */
function getHideGanShiShen(
  dayGan: string,
  zhi: string
): { hideGan: string; shiShen: string; short: string }[] {
  const hideGanList = ZHI_HIDE_GAN_MAP[zhi] ?? [];
  return hideGanList.map((hideGan) => {
    const shiShen = getShiShenByGan(dayGan, hideGan);
    return {
      hideGan,
      shiShen,
      short: getShiShenShortName(shiShen)
    };
  });
}

/**
 * 根据日干与目标干支判断常用神煞。
 */
function getShenShaTags(dayGan: string, ganZhi: string): string[] {
  const { zhi } = getGanZhiParts(ganZhi);
  const tags: string[] = [];
  if ((TIAN_YI_GUI_REN_ZHI_MAP[dayGan] ?? []).includes(zhi)) {
    tags.push("天乙贵人");
  }
  if ((TAI_JI_GUI_REN_ZHI_MAP[dayGan] ?? []).includes(zhi)) {
    tags.push("太极贵人");
  }
  if (LU_SHEN_ZHI_MAP[dayGan] === zhi) {
    tags.push("禄神");
  }
  if (YANG_REN_ZHI_MAP[dayGan] === zhi) {
    tags.push("羊刃");
  }
  return Array.from(new Set(tags)).sort(
    (left, right) =>
      (SHEN_SHA_PRIORITY[left] ?? Number.MAX_SAFE_INTEGER) -
      (SHEN_SHA_PRIORITY[right] ?? Number.MAX_SAFE_INTEGER)
  );
}

/**
 * 根据公历出生日期和时间输出四柱干支。
 */
export function getGanZhiFromBirthTime(
  birthDate: string,
  birthTime: string,
  gender: "男" | "女"
): GanZhiResult | null {
  if (!birthDate || !birthTime) {
    return null;
  }

  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);

  if (
    [year, month, day, hour, minute].some((value) => Number.isNaN(value))
  ) {
    return null;
  }

  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const eightChar = solar.getLunar().getEightChar();
  const dayGan = eightChar.getDayGan();
  const yun = eightChar.getYun(gender === "男" ? 1 : 0, 1);
  const daYun = yun
    .getDaYun(10)
    .filter((item) => item.getIndex() > 0)
    .map((item) => ({
      index: item.getIndex(),
      ganZhi: item.getGanZhi(),
      startYear: item.getStartYear(),
      endYear: item.getEndYear(),
      startAge: item.getStartAge(),
      endAge: item.getEndAge(),
      hideGanShiShenShort: getHideGanShiShen(dayGan, getGanZhiParts(item.getGanZhi()).zhi).map(
        (entry) => entry.short
      ),
      shenSha: getShenShaTags(dayGan, item.getGanZhi())
    }));
  const currentYear = new Date().getFullYear();
  const now = new Date();
  const currentSolar = Solar.fromYmdHms(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  );
  const currentDaYun =
    daYun.find(
      (item) => item.startYear <= currentYear && currentYear <= item.endYear
    ) ?? null;
  const liuNian = Array.from({ length: 7 }, (_, index) => {
    const yearOffset = index - 3;
    const targetYear = currentYear + yearOffset;
    const liuNianGanZhi = Solar.fromYmdHms(targetYear, 6, 1, 12, 0, 0)
      .getLunar()
      .getYearInGanZhiExact();
    return {
      index,
      ganZhi: liuNianGanZhi,
      startYear: targetYear,
      endYear: targetYear,
      startAge: targetYear - year + 1,
      endAge: targetYear - year + 1,
      hideGanShiShenShort: getHideGanShiShen(dayGan, getGanZhiParts(liuNianGanZhi).zhi).map(
        (entry) => entry.short
      ),
      shenSha: getShenShaTags(dayGan, liuNianGanZhi)
    };
  });
  const currentLiuNianDetail =
    liuNian.find((item) => item.ganZhi === currentSolar.getLunar().getYearInGanZhiExact()) ??
    null;

  const result = {
    year: eightChar.getYear(),
    month: eightChar.getMonth(),
    day: eightChar.getDay(),
    time: eightChar.getTime()
  };

  return {
    ...result,
    full: `${result.year} ${result.month} ${result.day} ${result.time}`,
    yearShiShenGan: eightChar.getYearShiShenGan(),
    monthShiShenGan: eightChar.getMonthShiShenGan(),
    dayShiShenGan: eightChar.getDayShiShenGan(),
    timeShiShenGan: eightChar.getTimeShiShenGan(),
    yearShiShenZhi: eightChar.getYearShiShenZhi(),
    monthShiShenZhi: eightChar.getMonthShiShenZhi(),
    dayShiShenZhi: eightChar.getDayShiShenZhi(),
    timeShiShenZhi: eightChar.getTimeShiShenZhi(),
    yearHideGan: eightChar.getYearHideGan(),
    monthHideGan: eightChar.getMonthHideGan(),
    dayHideGan: eightChar.getDayHideGan(),
    timeHideGan: eightChar.getTimeHideGan(),
    yearDiShi: eightChar.getYearDiShi(),
    monthDiShi: eightChar.getMonthDiShi(),
    dayDiShi: eightChar.getDayDiShi(),
    timeDiShi: eightChar.getTimeDiShi(),
    yunStartDesc: `起运：${yun.getStartSolar().toYmd()}（${yun.getStartYear()}年${yun.getStartMonth()}月${yun.getStartDay()}天）`,
    daYun,
    currentDaYun,
    currentLiuNian: currentSolar.getLunar().getYearInGanZhiExact(),
    liuNian,
    currentLiuNianDetail
  };
}
