
import NextAuth from "next-auth/next";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { User } from "next-auth"
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("❌ Missing credentials");
          return null;
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();

          // 전체 응답 구조 출력 (디버깅용)
          console.log("📦 Full backend response:", JSON.stringify(data, null, 2));

          if (res.ok && data) {
            // NextAuth expects a flat User object with token at top level
            // Transform backend response to match NextAuth's expected format
            if (data.user && data.token) {
              // Backend returns { token: "...", user: { id, email, name } }
              return {
                ...data.user,
                token: data.token, // Add token to the user object
              };
            } else if (data.token) {
              // Backend returns { token: "...", id, email, name }
              return data;
            } else {
              console.error("❌ Backend response missing token:", data);
              return null;
            }
          }
          return null;

        } catch (error) {
          console.error("❌ Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: '/signin' },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user, trigger }: { token: JWT; user?: User; trigger?: string }) {
      console.log("🔧 JWT callback triggered:", { trigger, hasUser: !!user });

      if (user) {
        console.log("👤 User object received:", {
          id: user.id,
          email: user.email,
          hasToken: !!(user as any).token
        });

        token.email = user.email;
        token.id = user.id;
        token.token = (user as any).token;

        console.log("✅ Token updated with user data");
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log("🔧 Session callback triggered");

      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }

      if (token.token) {
        session.token = token.token as string;
        session.user.token = token.token as string;
        console.log("✅ Session token set:", session.token ? "YES" : "NO");
      } else {
        console.warn("⚠️ No token found in JWT token object");
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
