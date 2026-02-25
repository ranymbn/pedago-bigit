const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')
require('dotenv/config')

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Création de l'adaptateur et du client Prisma
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🔧 Création de l'administrateur...")
  
  const password = await bcrypt.hash("admin123", 10)
  
  const admin = await prisma.user.create({
    data: {
      nom: "Administrateur",
      email: "admin@pedago.com",
      motDePasse: password,
      role: "ADMIN"
    }
  })
  
  console.log("✅ Admin créé avec succès !")
  console.log("📧 Email :", admin.email)
  console.log("🔑 Mot de passe : admin123")
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })