import { IsNotEmpty, IsString, IsUUID } from "class-validator"

export class RefreshTokenDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsNotEmpty()
  refreshToken: string
}

