const VIETNAMESE_MAP: Record<string, string> = {
  đ: "d",
  Đ: "d",
};

const COMBINING_MARKS = /[\u0300-\u036f]/g;

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[đĐ]/g, (character) => VIETNAMESE_MAP[character] ?? "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export function normalizeVietnamese(input: string) {
  return input
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[đĐ]/g, (character) => VIETNAMESE_MAP[character] ?? "d")
    .toLowerCase();
}
