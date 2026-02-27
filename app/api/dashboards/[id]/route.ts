import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { authOptions } from "../../auth/[...nextauth]/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET : Récupérer un dashboard spécifique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const dashboard = await prisma.dashboard.findUnique({
    where: { id },
    include: {
      secteur: true,
      kpis: {
        include: {
          valeurs: {
            orderBy: { dateMesure: "desc" },
            take: 10
          }
        }
      }
    }
  });

  if (!dashboard) {
    return NextResponse.json({ error: "Dashboard non trouvé" }, { status: 404 });
  }

  // Vérifier les permissions
  if (session.user.role !== "ADMIN") {
    const userSecteurs = await prisma.userSecteur.findMany({
      where: { userId: session.user.id },
      select: { secteurId: true }
    });
    
    const secteursIds = userSecteurs.map(us => us.secteurId);
    
    if (!secteursIds.includes(dashboard.secteurId)) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }
  }

  return NextResponse.json(dashboard);
}

// PUT : Modifier un dashboard (admin seulement)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { titre, description, urlPowerBI, secteurId } = body;

    const dashboard = await prisma.dashboard.update({
      where: { id },
      data: {
        titre,
        description,
        urlPowerBI,
        secteurId
      },
      include: { secteur: true }
    });

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Erreur modification dashboard:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE : Supprimer un dashboard (admin seulement)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Vérifier si le dashboard a des KPIs
    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
      include: { kpis: true }
    });

    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard non trouvé" }, { status: 404 });
    }

    if (dashboard.kpis.length > 0) {
      return NextResponse.json({ 
        error: "Impossible de supprimer ce dashboard car il contient des KPIs" 
      }, { status: 400 });
    }

    await prisma.dashboard.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Dashboard supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression dashboard:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}