import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionStatusDto } from './dto/update-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, SubmissionStatus } from '@prisma/client';

@Controller('submissions')
@UseGuards(JwtAuthGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  create(
    @Body() createSubmissionDto: CreateSubmissionDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.submissionsService.create(createSubmissionDto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  findAll(@Query('status') status?: SubmissionStatus) {
    return this.submissionsService.findAll(status);
  }

  @Get('my-submissions')
  findMySubmissions(@Request() req: { user: { id: string } }) {
    return this.submissionsService.findMySubmissions(req.user.id);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  getStats() {
    return this.submissionsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateSubmissionStatusDto,
    @Request() req: { user: { id: string; role: Role } },
  ) {
    return this.submissionsService.updateStatus(
      id,
      updateDto,
      req.user.id,
      req.user.role,
    );
  }
}
