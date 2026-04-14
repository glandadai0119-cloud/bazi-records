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
  patternAnalysis: {
    patternName: string;
    dayMasterStrength: "偏强" | "中和" | "偏弱";
    favorableElements: string[];
    summary: string;
  };
  pillarShenSha: {
    year: string[];
    month: string[];
    day: string[];
    time: string[];
  };
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

const ZHI_WU_XING_MAP: Record<string, WuXing> = {
  寅: "wood",
  卯: "wood",
  巳: "fire",
  午: "fire",
  辰: "earth",
  戌: "earth",
  丑: "earth",
  未: "earth",
  申: "metal",
  酉: "metal",
  亥: "water",
  子: "water"
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
  羊刃: 4,
  天医: 5,
  将星: 6,
  华盖: 7,
  空亡: 8
};

const ZHI_INDEX_MAP: Record<string, number> = {
  子: 0,
  丑: 1,
  寅: 2,
  卯: 3,
  辰: 4,
  巳: 5,
  午: 6,
  未: 7,
  申: 8,
  酉: 9,
  戌: 10,
  亥: 11
};

const ZHI_LIST = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const TIAN_YI_BY_MONTH_ZHI_MAP: Record<string, string> = {
  寅: "丑",
  卯: "寅",
  辰: "卯",
  巳: "辰",
  午: "巳",
  未: "午",
  申: "未",
  酉: "申",
  戌: "酉",
  亥: "戌",
  子: "亥",
  丑: "子"
};

const WU_XING_CN_MAP: Record<WuXing, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  metal: "金",
  water: "水"
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

function getPatternNameByMonth(dayGan: string, monthZhi: string): string {
  const monthHideGan = ZHI_HIDE_GAN_MAP[monthZhi] ?? [];
  const monthMainGan = monthHideGan[0] ?? "";
  const shiShen = getShiShenByGan(dayGan, monthMainGan);
  const map: Record<string, string> = {
    正官: "正官格",
    七杀: "七杀格",
    正财: "正财格",
    偏财: "偏财格",
    食神: "食神格",
    伤官: "伤官格",
    正印: "正印格",
    偏印: "偏印格",
    比肩: "建禄格",
    劫财: "劫财格"
  };
  return map[shiShen] ?? "平常格";
}

function getDayMasterStrength(
  dayGan: string,
  pillars: Array<{ gan: string; zhi: string }>
): "偏强" | "中和" | "偏弱" {
  const dayElement = GAN_WU_XING_MAP[dayGan];
  if (!dayElement) {
    return "中和";
  }
  const resourceElement = Object.entries(ELEMENT_GENERATES).find(
    ([, generated]) => generated === dayElement
  )?.[0] as WuXing | undefined;
  const controllerElement = Object.entries(ELEMENT_CONTROLS).find(
    ([, controlled]) => controlled === dayElement
  )?.[0] as WuXing | undefined;
  const wealthElement = ELEMENT_CONTROLS[dayElement];
  const outputElement = ELEMENT_GENERATES[dayElement];

  const score = pillars.reduce((total, pillar) => {
    const ganElement = GAN_WU_XING_MAP[pillar.gan];
    const zhiElement = ZHI_WU_XING_MAP[pillar.zhi];
    let current = total;
    if (ganElement === dayElement) current += 2;
    if (zhiElement === dayElement) current += 1;
    if (resourceElement && ganElement === resourceElement) current += 2;
    if (resourceElement && zhiElement === resourceElement) current += 1;
    if (controllerElement && ganElement === controllerElement) current -= 2;
    if (controllerElement && zhiElement === controllerElement) current -= 1;
    if (ganElement === wealthElement) current -= 1;
    if (zhiElement === wealthElement) current -= 1;
    if (ganElement === outputElement) current -= 1;
    if (zhiElement === outputElement) current -= 1;
    return current;
  }, 0);

  if (score >= 2) return "偏强";
  if (score <= -2) return "偏弱";
  return "中和";
}

function inferFavorableElements(
  dayGan: string,
  strength: "偏强" | "中和" | "偏弱"
): string[] {
  const dayElement = GAN_WU_XING_MAP[dayGan];
  if (!dayElement) {
    return [];
  }
  const resourceElement = Object.entries(ELEMENT_GENERATES).find(
    ([, generated]) => generated === dayElement
  )?.[0] as WuXing | undefined;
  const controllerElement = Object.entries(ELEMENT_CONTROLS).find(
    ([, controlled]) => controlled === dayElement
  )?.[0] as WuXing | undefined;
  const outputElement = ELEMENT_GENERATES[dayElement];
  const wealthElement = ELEMENT_CONTROLS[dayElement];

  if (strength === "偏弱") {
    return [dayElement, resourceElement ?? dayElement].map(
      (item) => WU_XING_CN_MAP[item]
    );
  }
  if (strength === "偏强") {
    return [outputElement, wealthElement, controllerElement ?? outputElement]
      .filter((item, index, list) => list.indexOf(item) === index)
      .map((item) => WU_XING_CN_MAP[item]);
  }
  return [dayElement, outputElement, wealthElement]
    .filter((item, index, list) => list.indexOf(item) === index)
    .map((item) => WU_XING_CN_MAP[item]);
}

