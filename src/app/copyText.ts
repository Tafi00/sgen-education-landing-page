/** Sao chép vào bộ nhớ tạm; trình duyệt chặn Clipboard API (trình duyệt nhúng, trang không HTTPS) thì dùng cách cũ. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}
