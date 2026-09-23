// @ts-nocheck
declare module "lunar-javascript" {
  interface JieQi {
    getName(): string;
    getSolar(): SolarDate;
  }

  interface LunarTime {
    getGanZhi(): string;
    getTianShen(): string;
    getTianShenLuck(): string;
    getYi(): string[];
    getJi(): string[];
  }

  interface DaYun {
    getGanZhi(): string;
    getStartAge(): number;
    getEndAge(): number;
    getStartYear(): number;
    getEndYear(): number;
  }

  interface Yun {
    isForward(): boolean;
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getStartHour(): number;
    getDaYun(count?: number): DaYun[];
  }

  interface EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYun(gender: number, sect: number): Yun;
  }

  interface LunarDate {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getYearInGanZhi(): string;
    getYearInGanZhiExact(): string;
    getDayInGanZhiExact(): string;
    getEightChar(): EightChar;
    getPrevJie(wholeDay?: boolean): JieQi;
    getNextJie(wholeDay?: boolean): JieQi;
    getPrevJieQi(wholeDay?: boolean): JieQi;
    getZhiXing(): string;
    getXiu(): string;
    getXiuLuck(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getDayJiShen(): string[];
    getDayXiongSha(): string[];
    getDayTianShen(): string;
    getDayTianShenType(): string;
    getDayTianShenLuck(): string;
    getDayChongDesc(): string;
    getDaySha(): string;
    getDayPositionXiDesc(): string;
    getDayPositionCaiDesc(): string;
    getTimes(): LunarTime[];
    getSolar(): SolarDate;
  }

  interface SolarDate {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getLunar(): LunarDate;
  }

  export const Solar: {
    fromYmd(year: number, month: number, day: number): SolarDate;
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): SolarDate;
  };

  export const Lunar: {
    fromYmd(year: number, month: number, day: number): LunarDate;
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): LunarDate;
  };
}
