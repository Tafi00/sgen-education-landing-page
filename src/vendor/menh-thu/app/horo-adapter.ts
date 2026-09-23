// @ts-nocheck
import { d as dayjs } from "../lib/tinhmenhdo/dayjs.min.CNW_RzbD.js";
import { u as de, t as me } from "../lib/tinhmenhdo/LocalLunarCalendar.CMF-3h7G.js";
import { D as HoroMap } from "../lib/tinhmenhdo/engine.CwhD8-6p.js";
import * as stat from "../lib/tinhmenhdo/staticData.i42p8bOT.js";

dayjs.extend(de);
dayjs.extend(me);

export const ZIWEI_BRANCHES_ORDER = ["Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn"] as const;

export const ZIWEI_COORDINATES_MAP: Record<string, readonly [number, number, number, number]> = {
  Tỵ: [29, 29, 187, 242.5],
  Ngọ: [216, 29, 187, 242.5],
  Mùi: [403, 29, 187, 242.5],
  Thân: [590, 29, 187, 242.5],
  Dậu: [590, 271.5, 187, 242.5],
  Tuất: [590, 514, 187, 242.5],
  Hợi: [590, 756.5, 187, 239.5],
  Tý: [403, 756.5, 187, 239.5],
  Sửu: [216, 756.5, 187, 239.5],
  Dần: [29, 756.5, 187, 239.5],
  Mão: [29, 514, 187, 242.5],
  Thìn: [29, 271.5, 187, 242.5],
};

export const ZIWEI_CANONICAL_BRANCHES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"] as const;

export function decompressConfig(cf: string): number[] {
  if (!cf) return [...stat.z];
  try {
    if (/^\d+$/.test(cf)) return cf.padStart(23, "0").split("").map(Number);
    const parts = cf.split("-");
    if (parts.length !== 3) return [...stat.z];
    const a = BigInt(parseInt(parts[0], 36)).toString().padStart(8, "0");
    const b = BigInt(parseInt(parts[1], 36)).toString().padStart(8, "0");
    const c = BigInt(parseInt(parts[2], 36)).toString().padStart(7, "0");
    return (a + b + c).split("").map(Number);
  } catch {
    return [...stat.z];
  }
}

export function compressConfig(cfg: number[]): string {
  try {
    const str = cfg.map(Number).join("");
    const p1 = parseInt(str.slice(0, 8)).toString(36);
    const p2 = parseInt(str.slice(8, 16)).toString(36);
    const p3 = parseInt(str.slice(16, 23)).toString(36);
    return `${p1}-${p2}-${p3}`;
  } catch {
    return "";
  }
}

export interface HoroChartInput {
  sex: 0 | 1 | "Nam" | "Nữ";
  bornDate: string; // YYYY-MM-DD
  bornTime: string; // HH:mm
  viewDate?: string; // YYYY-MM-DD
  viewTime?: string; // HH:mm
  cfg?: number[] | string;
  lat?: number;
  lon?: number;
  name?: string;
}

export interface HoroMajorStar {
  id: number;
  name: string;
  dignity: string;
  sign: "+" | "-" | "";
  mutagen?: "Lộc" | "Quyền" | "Khoa" | "Kị";
  isPromotedMinor?: boolean;
}

export interface HoroPalace {
  branchIndex: number;
  ci: number; // 0: Tý, 1: Sửu ... 11: Hợi
  branch: string; // "Tỵ", "Ngọ", ...
  canonicalBranch: string; // "Tị", "Ngọ", ...
  cn: number; // Stem index
  stem: string; // "Quý", "Giáp", ...
  na: number; // Na Yin index
  naYin: string; // "Hải Trung Kim", ...
  aid: number; // Natal Functional Palace index 0..11
  title: string; // "MỆNH", "BÀO", "PHỐI", "TỬ", "TÀI", "TẬT", "DI", "NÔ", "QUAN", "ĐIỀN", "PHÚC", "PHỤ"
  titleIndex: number;
  isBodyPalace: boolean;
  isOriginalPalace: boolean;
  majorStars: HoroMajorStar[];
  minorStars: string[];
  minorDignities: Record<string, string>;
  lifeStage: string;
  coordinate: readonly [number, number, number, number];
  decadeAge: number;
  decadeRange: readonly [number, number];
  decadeYears: Array<{ year: number; label: string; age: number }>;
  years: number[];
  smallYearBranch: string;
  virgoCode: number;
  periodStem: string;
  periodBranch: string;
  periodNumber: number;
  monthStem: string;
  monthNumber: number;
  flyingSummary: Array<{ label: string; transformIndex: number }>;
  decadeOverlayText: string;
  annualOverlayText: string;
  isCurrentDecadePalace: boolean;
  isCurrentAnnualPalace: boolean;
  tuHoaBadges: Array<{ text: string; transformIndex?: number }>;
  locKiLabels: Array<{ text: string; kind: "loc" | "ki" }>;
  visibleCurrentStars: Array<{ name: string; branch: string }>;
  visibleDaYunStars: Array<{ name: string; branch: string }>;
}

