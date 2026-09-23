// @ts-nocheck
import {
  analyzeSimPhongThuy,
  validateSimPhongThuyInput,
  type SimAnalysisInput,
  type SimAnalysisResult,
} from "./sim-phong-thuy-engine";

export interface TrioFullData {
  trio: string;
  combo_name?: string;
  tier?: "great" | "good" | "caution" | "danger" | "neutral";
  cuong_do?: string;
  cuong_do_stars?: string;
  cat_hung?: string;
  wuxing_rel?: string;
  note_05?: string;
  s01_tong_quan?: string;
  s02_uu_diem?: string;
  s03_nhuoc_diem?: string;
  s04_tinh_cach?: string;
  s05_tai_van?: string;
  s06_su_nghiep?: string;
  s07_tinh_cam?: string;
  s08_suc_khoe?: string;
  s09_quy_nhan?: string;
  s10_hoa_giai?: string;
  s11_ngu_hanh?: string;
  s12_vi_du?: string;
  s13_canh_bao?: string;
}

const TRIO_API_BASE = "https://api.thayungkhiem.vn/api";

export async function fetchTrioFullData(trios: string[]): Promise<TrioFullData[] | null> {
  if (!trios || trios.length === 0) return [];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(`${TRIO_API_BASE}/bcls/trio-full`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trios }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!resp.ok) return null;
    const json = await resp.json() as { data?: TrioFullData[] };
    return json.data || null;
  } catch {
    return null;
  }
}

export async function analyzeSimPhongThuyWithReference(
  input: SimAnalysisInput
): Promise<{ result: SimAnalysisResult }> {
  const validated = validateSimPhongThuyInput(input);
  if (!validated.isValid) {
    throw new RangeError(validated.error);
  }
  const result = analyzeSimPhongThuy(input);
  return { result };
}
