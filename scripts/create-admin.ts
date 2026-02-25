import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.create({
    data: {
      nom: "Administrateur",
      email: "admin@pedago.com",
      motDePasse: password,
      role: "ADMIN"
    }
  });
  
  console.log("✅ Admin créé :", admin.email);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());