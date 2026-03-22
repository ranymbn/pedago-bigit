import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import DashboardContent from "./DashboardContent";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function getDashboards(userId: string, role: string) {
  if (role === "ADMIN") {
    return await prisma.dashboard.findMany({
      include: { secteur: true }
    });
  } else {
    const userSecteurs = await prisma.userSecteur.findMany({
      where: { userId },
      select: { secteurId: true }
    });
    
    const secteursIds = userSecteurs.map(us => us.secteurId);
    
    return await prisma.dashboard.findMany({
      where: { secteurId: { in: secteursIds } },
      include: { secteur: true }
    });
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const dashboards = await getDashboards(session.user.id, session.user.role);

  return <DashboardContent session={session} dashboards={dashboards} />;
}