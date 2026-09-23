/**
 * Đồng bộ `title` + `order` của 11 khóa học mặc định theo docx 22/09/2026.
 * Chỉ chạm hai trường này — không ghi đè nội dung admin đã chỉnh.
 * Chạy: npx tsx server/src/scripts/sync-course-titles.ts
 */
import pg from "pg";
import { defaultCourses } from "../../../src/data/defaults/courses";
import { env } from "../env";

async function main() {
  const client = new pg.Client({ connectionString: env.databaseUrl });
  await client.connect();
  for (const course of defaultCourses) {
    const result = await client.query('UPDATE courses SET title=$1, "order"=$2, "updatedAt"=now() WHERE slug=$3', [course.title, course.order, course.slug]);
    console.log(`${course.slug} → ${course.order} ${course.title} (rows: ${result.rowCount})`);
  }
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
