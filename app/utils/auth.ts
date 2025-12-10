import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  session: {
    strategy: "jwt", // Important: Use JWT for Edge compatibility
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  events: {
    async signIn({ user }) {
      // Assign default "user" role on first sign-in
      if (user && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser && !existingUser.role) {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: "user" },
          });
        }
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        // Fetch role from database on sign in
        if (user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { role: true, id: true },
          });
          token.role = dbUser?.role || "user";
          token.id = dbUser?.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin" | "superadmin";
      }
      return session;
    },
  },
});

export const { GET, POST } = handlers;
