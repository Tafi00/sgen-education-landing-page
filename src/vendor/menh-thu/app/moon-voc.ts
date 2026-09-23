// @ts-nocheck
import { Body, Ecliptic, EclipticGeoMoon, GeoVector, Observer, SearchHourAngle } from "astronomy-engine";
import { REFERENCE_MOON_VOC_PERIODS } from "./reference-moon-voc.generated.ts";

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

const CLASSICAL_BODIES = [
  { body: Body.Sun, label: "Mặt Trời" },
  { body: Body.Mercury, label: "Sao Thủy" },
  { body: Body.Venus, label: "Sao Kim" },
  { body: Body.Mars, label: "Sao Hỏa" },
  { body: Body.Jupiter, label: "Sao Mộc" },
  { body: Body.Saturn, label: "Sao Thổ" },
] as const;

const ASPECTS = [
  { angle: 0, label: "giao hội" },
  { angle: 60, label: "lục hợp" },
  { angle: 90, label: "vuông góc" },
  { angle: 120, label: "tam hợp" },
  { angle: 180, label: "đối đỉnh" },
] as const;

const DIRECTED_ASPECT_ANGLES = [0, 60, 90, 120, 180, 240, 270, 300] as const;
const ZODIAC_SIGNS = [
  "Bạch Dương", "Kim Ngưu", "Song Tử", "Cự Giải", "Sư Tử", "Xử Nữ",
  "Thiên Bình", "Bọ Cạp", "Nhân Mã", "Ma Kết", "Bảo Bình", "Song Ngư",
] as const;

type ExactAspect = {
  time: Date;
  body: string;
  aspect: string;
};

export type MoonVocInterval = {
  startIso: string;
  endIso: string;
  startMinute: number;
  endMinute: number;
  displayRange: string;
  nextSign: string;
  previousAspect: null | {
    body: string;
    aspect: string;
    timeLabel: string;
  };
};

export type MoonVocProfile = {
  date: string;
  hasVoidOfCourse: boolean;
  isVoidAtNoon: boolean;
  intervals: MoonVocInterval[];
};

export type SolarHourRange = {
  startMinute: number;
  endMinute: number;
  displayRange: string;
  crossesDayBoundary: boolean;
};

export type LocalSolarTimeProfile = {
  solarNoonMinute: number;
  solarNoonLabel: string;
  correctionMinutes: number;
  hourRanges: SolarHourRange[];
};

const moonVocCache = new Map<string, MoonVocProfile>();
const solarTimeCache = new Map<string, LocalSolarTimeProfile>();

// The annual reference tables start in 2026 and end in 2028. These two raw
// UTC rows are needed when the website projects adjacent UTC data onto the
// first and last Vietnam-local calendar days in that range.
const REFERENCE_MOON_VOC_BOUNDARY_PERIODS: Record<string, readonly string[]> = {
  "2025-12-31": ["12:28-13:13 (Song Tử)"],
  "2029-01-01": ["18:05-23:59 (Sư Tử)"],
};

const normalizeDegrees = (value: number) => ((value % 360) + 360) % 360;
const signedAngle = (value: number) => {
  const normalized = normalizeDegrees(value);
  return normalized > 180 ? normalized - 360 : normalized;
};

function moonLongitude(time: Date) {
  return EclipticGeoMoon(time).lon;
}

function bodyLongitude(body: Body, time: Date) {
  return Ecliptic(GeoVector(body, time, true)).elon;
}

function relativeLongitude(body: Body, time: Date) {
  return normalizeDegrees(moonLongitude(time) - bodyLongitude(body, time));
}

function moonSign(time: Date) {
  return Math.floor(moonLongitude(time) / 30) % 12;
}

function localDayBounds(date: string, utcOffset: number) {
  const [year, month, day] = date.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day) - utcOffset * HOUR_MS);
  return { start, end: new Date(start.getTime() + DAY_MS) };
}

function localTimeLabel(time: Date, utcOffset: number) {
  const local = new Date(time.getTime() + utcOffset * HOUR_MS);
  return `${String(local.getUTCHours()).padStart(2, "0")}:${String(local.getUTCMinutes()).padStart(2, "0")}`;
}

