// @ts-nocheck
export interface SvgHoroData {
  cfg?: number[];
  css?: number;
  ars?: unknown[];
  [key: string]: unknown;
}

type SvgPalace = {
  ci?: unknown;
  cno?: unknown;
  zolk?: unknown;
  [key: string]: unknown;
};

const isPalaceIndex = (value: unknown): value is number => Number.isInteger(value) && Number(value) >= 0 && Number(value) < 12;
const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

function normalizeLocKiRow(value: unknown, requiredIndexes: readonly number[]) {
  const row = Array.isArray(value) ? value : [];
  let changed = !Array.isArray(value);
  const normalized = [...row];

  for (const index of requiredIndexes) {
    if (!isFiniteNumber(normalized[index])) {
      normalized[index] = 0;
      changed = true;
    }
  }

  return { changed, value: changed ? normalized : row };
}

/**
 * The bundled Tử Vi SVG renderer assumes every palace has valid Phi Hóa
 * destinations (indices 0..3 for Lộc, Quyền, Khoa, Kị, plus index 4 for
 * Tắt phi cung / disabled mode) and Lộc/Kị rows at indexes 0 and 3.
 * A partially calculated palace or missing index otherwise crashes the React
 * tree while drawing an arrow. Invalid destinations point back to their
 * source palace, which is the renderer's existing signal to skip that arrow.
 */
export function stabilizeHoroMapForSvg<T extends SvgHoroData>(raw: T): T {
  if (!Array.isArray(raw.ars)) return raw;

  const isExtendedPhiHoa = typeof raw.cfg?.[2] === "number" && raw.cfg[2] >= 4;
  const requiredLength = isExtendedPhiHoa ? 5 : 4;

  let chartChanged = false;
  const palaces = raw.ars.map((value, palaceIndex) => {
    if (!value || typeof value !== "object") return value;

    const palace = value as SvgPalace;
    const selfIndex = isPalaceIndex(palace.ci) ? palace.ci : Math.min(palaceIndex, 11);
    const currentDestinations = Array.isArray(palace.cno) ? palace.cno : [];
    const targetLength = Math.max(requiredLength, currentDestinations.length);
    let palaceChanged = !Array.isArray(palace.cno) || currentDestinations.length < targetLength;
    const destinations = Array.from({ length: targetLength }, (_, transformIndex) => {
      const destination = currentDestinations[transformIndex];
      if (isPalaceIndex(destination)) return destination;
      palaceChanged = true;
      return selfIndex;
    });

    const currentLocKi = Array.isArray(palace.zolk) ? palace.zolk : [];
    const locRow = normalizeLocKiRow(currentLocKi[0], [0, 2, 4]);
    const kiRow = normalizeLocKiRow(currentLocKi[3], [0, 2]);
    let locKi = currentLocKi;
    if (!Array.isArray(palace.zolk) || locRow.changed || kiRow.changed) {
      locKi = [...currentLocKi];
      locKi[0] = locRow.value;
      locKi[3] = kiRow.value;
      palaceChanged = true;
    }

    if (!palaceChanged) return palace;
    chartChanged = true;
    return { ...palace, cno: destinations, zolk: locKi };
  });

  if (!chartChanged) return raw;
  return Object.assign(Object.create(Object.getPrototypeOf(raw)), raw, { ars: palaces }) as T;
}

export function isHoroMapReadyForSvg(raw: SvgHoroData | null | undefined): raw is SvgHoroData & { cfg: number[]; ars: SvgPalace[] } {
  return Boolean(
    raw
    && Array.isArray(raw.cfg)
    && Array.isArray(raw.ars)
    && raw.ars.length === 12
    && raw.ars.every((palace) => palace !== null && typeof palace === "object"),
  );
}
