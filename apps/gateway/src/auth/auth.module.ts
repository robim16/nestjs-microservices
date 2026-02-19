import { Module } from "@nestjs/common";
import { UsersModule } from "../users/user.module";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth-guard";


@Module({
    imports: [
        UsersModule
    ],
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