export interface HoroPillar {
  stem: string;
  branch: string;
  tenGod: string;
  lifeStage: string;
  naYin: string;
  hiddenStems: Array<{ stem: string; tenGod: string }>;
}

export interface HoroFullChart {
  rawHoro: unknown;
  info: {
    name: string;
    gender: "Nam" | "Nữ";
    genderSign: "♂" | "♀";
    age: number;
    solarBirth: { year: number; month: number; day: number; hour: number; minute: number };
    apparentBirth: { year: number; month: number; day: number; hour: number; minute: number };
    lunarBirth: { year: number; month: number; day: number; hour: number; leap: boolean; yearName: string; monthName: string; dayName: string; hourName: string };
    lunarBirthStr: string;
    solarView: { year: number; month: number; day: number; hour: number; minute: number };
    lunarViewStr: string;
    fateElement: string;
    fateNaYin: string;
    bureauElement: string;
    bureauName: string;
    bureauId: number;
    yinYangPolarity: string;
    yinYangHarmony: string;
    fateBureauRelation: string;
    soulMaster: string;
    bodyMaster: string;
    bodyPalaceBranch: string;
    bodyPalaceTitle: string;
    solarTermText: string;
    coordinatesText: string;
    chartFooterText: string;
    appVersionText: string;
  };
  pillars: HoroPillar[];
  luckPillars: Array<{
    yearRange: string;
    ageRange: string;
    stem: string;
    branch: string;
    tenGod: string;
    lifeStage: string;
    hiddenStems: Array<{ stem: string; tenGod: string }>;
  }>;
  haLac: {
    totalYang: number;
    totalYin: number;
    hoaCong: string;
    thienNguyen: string;
    diaNguyen: string;
    preHeaven: { name: string; upper: string; lower: string; lines: number[] };
    postHeaven: { name: string; upper: string; lower: string; lines: number[] };
    hoPreHeaven: { name: string; upper: string; lower: string };
    hoPostHeaven: { name: string; upper: string; lower: string };
    annualYears: Array<{ age: number; year: number; hexagramName: string; stem: string; branch: string; tenGod: string }>;
  };
  palaces: HoroPalace[];
  tuanBranches: [string, string];
  trietBranches: [string, string];
}

interface RawPillarCol {
  cht: number;
  cn: number;
  ci: number;
  ts: number;
  na: number;
  ctg?: number[];
  pht?: number[];
}