function getPatternSummary(
  patternName: string,
  strength: "偏强" | "中和" | "偏弱"
): string {
  if (strength === "偏强") {
    return `此命造为${patternName}，日主偏强，格局成象，宜取泄耗制化，主行事有担当。`;
  }
  if (strength === "偏弱") {
    return `此命造为${patternName}，日主偏弱，需得生扶助身，格局方稳，主先蓄势后发。`;
  }
  return `此命造为${patternName}，日主中和，格局较稳，五行流转有序，主进退有度。`;
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

function getJiangXing(dayZhi: string): string {
  if (["申", "子", "辰"].includes(dayZhi)) return "子";
  if (["寅", "午", "戌"].includes(dayZhi)) return "午";
  if (["亥", "卯", "未"].includes(dayZhi)) return "卯";
  return "酉";
}

function getHuaGai(dayZhi: string): string {
  if (["申", "子", "辰"].includes(dayZhi)) return "辰";
  if (["寅", "午", "戌"].includes(dayZhi)) return "戌";
  if (["亥", "卯", "未"].includes(dayZhi)) return "未";
  return "丑";
}

function getKongWangZhi(dayGanZhi: string): string[] {
  const { gan, zhi } = getGanZhiParts(dayGanZhi);
  const ganIndex = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"].indexOf(gan);
  const zhiIndex = ZHI_INDEX_MAP[zhi];
  if (ganIndex < 0 || zhiIndex === undefined) {
    return [];
  }
  const diff = (zhiIndex - ganIndex + 12) % 12;
  const xunStartIndex = (12 + zhiIndex - diff) % 12;
  const kongWang1 = ZHI_LIST[(xunStartIndex + 10) % 12];
  const kongWang2 = ZHI_LIST[(xunStartIndex + 11) % 12];
  return [kongWang1, kongWang2];
}

function getShenShaTags(
  dayGan: string,
  dayZhi: string,
  monthZhi: string,
  dayGanZhi: string,
  ganZhi: string
): string[] {
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
  if (TIAN_YI_BY_MONTH_ZHI_MAP[monthZhi] === zhi) {
    tags.push("天医");
  }
  if (getJiangXing(dayZhi) === zhi) {
    tags.push("将星");
  }
  if (getHuaGai(dayZhi) === zhi) {
    tags.push("华盖");
  }
  if (getKongWangZhi(dayGanZhi).includes(zhi)) {
    tags.push("空亡");
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
  const dayZhi = getGanZhiParts(eightChar.getDay()).zhi;
  const monthZhi = getGanZhiParts(eightChar.getMonth()).zhi;
  const dayGanZhi = eightChar.getDay();
  const pillars = [
    getGanZhiParts(eightChar.getYear()),
    getGanZhiParts(eightChar.getMonth()),
    getGanZhiParts(eightChar.getDay()),
    getGanZhiParts(eightChar.getTime())
  ];
  const patternName = getPatternNameByMonth(dayGan, pillars[1].zhi);
  const dayMasterStrength = getDayMasterStrength(dayGan, pillars);
  const favorableElements = inferFavorableElements(dayGan, dayMasterStrength);
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
      shenSha: getShenShaTags(dayGan, dayZhi, monthZhi, dayGanZhi, item.getGanZhi())
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
      shenSha: getShenShaTags(dayGan, dayZhi, monthZhi, dayGanZhi, liuNianGanZhi)
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
    currentLiuNianDetail,
    patternAnalysis: {
      patternName,
      dayMasterStrength,
      favorableElements,
      summary: getPatternSummary(patternName, dayMasterStrength)
    },
    pillarShenSha: {
      year: getShenShaTags(dayGan, dayZhi, monthZhi, dayGanZhi, eightChar.getYear()),
      month: getShenShaTags(dayGan, dayZhi, monthZhi, dayGanZhi, eightChar.getMonth()),
      day: getShenShaTags(dayGan, dayZhi, monthZhi, dayGanZhi, eightChar.getDay()),
      time: getShenShaTags(dayGan, dayZhi, monthZhi, dayGanZhi, eightChar.getTime())
    }
  };
}
