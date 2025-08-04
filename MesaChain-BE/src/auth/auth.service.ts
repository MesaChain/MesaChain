import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../shared/prisma.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";
import * as bcrypt from "bcrypt";

import { UserRole } from "../interfaces/user.interface";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: UserRole.USER,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    delete user.password;
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    delete user.password;
    return { user, ...tokens };
  }

  async logout(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  async refreshToken(token: string) {
    const refreshToken = await this.prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (
      !refreshToken ||
      refreshToken.revoked ||
      refreshToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const tokens = await this.generateTokens(
      refreshToken.user.id,
      refreshToken.user.email
    );
    await this.saveRefreshToken(refreshToken.user.id, tokens.refreshToken);
    await this.prisma.session.update({
      where: { id: refreshToken.id },
      data: { revoked: true },
    });

    return tokens;
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, email }, { expiresIn: "15m" }),
      this.jwtService.signAsync({ sub: userId, email }, { expiresIn: "7d" }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }
}
