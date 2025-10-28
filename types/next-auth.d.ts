// next-auth.d.ts
import "next-auth/jwt";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface User extends DefaultUser {
        accessToken?: string;
    }

    interface Session {
        accessToken: string;
        user: {
            id: string;
            accessToken?: string | null;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id?: string;
        accessToken?: string;
    }
}
