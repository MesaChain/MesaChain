import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { ReportsService } from "./reports.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateReportDto } from "./dto/create-report.dto";

@Controller("reports")
@UseGuards(JwtAuthGuard)
@ApiTags("reports")
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new report" })
  @ApiResponse({ status: 201, description: "Report created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async createReport(@Body() createReportDto: CreateReportDto) {
    try {
      return await this.reportsService.createReport(createReportDto);
    } catch (error) {
      throw new BadRequestException(
        "Failed to create report: " + error.message
      );
    }
  }

  @Post(":id/generate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate a report by ID" })
  @ApiResponse({ status: 200, description: "Report generated successfully" })
  @ApiResponse({ status: 404, description: "Report not found" })
  async generateReport(@Param("id") id: string) {
    try {
      return await this.reportsService.generateReport(id);
    } catch (error) {
      throw new BadRequestException(
        "Failed to generate report: " + error.message
      );
    }
  }
}
