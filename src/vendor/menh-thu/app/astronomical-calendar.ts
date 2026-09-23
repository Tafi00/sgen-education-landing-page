// @ts-nocheck
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as cal from '../lib/tinhmenhdo/LocalLunarCalendar.CMF-3h7G.js';

interface CalLunarDate {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeap: boolean;
  isBigMonth: boolean;
}

interface CalLunarModule {
  getLunarDate: (d: Date, tz: number) => CalLunarDate;
  getCanChiDay: (d: Date, tz: number) => [string, string];
}

const lunarLib = cal.L as unknown as CalLunarModule;

export function getAstronomicalLunarDate(
  dateStr: string,
  timeStr = '12:00',
  longitude = 105.8333,
  utcOffset = 7
) {
  void longitude;
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = (timeStr || '12:00').split(':').map(Number);
  let utcTimestamp = Date.UTC(y, m - 1, d, hh, mm) - utcOffset * 3600000;
  if (hh >= 23) {
    utcTimestamp += 3600000 * 2;
  }
  const utcDate = new Date(utcTimestamp);
  const tz = utcOffset;
  const res = lunarLib.getLunarDate(utcDate, tz);
  return {
    lunarYear: res.lunarYear,
    lunarMonth: res.lunarMonth,
    lunarDay: res.lunarDay,
    isLeap: Boolean(res.isLeap),
    isBigMonth: Boolean(res.isBigMonth),
  };
}

interface CalBaziResult {
  year: string;
  month: string;
  day: string;
  hour: string;
  solarDate: Date;
  isNextDay: boolean;
  details: {
    yearCan: string;
    yearChi: string;
    monthCan: string;
    monthChi: string;
    dayCan: string;
    dayChi: string;
    hourCan: string;
    hourChi: string;
  };
}

export function getAstronomicalFourPillars(
  dateStr: string,
  timeStr = '12:00',
  longitude = 105.8333,
  latitude = 21.0285,
  utcOffset = 7
): CalBaziResult {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = (timeStr || '12:00').split(':').map(Number);
  const utcTimestamp = Date.UTC(y, m - 1, d, hh - utcOffset, mm);
  const utcDate = new Date(utcTimestamp);
  const res = (cal.T as { calculate: (d: Date, lon: number, lat: number) => CalBaziResult }).calculate(utcDate, longitude, latitude);
  return res;
}

export function getAstronomicalDayCanChi(
  dateStr: string,
  timeStr = '12:00',
  longitude = 105.8333,
  latitude = 21.0285,
  utcOffset = 7
): [string, string] {
  const pillars = getAstronomicalFourPillars(dateStr, timeStr, longitude, latitude, utcOffset);
  return [pillars.details.dayCan, pillars.details.dayChi];
}

export function getAstronomicalTimezoneInfo(
  lat: number,
  lon: number,
  dateStr: string,
  timeStr: string = '12:00'
): { name: string; offset: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = (timeStr || '12:00').split(':').map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0));
  try {
    const info = cal.S.getTimezoneInfo(lat, lon, dt);
    return { name: info.name, offset: info.offset };
  } catch {
    return { name: 'Asia/Ho_Chi_Minh', offset: 7 };
  }
}

