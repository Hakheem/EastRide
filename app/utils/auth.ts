import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

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
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // IMPORTANT: Explicit cookie configuration
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        // Don't set domain - let it default to current domain
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  events: {
    async signIn({ user }) {
      console.log("🔐 Sign in event triggered for:", user.email);
      
      if (user && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser && !existingUser.role) {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: "USER" },
          });
          console.log("✅ Assigned USER role to:", user.email);
        }
      }
    },
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log("🔄 Redirect callback:", { url, baseUrl });
      
      // Handle OAuth callback
      if (url.startsWith(baseUrl)) {
        const urlObj = new URL(url);
        const callbackUrl = urlObj.searchParams.get('callbackUrl');
        
        if (callbackUrl && callbackUrl !== '/login') {
          console.log("✅ Using callback URL:", callbackUrl);
          return callbackUrl;
        }
      }
      
      // For internal redirects
      if (url.startsWith("/")) {
        console.log("✅ Internal redirect:", url);
        return `${baseUrl}${url}`;
      }
      
      if (url.startsWith(baseUrl)) {
        console.log("✅ Base URL redirect:", url);
        return url;
      }
      
      console.log("✅ Default redirect to:", baseUrl);
      return baseUrl;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        
        if (user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { role: true, id: true },
          });
          token.role = dbUser?.role || "USER";
          token.id = dbUser?.id;
          console.log("✅ JWT created with role:", token.role, "for:", user.email);
        }
      }
      
      if (trigger === "update" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          console.log("✅ JWT role refreshed:", token.role);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN" | "SUPERADMIN";
        console.log("✅ Session created with role:", session.user.role);
      }
      return session;
    },
  }, 
});

// Export handlers for API routes
export const { GET, POST } = handlers;

