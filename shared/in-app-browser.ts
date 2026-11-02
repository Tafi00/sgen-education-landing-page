/**
 * Nhận biết trình duyệt nhúng trong ứng dụng (Zalo, Facebook…): bấm link trong Zalo là mở ở đây, và loại trình duyệt này
 * thường không lưu được file về điện thoại dù báo đã tải.
 */
export type InAppBrowser = { name: string; os: "android" | "ios" | "other" };

const APPS: [RegExp, string][] = [
  [/\bZalo\b/i, "Zalo"],
  [/FB_IAB|FBAN|FBAV|FBIOS/, "Facebook"],
  [/\bMessenger\b|Orca-Android/i, "Messenger"],
  [/\bInstagram\b/i, "Instagram"],
  [/\bLine\//, "LINE"],
  [/MicroMessenger/i, "WeChat"],
  [/musical_ly|TikTok|BytedanceWebview/i, "TikTok"],
];

function osOf(userAgent: string): InAppBrowser["os"] {
  if (/android/i.test(userAgent)) return "android";
  return /iphone|ipad|ipod/i.test(userAgent) ? "ios" : "other";
}

export function detectInAppBrowser(userAgent: string): InAppBrowser | null {
  const os = osOf(userAgent);
  for (const [pattern, name] of APPS) if (pattern.test(userAgent)) return { name, os };
  // WebView Android của ứng dụng bất kỳ có dấu "; wv)".
  return /; wv\)/.test(userAgent) ? { name: "ứng dụng này", os } : null;
}

/** Link mở trang bằng trình duyệt thật của máy: Chrome trên Android, Safari trên iPhone (iOS 17 trở lên). */
export function openInBrowserHref(url: string, os: InAppBrowser["os"]): string | null {
  const parsed = new URL(url);
  const scheme = parsed.protocol.replace(":", "");
  const target = `${parsed.host}${parsed.pathname}${parsed.search}`;
  if (os === "android") return `intent://${target}#Intent;scheme=${scheme};action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.android.chrome;end`;
  if (os === "ios") return `x-safari-${scheme}://${target}`;
  return null;
}
