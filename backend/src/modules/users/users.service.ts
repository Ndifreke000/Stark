import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: createUserDto,
    });

    // Remove password hash from response
    const { password_hash, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        _count: {
          select: {
            submissions: true,
            created_bounties: true,
          },
        },
      },
    });
    return users;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });
    return user;
  }

  async getStats() {
    const totalUsers = await this.prisma.user.count();
    const totalAdmins = await this.prisma.user.count({
      where: { role: 'ADMIN' },
    });
    const totalAnalysts = await this.prisma.user.count({
      where: { role: 'ANALYST' },
    });
    const totalRegularUsers = await this.prisma.user.count({
      where: { role: 'USER' },
    });

    return {
      total: totalUsers,
      admins: totalAdmins,
      analysts: totalAnalysts,
      users: totalRegularUsers,
    };
  }
}
