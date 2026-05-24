/**
 * One-time migration script: hash all plain-text passwords in the database.
 * Run once with: npx tsx prisma/hash-passwords.ts
 * Safe to run multiple times — already-hashed passwords are skipped.
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  const users = await prisma.users.findMany({ select: { id: true, password: true } });

  console.log(`Found ${users.length} user(s). Checking passwords...`);

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    const alreadyHashed = user.password.startsWith("$2a$") || user.password.startsWith("$2b$");

    if (alreadyHashed) {
      skipped++;
      continue;
    }

    const hashed = await bcrypt.hash(user.password, SALT_ROUNDS);
    await prisma.users.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    migrated++;
    console.log(`  ✓ User ${user.id} migrated`);
  }

  console.log(`\nDone. Migrated: ${migrated} | Already hashed: ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
