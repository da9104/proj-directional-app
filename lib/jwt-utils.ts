import jwt from "jsonwebtoken";

export function decodeToken(token: string) {
    try {
        const decoded = jwt.decode(token) as {
            userId: string;
            email: string;
            iat: number;
            exp: number;
        } | null;

        return decoded;
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
}

export function getTokenExpiryTime(token: string): Date | null {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
}
