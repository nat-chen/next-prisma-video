import { PrismaClient } from "@prisma/client";
import example from "./json/example.json";

const prisma = new PrismaClient();

type resType = {
  title: string;
  // cover: string;
  url: string;
};

async function main() {
  const category = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Math",
    },
  });
  const chapters = example.data.outlines.reduce<resType[]>((res, item) => {
    item.lectures.forEach((lecture) => {
      res.push({
        title: lecture.title ?? lecture.en_title ?? "",
        // cover: lecture.resource.cover_url,
        url: lecture.resource.content[0].url,
      });
    });

    return res;
  }, []);

  await prisma.video.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: example.data.title,
      desc: example.data.brief,
      pic: example.data.cover_url,
      cover: example.data.cover_url,
      categoryId: category.id,
      chapter: {
        createMany: {
          data: chapters,
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
