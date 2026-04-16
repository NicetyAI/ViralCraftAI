import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_DEMO_SEED !== "true"
  ) {
    console.warn(
      "Skipping demo seed in production. Set ALLOW_DEMO_SEED=true to run.",
    );
    return;
  }

  const user = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      email: "owner@example.com",
      name: "Demo Owner",
    },
  });

  await prisma.agencyWorkspace.upsert({
    where: { ownerUserId: user.id },
    update: {},
    create: {
      name: "Demo Agency",
      ownerUserId: user.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
