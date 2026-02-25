import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { authOptions } from "../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET : Récupérer tous les utilisateurs
export async function GET() {
  const session = await getServerSession(authOptions);

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

// POST : Créer un nouvel utilisateur
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nom, email, motDePasse, role } = body;

    // Vérifier que les champs requis sont présents
    if (!nom || !email || !motDePasse) {
      return NextResponse.json({ error: "Nom, email et mot de passe requis" }, { status: 400 });
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        nom,
        email,
        motDePasse: hashedPassword,
        role: role || "VIEWER"
      }
    });

    // Ne pas retourner le mot de passe
    const { motDePasse: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Erreur création utilisateur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}