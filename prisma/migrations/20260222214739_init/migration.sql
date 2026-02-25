-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'VIEWER', 'ANALYST');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secteurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "secteurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateur_secteurs" (
    "userId" TEXT NOT NULL,
    "secteurId" TEXT NOT NULL,

    CONSTRAINT "utilisateur_secteurs_pkey" PRIMARY KEY ("userId","secteurId")
);

-- CreateTable
CREATE TABLE "dashboards" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "urlPowerBI" TEXT NOT NULL,
    "secteurId" TEXT NOT NULL,

    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpis" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "unite" TEXT,
    "dashboardId" TEXT NOT NULL,

    CONSTRAINT "kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_valeurs" (
    "id" TEXT NOT NULL,
    "valeur" DOUBLE PRECISION NOT NULL,
    "dateMesure" TIMESTAMP(3) NOT NULL,
    "kpiId" TEXT NOT NULL,

    CONSTRAINT "kpi_valeurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyses_ia" (
    "id" TEXT NOT NULL,
    "dateAnalyse" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultat" TEXT NOT NULL,
    "periodeDebut" TIMESTAMP(3),
    "periodeFin" TIMESTAMP(3),
    "kpiId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,

    CONSTRAINT "analyses_ia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "secteurs_nom_key" ON "secteurs"("nom");

-- AddForeignKey
ALTER TABLE "utilisateur_secteurs" ADD CONSTRAINT "utilisateur_secteurs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur_secteurs" ADD CONSTRAINT "utilisateur_secteurs_secteurId_fkey" FOREIGN KEY ("secteurId") REFERENCES "secteurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_secteurId_fkey" FOREIGN KEY ("secteurId") REFERENCES "secteurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "dashboards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_valeurs" ADD CONSTRAINT "kpi_valeurs_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "kpis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses_ia" ADD CONSTRAINT "analyses_ia_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "kpis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses_ia" ADD CONSTRAINT "analyses_ia_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
