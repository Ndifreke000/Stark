import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getStats() {
    return this.usersService.getStats();
  }
}