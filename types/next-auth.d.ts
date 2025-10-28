// next-auth.d.ts
import "next-auth/jwt";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface User extends DefaultUser {
        id: string;
        token?: string;
    }

    interface Session {
        token: string;
        user: {
            id: string;
            token?: string | null;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id?: string;
        token?: string;
    }
}
