import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { authOptions } from "../auth/[...nextauth]/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const session = await getServerSession(authOptions);

  // Vérifier que l'utilisateur est admin
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    include: {
      secteurs: {
        include: {
          secteur: true
        }
      }
    }
  });

  return NextResponse.json(users);
}