import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(credentials.password, user.motDePasse);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.nom,
          role: user.role
        };
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "temp-secret",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };