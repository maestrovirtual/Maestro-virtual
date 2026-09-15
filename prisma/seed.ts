import "dotenv/config";
import { PrismaClient, Stage, CourseType, BackgroundPattern } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { courses as mockCourses } from "../src/features/courses/data/courses";
import { stageMap, typeMap, patternMap, resolveEnum } from "../src/lib/prisma/course-enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Sembrando ${mockCourses.length} cursos desde data/courses.ts...`);

  for (const c of mockCourses) {
    const stage = resolveEnum(String(c.stage), stageMap, Object.values(Stage), undefined as unknown as Stage);
    const type = resolveEnum(c.type, typeMap, Object.values(CourseType), undefined as unknown as CourseType);
    const backgroundPattern = resolveEnum(
      c.backgroundPattern,
      patternMap,
      Object.values(BackgroundPattern),
      undefined as unknown as BackgroundPattern
    );

    if (!stage || !type || !backgroundPattern) {
      throw new Error(
        `Curso "${c.slug}" tiene un valor no mapeado (stage=${c.stage}, type=${c.type}, backgroundPattern=${c.backgroundPattern}). Agrega el caso en src/lib/prisma/course-enums.ts antes de sembrar.`
      );
    }

    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        shortDescription: c.shortDescription,
        description: c.description,
        image: c.image ?? "",
        icon: c.icon,
        video: c.video,
        color: c.color,
        type,
        stage,
        categories: c.categories,
        skills: c.skills,
        duration: c.duration,
        sessions: c.sessions ?? null,
        hoursPerSession: c.hoursPerSession ?? null,
        modality: c.modality,
        participants: c.participants,
        targetAudience: c.targetAudience,
        objective: c.objective,
        requirements: c.requirements,
        backgroundPattern,
        featured: c.featured,
        featuredOrder: c.featuredOrder ?? null,
        clickable: c.clickable,
      },
      create: {
        slug: c.slug,
        title: c.title,
        shortDescription: c.shortDescription,
        description: c.description,
        image: c.image ?? "",
        icon: c.icon,
        video: c.video,
        color: c.color,
        type,
        stage,
        categories: c.categories,
        skills: c.skills,
        duration: c.duration,
        sessions: c.sessions ?? null,
        hoursPerSession: c.hoursPerSession ?? null,
        modality: c.modality,
        participants: c.participants,
        targetAudience: c.targetAudience,
        objective: c.objective,
        requirements: c.requirements,
        backgroundPattern,
        featured: c.featured,
        featuredOrder: c.featuredOrder ?? null,
        clickable: c.clickable,
        testimonials: c.testimonials
          ? {
              create: c.testimonials.map((t) => ({
                message: t.message,
                name: t.name,
                role: t.role,
                avatar: t.avatar,
                rating: t.rating,
              })),
            }
          : undefined,
      },
    });

    console.log(`  ✓ ${c.slug}`);
  }

  console.log("Seed de cursos completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });