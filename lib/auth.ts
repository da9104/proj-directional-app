import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { User } from "next-auth";

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
                        return {
                            id: data.userId, // User ID from the API
                            name: data.userName || credentials.email,
                            email: credentials.email,
                            accessToken: data.token, // 👈 Store the Swagger Token here!
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
                token.accessToken = (user as any).accessToken;

                console.log("✅ Token updated with user data", {
                    tokenSet: !!token.token
                });
            }

            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            session.accessToken = token.accessToken as string;
            console.log("✅ Session token set:", !!session.accessToken);
            return session;
        },
    },
};
