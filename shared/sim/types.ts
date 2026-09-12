import type { ElementName } from "../menh-thu/metaphysics";
import type { VerdictTone } from "../lookup-types";

export type SimVerdict = VerdictTone;

export type SimInput = {
  phone: string;
  birthDate?: string;
  birthTime?: string;
  gender?: "Nam" | "Nữ";
};

export type SimMethodKey = "iching" | "element" | "yin-yang" | "folk" | "personal";

export type SimMethodResult = {
  key: SimMethodKey;
  name: string;
  /** 0–100 */
  score: number;
  tone: SimVerdict;
  summary: string;
  bullets: string[];
};

export type SimReport = {
  phone: string;
  carrier: string;
  overallScore: number;
  tone: SimVerdict;
  overallSummary: string;
  hexagram: {
    lines: number[];
    primary: string;
    mutual: string;
    changing: string;
    changingLine: number;
    movingLines: number[];
  };
  elements: {
    counts: Record<ElementName, number>;
    dominant: ElementName;
    missing: ElementName[];
    lastDigitElement: ElementName | null;
  };
  yinYang: { yin: number; yang: number; balanced: boolean; note: string };
  personalFit: {
    supportElements: ElementName[];
    matchScore: number;
    tone: SimVerdict;
    note: string;
  } | null;
  methods: SimMethodResult[];
  notes: string[];
};
