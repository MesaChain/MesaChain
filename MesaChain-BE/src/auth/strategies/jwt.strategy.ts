import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get("JWT_SECRET"),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException("Invalid token payload");
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    delete user.password;
    return user;
  }
}
