import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { REQUIRED_ROLE_KEY } from "./admin.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector,
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) {

    }

    async canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ])

        if (isPublic) {
            return true
        }

        const req = context.switchToHttp().getRequest()

        const authorization = req.headers['authorization']

        if (!authorization || typeof authorization !== 'string') {
            throw new UnauthorizedException('Missing authorization header')
        }

        const token = authorization.startsWith('Bearer ') ?
            authorization.slice('Bearer '.length).trim() : ''

        if (!token) {
            throw new UnauthorizedException('Missing token')
        }

        const identifyAuthaUser = await this.authService.verifyAndBuildContext(token)//se extrae el token del header, se verifica y se construye el contexto del usuario a partir del token

        const dbUser = await this.usersService.upsertAuthUser({
            clerkUserId: identifyAuthaUser.clerkUserId,
            email: identifyAuthaUser.email,
            name: identifyAuthaUser.name
        })

        const user = {
            ...identifyAuthaUser,
            role: dbUser.role
        }

        req.user = user

        const requiredRole = this.reflector.getAllAndOverride<string>(REQUIRED_ROLE_KEY,
            [
                context.getHandler(),
                context.getClass()
            ]
        )

        if (requiredRole === 'admin' && user.role != 'admin') {
            throw new ForbiddenException('Admin role required')
        }

        return true

    }

}