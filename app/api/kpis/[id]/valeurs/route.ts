import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { authOptions } from "../../../auth/[...nextauth]/route";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET : Récupérer les valeurs d'un KPI
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const url = new URL(request.url);
  const periode = url.searchParams.get("periode") || "30"; // jours par défaut

  // Vérifier les permissions
  const kpi = await prisma.kPI.findUnique({
    where: { id },
    include: { dashboard: { include: { secteur: true } } }
  });

  if (!kpi) {
    return NextResponse.json({ error: "KPI non trouvé" }, { status: 404 });
  }

  if (session.user.role !== "ADMIN") {
    const userSecteurs = await prisma.userSecteur.findMany({
      where: { userId: session.user.id },
      select: { secteurId: true }
    });
    
    const secteursIds = userSecteurs.map(us => us.secteurId);
    
    if (!secteursIds.includes(kpi.dashboard.secteurId)) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }
  }

  const dateLimite = new Date();
  dateLimite.setDate(dateLimite.getDate() - parseInt(periode));

  const valeurs = await prisma.kPIValue.findMany({
    where: {
      kpiId: id,
      dateMesure: { gte: dateLimite }
    },
    orderBy: { dateMesure: "asc" }
  });

  return NextResponse.json(valeurs);
}

// POST : Ajouter une valeur à un KPI (admin seulement)
export async function POST(
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
    const { valeur, dateMesure } = body;

    if (valeur === undefined) {
      return NextResponse.json({ error: "Valeur requise" }, { status: 400 });
    }

    const kpiValue = await prisma.kPIValue.create({
      data: {
        valeur: parseFloat(valeur),
        dateMesure: dateMesure ? new Date(dateMesure) : new Date(),
        kpiId: id
      }
    });

    return NextResponse.json(kpiValue, { status: 201 });
  } catch (error) {
    console.error("Erreur ajout valeur KPI:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}