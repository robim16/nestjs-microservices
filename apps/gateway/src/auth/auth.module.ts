import { Module } from "@nestjs/common";
import { UsersModule } from "../users/user.module";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth-guard";
import { AuthController } from "./auth.controller";


@Module({
    imports: [
        UsersModule
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        {
            provide: 'APP_GUARD',
            useClass: JwtAuthGuard
        }
    ],
    exports: [AuthService]
})

export class AuthModule {}