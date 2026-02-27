import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { authOptions } from "../../auth/[...nextauth]/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET : Récupérer un secteur spécifique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const secteur = await prisma.secteur.findUnique({
    where: { id },
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

  if (!secteur) {
    return NextResponse.json({ error: "Secteur non trouvé" }, { status: 404 });
  }

  return NextResponse.json(secteur);
}

// PUT : Modifier un secteur
export async function PUT(
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
    const { nom } = body;

    if (!nom) {
      return NextResponse.json({ error: "Le nom du secteur est requis" }, { status: 400 });
    }

    const secteur = await prisma.secteur.update({
      where: { id },
      data: { nom }
    });

    return NextResponse.json(secteur);
  } catch (error) {
    console.error("Erreur modification secteur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE : Supprimer un secteur
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

    // Vérifier si le secteur a des dashboards
    const secteur = await prisma.secteur.findUnique({
      where: { id },
      include: { dashboards: true }
    });

    if (!secteur) {
      return NextResponse.json({ error: "Secteur non trouvé" }, { status: 404 });
    }

    if (secteur.dashboards.length > 0) {
      return NextResponse.json({ 
        error: "Impossible de supprimer ce secteur car il contient des dashboards" 
      }, { status: 400 });
    }

    await prisma.secteur.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Secteur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression secteur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}