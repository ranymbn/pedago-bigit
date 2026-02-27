import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { authOptions } from "../auth/[...nextauth]/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET : Récupérer tous les secteurs
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const secteurs = await prisma.secteur.findMany({
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              nom: true,
              email: true,
              role: true
            }
          }
        }
      }
    }
  });

  return NextResponse.json(secteurs);
}

// POST : Créer un secteur
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nom } = body;

    if (!nom) {
      return NextResponse.json({ error: "Le nom du secteur est requis" }, { status: 400 });
    }

    const secteur = await prisma.secteur.create({
      data: { nom }
    });

    return NextResponse.json(secteur, { status: 201 });
  } catch (error) {
    console.error("Erreur création secteur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}