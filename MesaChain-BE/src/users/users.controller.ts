import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  createParamDecorator,
  ExecutionContext,
  Query,
  HttpCode,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../interfaces/user.interface";
import { Request } from "express";
import { User } from "../interfaces/user.interface";

// Create a custom decorator
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiTags("users")
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: "Get all users with pagination and filtering" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "filter", required: false, type: String })
  findAll(
    @GetUser() user: User,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("filter") filter?: string
  ) {
    return this.usersService.findAll(user);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("staff")
  @ApiOperation({ summary: "Get all staff users" })
  findStaff(@GetUser() user: User) {
    return this.usersService.findStaff(user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by id" })
  @ApiParam({ name: "id", type: "string", description: "User ID" })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a user" })
  @ApiParam({ name: "id", type: "string", description: "User ID" })
  @ApiBody({ type: UpdateUserDto })
  update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete a user" })
  @ApiParam({ name: "id", type: "string", description: "User ID" })
  remove(@Param("id") id: string, @GetUser() user: User) {
    return this.usersService.remove(id, user);
  }
}
