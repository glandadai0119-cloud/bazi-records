declare module "lunar-javascript" {
  export interface DaYun {
    getIndex(): number;
    getGanZhi(): string;
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
  }

  export interface Yun {
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getStartSolar(): {
      toYmd(): string;
    };
    getDaYun(n?: number): DaYun[];
  }

  export interface EightChar {
    getDayGan(): string;
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearShiShenGan(): string;
    getMonthShiShenGan(): string;
    getDayShiShenGan(): string;
    getTimeShiShenGan(): string;
    getYearShiShenZhi(): string[];
    getMonthShiShenZhi(): string[];
    getDayShiShenZhi(): string[];
    getTimeShiShenZhi(): string[];
    getYearHideGan(): string[];
    getMonthHideGan(): string[];
    getDayHideGan(): string[];
    getTimeHideGan(): string[];
    getYearDiShi(): string;
    getMonthDiShi(): string;
    getDayDiShi(): string;
    getTimeDiShi(): string;
    getYun(gender: 0 | 1, sect?: 1 | 2): Yun;
  }

  export interface Lunar {
    getEightChar(): EightChar;
    getYearInGanZhiExact(): string;
  }

  export class Solar {
    static fromBaZi(
      yearGanZhi: string,
      monthGanZhi: string,
      dayGanZhi: string,
      timeGanZhi: string,
      sect?: 1 | 2,
      baseYear?: number
    ): Solar[];
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number
    ): Solar;
    getYear(): number;
    getLunar(): Lunar;
  }
}
