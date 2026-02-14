import { createClerkClient } from "@clerk/backend";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserContext } from "./auth.types";
import { verifyToken } from "node_modules/@clerk/backend/dist/tokens/verify";


@Injectable()
export class AuthService {
    private readonly clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
        publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
    })

    private jwtVerifyOptions(): Record<string, any> {
        return {
            secretKey: process.env.CLERK_SECRET_KEY
        }
    }

    async verifyAndBuildContext(token: string): Promise<UserContext> {
        try {
            const verified = await verifyToken(token, this.jwtVerifyOptions())
            const payload = verified?.payload ?? verified?.payload ?? verified;

            const clerkUserId = payload?.sub ?? payload?.userId

            if (!clerkUserId) {
                throw new UnauthorizedException("Token is missing user id")
            }

            const role: 'user' | 'admin' = 'user'

            const emailFromToken = payload?.email ??
                payload?.email_address ?? payload?.primaryEmailAddress ?? ''

            const nameFromToken = payload?.name ??
                payload?.fullName ?? payload?.username ?? ''

            if (emailFromToken && nameFromToken) {
                return {
                    clerkUserId,
                    email: emailFromToken,
                    name: nameFromToken,
                    role
                }
            }


        } catch (error) {

        }
    }
}