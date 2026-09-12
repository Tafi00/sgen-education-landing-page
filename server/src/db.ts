import { closePool, getPool, safeConnectionString } from "./db/pool.js";
import { migrate } from "./db/migrate.js";
import { env } from "./env.js";

export type DbStatus = "disconnected" | "connecting" | "connected" | "error";

export const dbState: { status: DbStatus; lastError: string } = {
  status: "disconnected",
  lastError: "",
};

/** Kết nối PostgreSQL và áp schema (idempotent) trước khi phục vụ request. */
export async function connectDb() {
  if (dbState.status === "connected") return;
  dbState.status = "connecting";
  try {
    const client = await getPool().connect();
    client.release();
    await migrate();
    dbState.status = "connected";
    dbState.lastError = "";
    console.log(`[db] đã kết nối PostgreSQL (${safeConnectionString()})`);
  } catch (error) {
    dbState.status = "error";
    dbState.lastError = error instanceof Error ? error.message : String(error);
    console.error(`[db] không kết nối được PostgreSQL: ${dbState.lastError}`);
    throw error;
  }
}

/** Kết nối lại ở chế độ nền để server vẫn khởi động và phục vụ bản fallback khi DB chưa sẵn sàng. */
export function connectDbInBackground() {
  void env;
  const attempt = async () => {
    try {
      await connectDb();
    } catch {
      setTimeout(() => void attempt(), 5000);
    }
  };
  void attempt();
}

export async function disconnectDb() {
  if (dbState.status === "disconnected") return;
  await closePool();
  dbState.status = "disconnected";
}
