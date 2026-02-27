import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { authOptions } from "../../../auth/[...nextauth]/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET : Récupérer les secteurs d'un utilisateur
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const userSecteurs = await prisma.userSecteur.findMany({
    where: { userId: id },
    include: {
      secteur: true
    }
  });

  return NextResponse.json(userSecteurs.map(us => us.secteur));
}

// POST : Ajouter un secteur à un utilisateur
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { secteurId } = body;

    if (!secteurId) {
      return NextResponse.json({ error: "ID du secteur requis" }, { status: 400 });
    }

    // Vérifier si le lien existe déjà
    const existing = await prisma.userSecteur.findUnique({
      where: {
        userId_secteurId: {
          userId: id,
          secteurId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Ce secteur est déjà attribué" }, { status: 400 });
    }

    const userSecteur = await prisma.userSecteur.create({
      data: {
        userId: id,
        secteurId
      },
      include: {
        secteur: true
      }
    });

    return NextResponse.json(userSecteur, { status: 201 });
  } catch (error) {
    console.error("Erreur attribution secteur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE : Retirer un secteur d'un utilisateur
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const url = new URL(request.url);
    const secteurId = url.searchParams.get("secteurId");

    if (!secteurId) {
      return NextResponse.json({ error: "ID du secteur requis" }, { status: 400 });
    }

    await prisma.userSecteur.delete({
      where: {
        userId_secteurId: {
          userId: id,
          secteurId
        }
      }
    });

    return NextResponse.json({ message: "Secteur retiré avec succès" });
  } catch (error) {
    console.error("Erreur retrait secteur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}