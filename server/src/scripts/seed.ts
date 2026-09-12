import {
  COURSE_CATEGORY_NAMES,
  POST_CATEGORY_NAMES,
} from "../../../src/data/defaults/types.js";
import { defaultCourses, defaultPages, defaultPosts, defaultSections, defaultServices } from "../../../src/data/defaults/index.js";
import discItemsRaw from "../../../shared/quiz/content/disc-items.json";
import discResultsRaw from "../../../shared/quiz/content/disc-results.json";
import mbtiItemsRaw from "../../../shared/quiz/content/mbti-items.json";
import mbtiResultsRaw from "../../../shared/quiz/content/mbti-results.json";
import type { Doc, Model } from "../db/model.js";
import { connectDb, disconnectDb } from "../db.js";
import { env } from "../env.js";
import { Course, CourseCategory, Page, Post, PostCategory, QuizItem, QuizResult, QuizSet, Section, ServicePackage, SiteSetting } from "../models/index.js";

type SeedMode = "created" | "updated" | "skipped";

type SeedCounters = Record<SeedMode, number>;

const counters: SeedCounters = { created: 0, updated: 0, skipped: 0 };

/**
 * Ghi nội dung mặc định vào MongoDB theo kiểu idempotent: chỉ tạo khi chưa có,
 * mặc định không ghi đè nội dung admin đã sửa tay (dùng `--force` để ghi đè).
 */
async function upsertDefault<T extends Doc>(
  model: Model<T>,
  filter: Record<string, unknown>,
  data: Record<string, unknown>,
  force: boolean,
): Promise<SeedMode> {
  const existing = await model.findOne(filter);
  if (!existing) {
    await model.create(data);
    counters.created += 1;
    return "created";
  }
  if (force) {
    await model.updateOne(filter, { $set: data });
    counters.updated += 1;
    return "updated";
  }
  counters.skipped += 1;
  return "skipped";
}

async function seedSettings() {
  const existing = await SiteSetting.findOne({ singleton: "site" });
  if (existing) {
    counters.skipped += 1;
    return;
  }
  await SiteSetting.create({ singleton: "site" });
  counters.created += 1;
}

async function seedCourseCategories(force: boolean) {
  let order = 1;
  for (const [slug, name] of Object.entries(COURSE_CATEGORY_NAMES)) {
    await upsertDefault(CourseCategory, { slug }, { slug, name, order }, force);
    order += 1;
  }
}

async function seedPostCategories(force: boolean) {
  let order = 1;
  for (const [slug, name] of Object.entries(POST_CATEGORY_NAMES)) {
    await upsertDefault(PostCategory, { slug }, { slug, name, order }, force);
    order += 1;
  }
}

async function seedQuiz(key: "disc" | "mbti", force: boolean) {
  const itemSource = key === "disc" ? discItemsRaw : mbtiItemsRaw;
  const resultSource = key === "disc" ? discResultsRaw : mbtiResultsRaw;
  const set = await QuizSet.findOne({ key, version: 1 });
  const setDoc =
    set ??
    (await QuizSet.create({
      key,
      version: 1,
      title: itemSource.title,
      instructions: itemSource.instructions,
      scale: key === "disc" ? "disc-most-least" : "mbti-two-choice",
      active: true,
    }));
  if (set) counters.skipped += 1;
  else counters.created += 1;

  const existingItems = await QuizItem.countDocuments({ setId: setDoc._id });
  if (!existingItems || force) {
    if (force) await QuizItem.deleteMany({ setId: setDoc._id });
    for (const item of itemSource.items) {
      await QuizItem.create({
        setId: setDoc._id,
        itemId: item.id,
        order: item.order,
        text: item.text,
        options: item.options.map((option) => ({
          optionId: option.id,
          label: option.label,
          dimension: "dimension" in option ? String(option.dimension ?? "") : "dimension" in item ? String(item.dimension ?? "") : "",
          pole: "pole" in option ? String(option.pole ?? "") : "",
        })),
      });
    }
    counters.created += itemSource.items.length;
  } else {
    counters.skipped += 1;
  }

  const existingResults = await QuizResult.countDocuments({ key });
  if (!existingResults || force) {
    if (force) await QuizResult.deleteMany({ key });
    for (const result of resultSource) {
      await QuizResult.create({ key, ...result });
    }
    counters.created += resultSource.length;
  } else {
    counters.skipped += 1;
  }
}

/** Ghi toàn bộ nội dung mặc định; giả định kết nối MongoDB đã sẵn sàng. */
export async function seedAll(force = false) {
  await seedSettings();
  await seedCourseCategories(force);
  for (const course of defaultCourses) {
    await upsertDefault(Course, { slug: course.slug }, { ...course, status: "published" }, force);
  }
  await seedPostCategories(force);
  for (const post of defaultPosts) {
    await upsertDefault(
      Post,
      { slug: post.slug },
      { ...post, publishedAt: new Date(post.publishedAt), status: "published", author: "SGEN Education" },
      force,
    );
  }
  for (const page of defaultPages) {
    await upsertDefault(
      Page,
      { slug: page.slug },
      { slug: page.slug, title: page.title, eyebrow: page.eyebrow, accent: page.accent, description: page.description, blocks: page.blocks, status: "published" },
      force,
    );
  }
  for (const section of defaultSections) {
    await upsertDefault(Section, { key: section.key }, { ...section }, force);
  }
  for (const service of defaultServices) {
    await upsertDefault(ServicePackage, { slug: service.slug }, { ...service, status: "published" }, force);
  }
  await seedQuiz("disc", force);
  await seedQuiz("mbti", force);

  const summary = `tạo mới: ${counters.created}, cập nhật: ${counters.updated}, bỏ qua (đã có): ${counters.skipped}${force ? "" : " — dùng --force để ghi đè nội dung đã sửa"}`;
  counters.created = 0;
  counters.updated = 0;
  counters.skipped = 0;
  return summary;
}

export async function runSeed(force = false) {
  await connectDb();
  console.log(`[seed] nguồn dữ liệu: ${env.databaseUrl.replace(/\/\/[^@/]*@/, "//***@")}`);
  const summary = await seedAll(force);
  console.log(`[seed] hoàn tất — ${summary}`);
  await disconnectDb();
}

const isDirectRun = process.argv[1]?.includes("seed");
if (isDirectRun) {
  runSeed(process.argv.includes("--force")).catch((error) => {
    console.error("[seed] lỗi:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
