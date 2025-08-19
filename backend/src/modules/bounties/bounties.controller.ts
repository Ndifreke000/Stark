import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { BountiesService } from './bounties.service';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { UpdateBountyDto } from './dto/update-bounty.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, BountyStatus } from '@prisma/client';

@Controller('bounties')
@UseGuards(JwtAuthGuard)
export class BountiesController {
  constructor(private readonly bountiesService: BountiesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  create(
    @Body() createBountyDto: CreateBountyDto,
    @Request() req: Express.Request & { user: { id: string } },
  ) {
    return this.bountiesService.create(createBountyDto, req.user.id);
  }

  @Get()
  findAll(@Query('status') status?: BountyStatus) {
    return this.bountiesService.findAll(status);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  getStats() {
    return this.bountiesService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bountiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateBountyDto: UpdateBountyDto,
    @Request() req: Express.Request & { user: { id: string; role: Role } },
  ) {
    return this.bountiesService.update(
      id,
      updateBountyDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  remove(
    @Param('id') id: string,
    @Request() req: Express.Request & { user: { id: string; role: Role } },
  ) {
    return this.bountiesService.remove(id, req.user.id, req.user.role);
  }
}
