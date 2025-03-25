import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import type { PrismaService } from "../prisma/prisma.service"
import * as bcrypt from "bcrypt"
import type { LoginDto } from "./dto/login.dto"
import type { ConfigService } from "@nestjs/config"
import { type User, UserRole } from "../types/user.types"
import { RegisterDto } from "./dto/create-auth.dto"

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new ConflictException("Email already registered")
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password)

    // Create new user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.USER,
      },
    })

    // Generate tokens
    const tokens = await this.generateTokens(user)

    // Save refresh token to database
    await this.saveRefreshToken(user.id, tokens.refreshToken)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new UnauthorizedException("Invalid credentials")
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials")
    }

    // Generate tokens
    const tokens = await this.generateTokens(user)

    // Save refresh token to database
    await this.saveRefreshToken(user.id, tokens.refreshToken)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new ForbiddenException("Access denied")
    }

    // Find refresh token in database
    const refreshTokenData = await this.prisma.refreshToken.findFirst({
      where: {
        userId: user.id,
        token: refreshToken,
        revoked: false,
      },
    })

    if (!refreshTokenData) {
      throw new ForbiddenException("Access denied")
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user)

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: refreshTokenData.id },
      data: { revoked: true },
    })

    // Save new refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken)

    return tokens
  }

  async logout(userId: string, refreshToken: string) {
    // Revoke refresh token
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        token: refreshToken,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    })

    return { success: true }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10
    return bcrypt.hash(password, saltRounds)
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get("JWT_SECRET"),
        expiresIn: "15m",
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get("REFRESH_TOKEN_SECRET"),
        expiresIn: "7d",
      }),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  private async saveRefreshToken(userId: string, token: string) {
    // Set expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Save token to database
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    })
  }

  async validateUser(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user) {
      throw new UnauthorizedException("User not found")
    }

    return user
  }
}

