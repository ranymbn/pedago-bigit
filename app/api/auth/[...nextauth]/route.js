import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Chercher l'utilisateur dans la base de données
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            secteurs: {
              include: {
                secteur: true
              }
            }
          }
        });

        if (!user) {
          console.log("Utilisateur non trouvé:", credentials.email);
          return null;
        }

        // Vérifier le mot de passe
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.motDePasse
        );

        if (!passwordMatch) {
          console.log("Mot de passe incorrect pour:", credentials.email);
          return null;
        }

        console.log("Connexion réussie pour:", credentials.email);

        return {
          id: user.id,
          email: user.email,
          name: user.nom,
          role: user.role,
          secteurs: user.secteurs.map((us) => ({
            id: us.secteur.id,
            nom: us.secteur.nom
          }))
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.secteurs = user.secteurs;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.secteurs = token.secteurs;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "test-secret-123",
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };