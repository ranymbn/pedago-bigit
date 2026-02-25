import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET : Récupérer un utilisateur spécifique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id: id },
    include: {
      secteurs: {
        include: {
          secteur: true
        }
      }
    }
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PUT : Modifier un utilisateur
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

    // Vérifier que le body est valide
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Format JSON invalide" }, { status: 400 });
    }

    const { nom, email, role, motDePasse } = body;

    // Vérifier qu'au moins un champ est fourni
    if (!nom && !email && !role && !motDePasse) {
      return NextResponse.json({ error: "Aucune donnée à modifier" }, { status: 400 });
    }

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Préparer les données à mettre à jour
    const updateData: any = {};
    if (nom) updateData.nom = nom;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (motDePasse && motDePasse.trim() !== "") {
      updateData.motDePasse = await bcrypt.hash(motDePasse, 10);
    }

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id: id },
      data: updateData
    });

    // Ne pas retourner le mot de passe
    const { motDePasse: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Erreur modification utilisateur:", error);
    return NextResponse.json({ 
      error: "Erreur serveur", 
      details: error instanceof Error ? error.message : "Erreur inconnue" 
    }, { status: 500 });
  }
}

// DELETE : Supprimer un utilisateur
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

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Empêcher la suppression de soi-même
    if (existingUser.id === session.user?.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}