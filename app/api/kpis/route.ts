import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { authOptions } from "../auth/[...nextauth]/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET : Récupérer les KPIs (avec filtres)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const url = new URL(request.url);
  const dashboardId = url.searchParams.get("dashboardId");
  const secteurId = url.searchParams.get("secteurId");

  let whereClause: any = {};

  if (dashboardId) {
    whereClause.dashboardId = dashboardId;
  }

  // Vérifier les permissions si secteur spécifié
  if (secteurId && session.user.role !== "ADMIN") {
    const userSecteurs = await prisma.userSecteur.findMany({
      where: { userId: session.user.id },
      select: { secteurId: true }
    });
    
    const secteursIds = userSecteurs.map(us => us.secteurId);
    
    if (!secteursIds.includes(secteurId)) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }
  }

  const kpis = await prisma.kPI.findMany({
    where: whereClause,
    include: {
      dashboard: {
        include: { secteur: true }
      },
      valeurs: {
        orderBy: { dateMesure: "desc" },
        take: 10
      }
    }
  });

  return NextResponse.json(kpis);
}

// POST : Créer un KPI (admin seulement)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nom, unite, dashboardId } = body;

    if (!nom || !dashboardId) {
      return NextResponse.json({ 
        error: "Nom et dashboard requis" 
      }, { status: 400 });
    }

    const kpi = await prisma.kPI.create({
      data: {
        nom,
        unite,
        dashboardId
      },
      include: { dashboard: true }
    });

    return NextResponse.json(kpi, { status: 201 });
  } catch (error) {
    console.error("Erreur création KPI:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}