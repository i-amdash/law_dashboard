import { PrismaClient } from '@prisma/client'

const prismadb = new PrismaClient();
async function dope() {
  await prismadb.product.updateMany({
    where: {
      id: "95c269a9-503d-4b66-91f1-5b6ba4a8002a",
    },
    data: {
      isArchived: false,
    },
  });
}

dope();
