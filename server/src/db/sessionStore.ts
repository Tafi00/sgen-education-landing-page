import { Store, type SessionData } from "express-session";
import { isDbConnectionError } from "./connectionErrors.js";

const RETRY_MS = 5000;

/**
 * Bọc store phiên PostgreSQL để mất kết nối DB không làm hỏng request.
 *
 * express-session lưu phiên khi response kết thúc: nó gửi header trước rồi mới chờ `set()`,
 * nên lỗi lưu phiên được đẩy vào `next(err)` sau khi đã trả lời và gây `ERR_HTTP_HEADERS_SENT`,
 * đồng thời giữ byte cuối của mọi response đến hết thời gian chờ kết nối.
 *
 * Khi gặp lỗi kết nối, store phát `disconnect` để express-session tạm phục vụ không có phiên
 * (giữ nguyên cookie, không treo request), rồi thử lại định kỳ và phát `connect` khi DB hồi phục.
 * Lỗi kết nối lúc ghi/xoá phiên chỉ được ghi log vì response đã gửi xong.
 */
export class ResilientSessionStore extends Store {
  private available = true;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly inner: Store,
    private readonly probe: () => Promise<unknown>,
    private readonly retryMs = RETRY_MS,
  ) {
    super();
  }

  get(sid: string, callback: (err: unknown, session?: SessionData | null) => void) {
    // Lỗi đọc phiên xảy ra trước khi trả lời: chuyển tiếp để errorHandler trả 503 (giữ cookie cũ).
    this.inner.get(sid, (err, session) => {
      if (err) this.noteConnectionError(err);
      callback(err, session);
    });
  }

  set(sid: string, session: SessionData, callback?: (err?: unknown) => void) {
    this.inner.set(sid, session, (err) => callback?.(this.absorb(err)));
  }

  touch(sid: string, session: SessionData, callback?: (err?: unknown) => void) {
    if (!this.inner.touch) {
      callback?.();
      return;
    }
    this.inner.touch(sid, session, ((err?: unknown) => callback?.(this.absorb(err))) as () => void);
  }

  destroy(sid: string, callback?: (err?: unknown) => void) {
    this.inner.destroy(sid, (err) => callback?.(this.absorb(err)));
  }

  /** Đánh dấu DB chưa sẵn sàng (vd. lúc khởi động), gọi sau khi đã gắn store vào express-session. */
  markUnavailable(reason = "chưa kết nối") {
    this.goOffline(reason);
  }

  /** Lỗi kết nối khi ghi phiên: bỏ qua (đã ghi log); lỗi khác vẫn trả về để không che lỗi thật. */
  private absorb(err: unknown) {
    if (!err) return undefined;
    return this.noteConnectionError(err) ? undefined : err;
  }

  private noteConnectionError(err: unknown) {
    if (!isDbConnectionError(err)) return false;
    this.goOffline(err instanceof Error ? err.message : String(err));
    return true;
  }

  private goOffline(reason: string) {
    if (!this.available) return;
    this.available = false;
    console.warn(`[session] mất kết nối PostgreSQL, tạm phục vụ không có phiên: ${reason}`);
    this.emit("disconnect");
    this.scheduleProbe();
  }

  private scheduleProbe() {
    if (this.retryTimer) return;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.probe().then(
        () => {
          this.available = true;
          console.info("[session] đã kết nối lại PostgreSQL, bật lại phiên đăng nhập");
          this.emit("connect");
        },
        () => this.scheduleProbe(),
      );
    }, this.retryMs);
    this.retryTimer.unref?.();
  }
}