function minuteLabel(minute: number) {
  const normalized = ((minute % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

function offsetDateKey(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function rawReferencePeriods(date: string) {
  return REFERENCE_MOON_VOC_PERIODS[date] ?? REFERENCE_MOON_VOC_BOUNDARY_PERIODS[date] ?? [];
}

function utcMinuteLabel(time: number) {
  const value = new Date(time);
  return `${String(value.getUTCHours()).padStart(2, "0")}:${String(value.getUTCMinutes()).padStart(2, "0")}`;
}

function referenceMoonVocProfile(date: string, utcOffset: number): MoonVocProfile {
  const { start: dayStart, end: dayEnd } = localDayBounds(date, utcOffset);
  const dayStartMs = dayStart.getTime();
  const dayEndMs = dayEnd.getTime();
  const intervals = [-1, 0, 1].flatMap((dayOffset) => {
    const referenceDate = offsetDateKey(date, dayOffset);
    const [year, month, day] = referenceDate.split("-").map(Number);
    return rawReferencePeriods(referenceDate).flatMap((period) => {
      const match = period.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2}) \((.+)\)$/);
      if (!match) return [];
      const [, startHour, startMinutePart, endHour, endMinutePart, nextSign] = match;

      // The source JSON stores UTC clock values. The reference website first
      // adds the location offset, then intersects rows from the previous,
      // current and next UTC dates with the selected local calendar day.
      const shiftedStart = Date.UTC(year, month - 1, day, Number(startHour), Number(startMinutePart)) + utcOffset * HOUR_MS;
      const shiftedEnd = Date.UTC(year, month - 1, day, Number(endHour), Number(endMinutePart)) + utcOffset * HOUR_MS;
      const visibleStart = Math.max(shiftedStart, dayStartMs);
      const visibleEnd = Math.min(shiftedEnd, dayEndMs);
      if (visibleStart >= visibleEnd) return [];

      const displayStart = visibleStart === dayStartMs ? "00:00" : utcMinuteLabel(visibleStart);
      const displayEnd = visibleEnd === dayEndMs ? "23:59" : utcMinuteLabel(visibleEnd);
      const displayStartMinute = Number(displayStart.slice(0, 2)) * 60 + Number(displayStart.slice(3));
      const displayEndMinute = Number(displayEnd.slice(0, 2)) * 60 + Number(displayEnd.slice(3));

      // A projected row ending exactly at 00:00 can touch the following
      // source date without contributing any displayed time to that date.
      // Do not turn that boundary-only contact into a phantom 00:00–00:00
      // Moon VOC interval.
      if (displayStartMinute === displayEndMinute) return [];

      return [{
        startIso: new Date(visibleStart).toISOString(),
        endIso: new Date(visibleEnd).toISOString(),
        startMinute: displayStartMinute,
        endMinute: displayEndMinute,
        displayRange: `${displayStart}–${displayEnd}`,
        nextSign,
        previousAspect: null,
      } satisfies MoonVocInterval];
    });
  }).sort((left, right) => left.displayRange.localeCompare(right.displayRange));
  return {
    date,
    hasVoidOfCourse: intervals.length > 0,
    isVoidAtNoon: intervals.some((interval) => interval.startMinute <= 720 && interval.endMinute > 720),
    intervals,
  };
}

/**
 * Tính chính ngọ biểu kiến và biên mười hai thời thần theo tọa độ Hà Nội.
 * Khi chính ngọ đến sớm hoặc muộn, toàn bộ các thời thần dịch cùng số phút đó.
 */
export function getLocalSolarTimeProfile(
  date: string,
  latitude = 21.0285,
  longitude = 105.8333,
  utcOffset = 7,
): LocalSolarTimeProfile {
  const cacheKey = `${date}|${latitude.toFixed(4)}|${longitude.toFixed(4)}|${utcOffset}`;
  const cached = solarTimeCache.get(cacheKey);
  if (cached) return cached;

  const { start } = localDayBounds(date, utcOffset);
  const observer = new Observer(latitude, longitude, 0);
  const transit = SearchHourAngle(Body.Sun, observer, 0, start, 1).time.date;
  const localTransit = new Date(transit.getTime() + utcOffset * HOUR_MS);
  const solarNoonMinute = localTransit.getUTCHours() * 60 + localTransit.getUTCMinutes();
  const correctionMinutes = solarNoonMinute - 12 * 60;
  const hourRanges = Array.from({ length: 12 }, (_, index) => {
    const startMinute = (index === 0 ? -60 : index * 120 - 60) + correctionMinutes;
    const endMinute = (index === 0 ? 60 : index * 120 + 60) + correctionMinutes;
    return {
      startMinute,
      endMinute,
      displayRange: `${minuteLabel(startMinute)}–${minuteLabel(endMinute)}`,
      crossesDayBoundary: startMinute < 0 || endMinute >= 1440,
    };
  });
  const profile = {
    solarNoonMinute,
    solarNoonLabel: minuteLabel(solarNoonMinute),
    correctionMinutes,
    hourRanges,
  };
  solarTimeCache.set(cacheKey, profile);
  return profile;
}

function findMoonIngress(leftStart: Date, rightStart: Date, oldSign: number) {
  let left = leftStart.getTime();
  let right = rightStart.getTime();
  for (let iteration = 0; iteration < 42; iteration += 1) {
    const middle = (left + right) / 2;
    if (moonSign(new Date(middle)) === oldSign) left = middle;
    else right = middle;
  }
  return new Date(right);
}

function findMoonIngresses(rangeStart: Date, rangeEnd: Date) {
  const ingresses: Date[] = [];
  const step = 3 * HOUR_MS;
  let previousTime = new Date(rangeStart);
  let previousSign = moonSign(previousTime);

  for (let time = rangeStart.getTime() + step; time <= rangeEnd.getTime(); time += step) {
    const currentTime = new Date(time);
    const currentSign = moonSign(currentTime);
    if (currentSign !== previousSign) {
      ingresses.push(findMoonIngress(previousTime, currentTime, previousSign));
    }
    previousTime = currentTime;
    previousSign = currentSign;
  }
  return ingresses;
}

function aspectLabel(directedAngle: number) {
  const exactAngle = Math.min(directedAngle, 360 - directedAngle);
  return ASPECTS.find((aspect) => aspect.angle === exactAngle)?.label ?? "góc chính";
}

function refineAspect(
  body: Body,
  leftStart: Date,
  rightStart: Date,
  leftLongitude: number,
  targetLongitude: number,
) {
  let left = leftStart.getTime();
  let right = rightStart.getTime();
  let unwrappedLeft = leftLongitude;

  for (let iteration = 0; iteration < 38; iteration += 1) {
    const middle = (left + right) / 2;
    const rawMiddle = relativeLongitude(body, new Date(middle));
    const unwrappedMiddle = unwrappedLeft + signedAngle(rawMiddle - normalizeDegrees(unwrappedLeft));
    if (unwrappedMiddle < targetLongitude) {
      left = middle;
      unwrappedLeft = unwrappedMiddle;
    } else {
      right = middle;
    }
  }
  return new Date(right);
}

function findAspects(segmentStart: Date, segmentEnd: Date) {
  const results: ExactAspect[] = [];
  const sampleStep = 2 * HOUR_MS;

  for (const { body, label } of CLASSICAL_BODIES) {
    let previousTime = new Date(segmentStart.getTime() + 1_000);
    let previousLongitude = relativeLongitude(body, previousTime);

    for (
      let sampleTime = Math.min(previousTime.getTime() + sampleStep, segmentEnd.getTime() - 1_000);
      sampleTime > previousTime.getTime();
      sampleTime = Math.min(sampleTime + sampleStep, segmentEnd.getTime() - 1_000)
    ) {
      const currentTime = new Date(sampleTime);
      const currentRaw = relativeLongitude(body, currentTime);
      const currentLongitude = previousLongitude + signedAngle(currentRaw - normalizeDegrees(previousLongitude));

      for (const directedAngle of DIRECTED_ASPECT_ANGLES) {
        const firstCycle = Math.floor((previousLongitude - directedAngle) / 360) - 1;
        for (let cycle = firstCycle; cycle <= firstCycle + 3; cycle += 1) {
          const target = directedAngle + cycle * 360;
          if (target > previousLongitude + 1e-7 && target <= currentLongitude + 1e-7) {
            results.push({
              time: refineAspect(body, previousTime, currentTime, previousLongitude, target),
              body: label,
              aspect: aspectLabel(directedAngle),
            });
          }
        }
      }

      if (sampleTime === segmentEnd.getTime() - 1_000) break;
      previousTime = currentTime;
      previousLongitude = currentLongitude;
    }
  }

  return results.sort((left, right) => left.time.getTime() - right.time.getTime());
}

function displayVocRange(
  actualStart: Date,
  actualEnd: Date,
  dayStart: Date,
  dayEnd: Date,
  utcOffset: number,
) {
  const startsBeforeDay = actualStart < dayStart;
  const endsAfterDay = actualEnd > dayEnd;
  const start = startsBeforeDay ? "00:00 (đang tiếp diễn)" : localTimeLabel(actualStart, utcOffset);
  const end = endsAfterDay ? "24:00 (còn tiếp)" : localTimeLabel(actualEnd, utcOffset);
  return `${start}–${end}`;
}

/**
 * Tính Moon VOC theo quy tắc truyền thống: sau góc chính cuối cùng của Mặt Trăng
 * với bảy thiên thể cổ điển và trước khi Mặt Trăng sang cung Hoàng đạo kế tiếp.
 */
export function getMoonVoidOfCourse(date: string, utcOffset = 7): MoonVocProfile {
  if (utcOffset === 7 && Object.hasOwn(REFERENCE_MOON_VOC_PERIODS, date)) {
    return referenceMoonVocProfile(date, utcOffset);
  }
  const cacheKey = `${date}|${utcOffset}`;
  const cached = moonVocCache.get(cacheKey);
  if (cached) return cached;
  const { start: dayStart, end: dayEnd } = localDayBounds(date, utcOffset);
  const ingresses = findMoonIngresses(
    new Date(dayStart.getTime() - 4 * DAY_MS),
    new Date(dayEnd.getTime() + 4 * DAY_MS),
  );
  const intervals: MoonVocInterval[] = [];

  for (let index = 0; index < ingresses.length - 1; index += 1) {
    const segmentStart = ingresses[index];
    const segmentEnd = ingresses[index + 1];
    if (segmentEnd <= dayStart || segmentStart >= dayEnd) continue;

    const aspects = findAspects(segmentStart, segmentEnd);
    const previousAspect = aspects.at(-1) ?? null;
    const vocStart = previousAspect?.time ?? segmentStart;
    if (vocStart >= dayEnd || segmentEnd <= dayStart) continue;

    const visibleStart = Math.max(vocStart.getTime(), dayStart.getTime());
    const visibleEnd = Math.min(segmentEnd.getTime(), dayEnd.getTime());
    if (visibleEnd - visibleStart < 30_000) continue;

    intervals.push({
      startIso: vocStart.toISOString(),
      endIso: segmentEnd.toISOString(),
      startMinute: Math.max(0, Math.round((visibleStart - dayStart.getTime()) / 60_000)),
      endMinute: Math.min(1440, Math.round((visibleEnd - dayStart.getTime()) / 60_000)),
      displayRange: displayVocRange(vocStart, segmentEnd, dayStart, dayEnd, utcOffset),
      nextSign: ZODIAC_SIGNS[moonSign(new Date(segmentEnd.getTime() + 1_000))],
      previousAspect: previousAspect ? {
        body: previousAspect.body,
        aspect: previousAspect.aspect,
        timeLabel: localTimeLabel(previousAspect.time, utcOffset),
      } : null,
    });
  }

  const noon = 12 * 60;
  const profile = {
    date,
    hasVoidOfCourse: intervals.length > 0,
    isVoidAtNoon: intervals.some((interval) => interval.startMinute <= noon && interval.endMinute > noon),
    intervals,
  };
  moonVocCache.set(cacheKey, profile);
  return profile;
}

export function overlapsMoonVoc(intervals: MoonVocInterval[], startMinute: number, endMinute: number) {
  const segments = (start: number, end: number): Array<[number, number]> => {
    if (end - start >= 1440) return [[0, 1440]];
    const normalizedStart = ((start % 1440) + 1440) % 1440;
    const normalizedEnd = ((end % 1440) + 1440) % 1440;
    if (normalizedStart < normalizedEnd) return [[normalizedStart, normalizedEnd]];
    if (normalizedStart > normalizedEnd) return [[normalizedStart, 1440], [0, normalizedEnd]];
    return [];
  };

  // Both a solar hour (Tý 22:48–00:48) and a Moon VOC interval can cross
  // midnight. Split each cyclic range into its civil-day portions before
  // checking overlap, so the one-segment hour wheel marks both ends correctly.
  const hourSegments = segments(startMinute, endMinute);
  return intervals.some((interval) => segments(interval.startMinute, interval.endMinute).some(([intervalStart, intervalEnd]) => (
    hourSegments.some(([hourStart, hourEnd]) => intervalStart < hourEnd && intervalEnd > hourStart)
  )));
}
