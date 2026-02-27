import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { authOptions } from "../auth/[...nextauth]/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET : Récupérer les dashboards accessibles à l'utilisateur
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const url = new URL(request.url);
  const secteurId = url.searchParams.get("secteurId");

  // Construire la requête selon le rôle
  let whereClause: any = {};

  if (session.user.role !== "ADMIN") {
    // Pour les non-admins, filtrer par leurs secteurs
    const userSecteurs = await prisma.userSecteur.findMany({
      where: { userId: session.user.id },
      select: { secteurId: true }
    });
    
    const secteursIds = userSecteurs.map(us => us.secteurId);
    whereClause.secteurId = { in: secteursIds };
  }

  // Si un secteur spécifique est demandé
  if (secteurId) {
    whereClause.secteurId = secteurId;
  }

  const dashboards = await prisma.dashboard.findMany({
    where: whereClause,
    include: {
      secteur: true,
      kpis: {
        include: {
          valeurs: {
            orderBy: { dateMesure: "desc" },
            take: 1
          }
        }
      }
    }
  });

  return NextResponse.json(dashboards);
}

// POST : Créer un dashboard (admin seulement)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { titre, description, urlPowerBI, secteurId } = body;

    if (!titre || !urlPowerBI || !secteurId) {
      return NextResponse.json({ 
        error: "Titre, URL Power BI et secteur requis" 
      }, { status: 400 });
    }

    const dashboard = await prisma.dashboard.create({
      data: {
        titre,
        description,
        urlPowerBI,
        secteurId
      },
      include: { secteur: true }
    });

    return NextResponse.json(dashboard, { status: 201 });
  } catch (error) {
    console.error("Erreur création dashboard:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}