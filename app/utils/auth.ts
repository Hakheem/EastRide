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
      // Assign default "USER" role on first sign-in (UPPERCASE to match enum)
      if (user && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser && !existingUser.role) {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: "USER" },
          });
        }
      }
    },
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If the url is already an absolute URL (like after OAuth callback), 
      // we need to determine where to redirect based on user role
      
      // Parse the callback URL to check if it's coming from OAuth
      if (url.startsWith(baseUrl)) {
        // Extract any callback URL from the query params
        const urlObj = new URL(url);
        const callbackUrl = urlObj.searchParams.get('callbackUrl');
        
        // If there's a specific callback URL, use it
        if (callbackUrl && callbackUrl !== '/login') {
          return callbackUrl;
        }
      }
      
      // For regular redirects (not OAuth), just use the URL if it's internal
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      
      // Default to base URL (homepage)
      return baseUrl;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        // Fetch role from database on sign in
        if (user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { role: true, id: true },
          });
          token.role = dbUser?.role || "USER";
          token.id = dbUser?.id;
        }
      }
      
      // Refresh role from database if session is updated
      if (trigger === "update" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN" | "SUPERADMIN";
      }
      return session;
    },
  },
});

// Export handlers for API routes
export const { GET, POST } = handlers;