export function calculateFullHoroChart(input: HoroChartInput): HoroFullChart {
  const numericSex = input.sex === "Nam" || input.sex === 1 ? 1 : 0;
  const genderStr: "Nam" | "Nữ" = numericSex === 1 ? "Nam" : "Nữ";
  const genderSign = numericSex === 1 ? "♂" : "♀";
  const lat = input.lat ?? 21.0285;
  const lon = input.lon ?? 105.8333;
  const bornStr = `${input.bornDate} ${input.bornTime}`;
  const viewStr = `${input.viewDate || input.bornDate} ${input.viewTime || "12:00"}`;
  const cfg = Array.isArray(input.cfg) ? input.cfg : decompressConfig(input.cfg || "");

  const bornDayjs = dayjs(bornStr, "YYYY-MM-DD HH:mm");
  const viewDayjs = dayjs(viewStr, "YYYY-MM-DD HH:mm");

  const horo = new HoroMap({
    sex: numericSex,
    born: bornDayjs,
    view: viewDayjs,
    cfg: cfg,
    lat: lat,
    lon: lon,
  });

  const dtb = horo.dtb;
  const dtv = horo.dtv;
  const am = horo.am; // Mệnh branch index (0..11)
  const at = horo.at; // Thân branch index (0..11)
  const cid = horo.cid; // Cục ID (2..6)
  const age = horo.yeo;

  const BUREAU_NAMES: Record<number, string> = {
    2: "Thủy Nhị Cục",
    3: "Mộc Tam Cục",
    4: "Kim Tứ Cục",
    5: "Thổ Ngũ Cục",
    6: "Hỏa Lục Cục",
  };
  const BUREAU_ELEMENTS: Record<number, string> = {
    2: "Thủy",
    3: "Mộc",
    4: "Kim",
    5: "Thổ",
    6: "Hỏa",
  };

  const ELEMENT_RELATIONS: Record<string, Record<string, string>> = {
    Kim: { Kim: "Mệnh Cục tỷ hòa", Thủy: "Mệnh sinh Cục", Mộc: "Mệnh khắc Cục", Hỏa: "Cục khắc Mệnh", Thổ: "Cục sinh Mệnh" },
    Mộc: { Kim: "Cục khắc Mệnh", Thủy: "Cục sinh Mệnh", Mộc: "Mệnh Cục tỷ hòa", Hỏa: "Mệnh sinh Cục", Thổ: "Mệnh khắc Cục" },
    Thủy: { Kim: "Cục sinh Mệnh", Thủy: "Mệnh Cục tỷ hòa", Mộc: "Mệnh sinh Cục", Hỏa: "Mệnh khắc Cục", Thổ: "Cục khắc Mệnh" },
    Hỏa: { Kim: "Mệnh khắc Cục", Thủy: "Cục khắc Mệnh", Mộc: "Cục sinh Mệnh", Hỏa: "Mệnh Cục tỷ hòa", Thổ: "Mệnh sinh Cục" },
    Thổ: { Kim: "Mệnh sinh Cục", Thủy: "Mệnh khắc Cục", Mộc: "Cục khắc Mệnh", Hỏa: "Cục sinh Mệnh", Thổ: "Mệnh Cục tỷ hòa" },
  };

  const yearStemIdx = dtb.bs.y[0];
  const yearBranchIdx = dtb.bs.y[1];
  const yearNaYinIdx = dtb.bs.y[2];
  const fateNaYin = stat.f[yearNaYinIdx] || "";
  const fateElement = fateNaYin.slice(-4).trim() || "Kim";
  const bureauElement = BUREAU_ELEMENTS[cid] || "Thủy";
  const bureauName = BUREAU_NAMES[cid] || "Thủy Nhị Cục";
  const fateBureauRelation = ELEMENT_RELATIONS[fateElement]?.[bureauElement] || "Mệnh Cục tỷ hòa";

  const yearIsYang = yearStemIdx % 2 === 0;
  const yinYangPolarity = `${yearIsYang ? "Dương" : "Âm"} ${genderStr}`;
  const yinYangHarmony = horo.ad === 1 ? "Âm dương thuận lý" : "Âm dương nghịch lý";

  const soulMaster = stat.k[horo.mctc[0]]?.name || "Vũ Khúc";
  const bodyMaster = stat.k[horo.mctc[1]]?.name || "Thiên Cơ";
  const bodyPalaceBranch = stat.C[at] === "Tị" ? "Tỵ" : stat.C[at];
  const bodyPalaceTitle = stat.A[horo.ars[at].ai] || "MỆNH";

  const solarTermText = `Tháng ${dtb.tki[0]}tk từ ${dtb.tki[1]} đến ${dtb.tki[2]}`;
  const coordinatesText = `${lat.toFixed(4)}, ${lon.toFixed(4)} (UTC+7)`;

  const typeLsIdx = cfg[1] ?? 0;
  const canHoaIdx = (cfg[0] ?? 1) + 1;
  const tcpbIdx = (cfg[21] ?? 0) + 1;
  const chartFooterText = `Loại lá số ${typeLsIdx + 1} - ${typeLsIdx >= 6 && typeLsIdx <= 8 ? `Trung Châu Bàn ${tcpbIdx}` : `TG_1`} - Can Hóa ${canHoaIdx} - lập lúc ${dtv.sn.y}/${String(dtv.sn.m).padStart(2, "0")}/${String(dtv.sn.d).padStart(2, "0")} ${String(dtv.sn.h).padStart(2, "0")}:${String(dtv.sn.i).padStart(2, "0")}`;
  const appVersionText = `Mệnh Thư · ${stat.t[typeLsIdx] || "Mặc định"}${typeLsIdx >= 6 && typeLsIdx <= 8 ? ` · ${stat.o[cfg[21] ?? 0] || "Thiên Bàn"}` : ""} · Can hóa ${canHoaIdx} · Lưu Niên`;

  const lunarBirthStr = `Giờ ${stat.C[dtb.ln.h]} · ngày ${dtb.ln.d} · tháng ${dtb.ln.m} · năm ${stat.a[yearStemIdx]}${stat.C[yearBranchIdx]}`;
  const lunarViewStr = `Năm xem ÂL: ${stat.a[dtv.bs.y[0]]} ${stat.C[dtv.bs.y[1]]} · ${stat.a[dtv.bs.m[0]]} ${stat.C[dtv.bs.m[1]]}(${dtv.ln.m}) · ${stat.a[dtv.bs.d[0]]} ${stat.C[dtv.bs.d[1]]}(${dtv.ln.d}) · ${stat.a[dtv.bs.h[0]]} ${stat.C[dtv.bs.h[1]]}`;

  // 4 Pillars
  const rawCot = (horo.tutru?.cot || []) as RawPillarCol[];
  const pillars: HoroPillar[] = rawCot.map((col) => {
    const stem = stat.a[col.cn] || "";
    const branch = stat.C[col.ci] || "";
    const tenGod = col.cht >= 0 ? stat.u[col.cht] || "" : "Nhật chủ";
    const lifeStage = stat.a2[col.ts] || "";
    const naYin = stat.f[col.na] || "";
    const hiddenStems = (col.ctg || []).map((hStemIdx: number, hIdx: number) => ({
      stem: stat.a[hStemIdx] || "",
      tenGod: col.pht?.[hIdx] !== undefined && col.pht[hIdx] >= 0 ? stat.u[col.pht[hIdx]] || "" : "",
    }));
    return {
      stem,
      branch,
      tenGod,
      lifeStage,
      naYin,
      hiddenStems,
    };
  });

  // 10 Luck Pillars
  const rawDv = (horo.tutru?.dv || []) as Array<[number, number, number]>;
  const luckPillars = rawDv.map((d, idx) => {
    const stem = stat.a[d[0]] || "";
    const branch = stat.C[d[1]] || "";
    const startTimestamp = d[2];
    const startYear = new Date(startTimestamp * 1000).getUTCFullYear();
    const endYear = startYear + 9;
    const startAge = (idx + 1) * 10 - 2;
    const endAge = startAge + 9;
    return {
      yearRange: `${startYear}-${endYear}`,
      ageRange: `${startAge}-${endAge}t`,
      stem,
      branch,
      tenGod: "",
      lifeStage: "",
      hiddenStems: [],
    };
  });

  // Bát Tự Hà Lạc
  const haLac = {
    totalYang: 0,
    totalYin: 0,
    hoaCong: "",
    thienNguyen: "",
    diaNguyen: "",
    preHeaven: { name: "", upper: "", lower: "", lines: [] },
    postHeaven: { name: "", upper: "", lower: "", lines: [] },
    hoPreHeaven: { name: "", upper: "", lower: "" },
    hoPostHeaven: { name: "", upper: "", lower: "" },
    annualYears: [] as Array<{ age: number; year: number; hexagramName: string; stem: string; branch: string; tenGod: string }>,
  };

  // Build 12 Palaces in ZIWEI_BRANCHES_ORDER (Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi, Tý, Sửu, Dần, Mão, Thìn)
  const activeDecadePalaceIdx = horo.dvidx;
  const currentAnnualPalaceBranchIdx = dtv.bs.y[1]; // Current year branch index

  const BRANCH_TO_CI: Record<string, number> = {
    "Tý": 0, "Sửu": 1, "Dần": 2, "Mão": 3, "Thìn": 4, "Tị": 5, "Tỵ": 5,
    "Ngọ": 6, "Mùi": 7, "Thân": 8, "Dậu": 9, "Tuất": 10, "Hợi": 11,
  };

  const palaces: HoroPalace[] = ZIWEI_BRANCHES_ORDER.map((branchName, branchIndex) => {
    const canonicalBranch = branchName === "Tỵ" ? "Tị" : branchName;
    const ci = BRANCH_TO_CI[branchName] ?? 0;
    const p = horo.ars[ci];
    const pStem = stat.a[p.cn] || "";
    const pTitle = stat.A[p.ai] || "";
    const isBodyPalace = ci === at;
    const isOriginalPalace = ci === am;

    // Major stars
    const majorStars: HoroMajorStar[] = p.sb.map((sIdx: number) => {
      const sMeta = stat.k[sIdx];
      const sName = sMeta ? sMeta.name : stat.S[sIdx];
      const lvlMap = sMeta?.lvl as Record<string, string> | undefined;
      const dignity = lvlMap?.[String(ci + 1)] || "";
      const sign: "+" | "-" | "" = sMeta?.ad === 1 ? "+" : sMeta?.ad === -1 ? "-" : "";
      return {
        id: sIdx,
        name: sName,
        dignity,
        sign,
      };
    });

    // Minor stars
    const minorStars: string[] = p.ss.map((sIdx: number) => {
      const sMeta = stat.k[sIdx];
      return sMeta ? sMeta.name : stat.S[sIdx];
    }).filter(Boolean);

    // Minor star dignities
    const minorDignities: Record<string, string> = {};
    p.ss.forEach((sIdx: number) => {
      const sMeta = stat.k[sIdx];
      const lvlMap = sMeta?.lvl as Record<string, string> | undefined;
      const level = lvlMap?.[String(ci + 1)];
      if (level) {
        minorDignities[sMeta.name] = level;
      }
    });

    // Tràng sinh
    let lifeStage = "";
    p.ss.forEach((sIdx: number) => {
      if (sIdx >= 40 && sIdx <= 51) {
        lifeStage = stat.S[sIdx] || "";
      }
    });
    if (!lifeStage && p.sv && p.sv.length > 0) {
      // Find lifeStage in ss
      const validStages = stat.a2 as readonly string[];
      for (const s of p.ss) {
        const starName = stat.S[s] || "";
        if (validStages.includes(starName) || starName.startsWith("Trường") || starName.startsWith("Mộc") || starName.startsWith("Quan") || starName.startsWith("Lâm") || starName.startsWith("Đế") || starName.startsWith("Suy") || starName.startsWith("Bệnh") || starName.startsWith("Tử") || starName.startsWith("Mộ") || starName.startsWith("Tuyệt") || starName.startsWith("Thai") || starName.startsWith("Dưỡng")) {
          lifeStage = starName;
          break;
        }
      }
    }

    // Decade years & labels
    const rawYs = (p.ys || []) as Array<[number, number, number]>;
    const decadeYears = rawYs.map((yItem) => ({
      age: yItem[0],
      year: yItem[1],
      label: `${stat.a[yItem[2] / 12]?.slice(0, 1) || ""}.${yItem[0]}`,
    }));
    const years = decadeYears.map((d) => d.year);

    // Footer items
    const rawLmnp = (p.lmnp || []) as number[];
    const rawLmpt = (p.lmpt || []) as [number, [number, number]];
    const smallYearBranch = stat.C[rawLmnp[0] ?? 0]?.toUpperCase() || "";
    const virgoCode = rawLmnp[3] ?? (ci + 1);
    const periodStem = stat.a[rawLmpt[1]?.[0] ?? 0]?.slice(0, 1) || "";
    const periodBranch = stat.C[rawLmpt[1]?.[1] ?? 0] || "";
    const periodNumber = rawLmpt[0] ?? (ci + 1);

    // Month items
    const monthStem = stat.a[p.cn] || "";
    const monthNumber = ((ci - 2 + 12) % 12) + 1;

    // Flying summary (cno)
    const flyingSummary: Array<{ label: string; transformIndex: number }> = (p.cno || []).map((targetCi: number, transformIndex: number) => {
      const targetAid = horo.ars[targetCi]?.ai ?? 0;
      return {
        label: stat.A[targetAid] || "",
        transformIndex,
      };
    });

    // Overlay texts
    const decadeOverlayText = `${stat.A[p.aid]}2`;
    const annualOverlayText = `${stat.A[p.ail ?? 0]}3`;
    const isCurrentDecadePalace = ci === activeDecadePalaceIdx;
    const isCurrentAnnualPalace = ci === currentAnnualPalaceBranchIdx;

    // Tự hóa badges
    const tuHoaBadges: Array<{ text: string; transformIndex?: number }> = [];

    // Lộc Kị labels
    const locKiLabels: Array<{ text: string; kind: "loc" | "ki" }> = [];

    // Current and DaYun stars
    const visibleCurrentStars: Array<{ name: string; branch: string }> = (p.sy || []).map((sIdx: number) => ({
      name: stat.S[sIdx] || "",
      branch: branchName,
    }));

    const visibleDaYunStars: Array<{ name: string; branch: string }> = (p.sd || []).map((sIdx: number) => ({
      name: stat.S[sIdx] || "",
      branch: branchName,
    }));

    return {
      branchIndex,
      ci,
      branch: branchName,
      canonicalBranch,
      cn: p.cn,
      stem: pStem,
      na: p.na,
      naYin: stat.f[p.na] || "",
      aid: p.ai,
      title: pTitle,
      titleIndex: p.ai,
      isBodyPalace,
      isOriginalPalace,
      majorStars,
      minorStars,
      minorDignities,
      lifeStage,
      coordinate: ZIWEI_COORDINATES_MAP[branchName],
      decadeAge: p.dv,
      decadeRange: [p.dv, p.dv + 9] as const,
      decadeYears,
      years,
      smallYearBranch,
      virgoCode,
      periodStem,
      periodBranch,
      periodNumber,
      monthStem,
      monthNumber,
      flyingSummary,
      decadeOverlayText,
      annualOverlayText,
      isCurrentDecadePalace,
      isCurrentAnnualPalace,
      tuHoaBadges,
      locKiLabels,
      visibleCurrentStars,
      visibleDaYunStars,
    };
  });

  const aIdx = horo.aIdx as { tu?: [number, number]; tr?: [number, number] } | undefined;
  const tuanBranches: [string, string] = [
    stat.C[aIdx?.tu?.[0] ?? 0] === "Tị" ? "Tỵ" : stat.C[aIdx?.tu?.[0] ?? 0] || "Tý",
    stat.C[aIdx?.tu?.[1] ?? 1] === "Tị" ? "Tỵ" : stat.C[aIdx?.tu?.[1] ?? 1] || "Sửu",
  ];
  const trietBranches: [string, string] = [
    stat.C[aIdx?.tr?.[0] ?? 0] === "Tị" ? "Tỵ" : stat.C[aIdx?.tr?.[0] ?? 0] || "Tý",
    stat.C[aIdx?.tr?.[1] ?? 1] === "Tị" ? "Tỵ" : stat.C[aIdx?.tr?.[1] ?? 1] || "Sửu",
  ];

  return {
    rawHoro: horo,
    info: {
      name: input.name || "",
      gender: genderStr,
      genderSign,
      age,
      solarBirth: { year: dtb.sn.y, month: dtb.sn.m, day: dtb.sn.d, hour: dtb.sn.h, minute: dtb.sn.i },
      apparentBirth: { year: dtb.sn.ys, month: dtb.sn.ms, day: dtb.sn.ds, hour: dtb.sn.hs, minute: dtb.sn.is },
      lunarBirth: {
        year: dtb.ln.y,
        month: dtb.ln.m,
        day: dtb.ln.d,
        hour: dtb.ln.h,
        leap: false,
        yearName: `${stat.a[yearStemIdx]} ${stat.C[yearBranchIdx]}`,
        monthName: `${stat.a[dtb.bs.m[0]]} ${stat.C[dtb.bs.m[1]]}`,
        dayName: `${stat.a[dtb.bs.d[0]]} ${stat.C[dtb.bs.d[1]]}`,
        hourName: `${stat.a[dtb.bs.h[0]]} ${stat.C[dtb.bs.h[1]]}`,
      },
      lunarBirthStr,
      solarView: { year: dtv.sn.y, month: dtv.sn.m, day: dtv.sn.d, hour: dtv.sn.h, minute: dtv.sn.i },
      lunarViewStr,
      fateElement,
      fateNaYin,
      bureauElement,
      bureauName,
      bureauId: cid,
      yinYangPolarity,
      yinYangHarmony,
      fateBureauRelation,
      soulMaster,
      bodyMaster,
      bodyPalaceBranch,
      bodyPalaceTitle,
      solarTermText,
      coordinatesText,
      chartFooterText,
      appVersionText,
    },
    pillars,
    luckPillars,
    haLac,
    palaces,
    tuanBranches,
    trietBranches,
  };
}
