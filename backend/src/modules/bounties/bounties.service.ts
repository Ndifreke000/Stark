/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { UpdateBountyDto } from './dto/update-bounty.dto';
import { BountyStatus } from '@prisma/client';

@Injectable()
export class BountiesService {
  constructor(private prisma: PrismaService) {}

  async create(createBountyDto: CreateBountyDto, createdBy: string) {
    return this.prisma.bounty.create({
      data: {
        ...createBountyDto,
        created_by: createdBy,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });
  }

  async findAll(status?: BountyStatus) {
    const where = status ? { status } : {};

    return this.prisma.bounty.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const bounty = await this.prisma.bounty.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        submissions: {
          include: {
            analyst: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            submitted_at: 'desc',
          },
        },
      },
    });

    if (!bounty) {
      throw new NotFoundException('Bounty not found');
    }

    return bounty;
  }

  async update(
    id: string,
    updateBountyDto: UpdateBountyDto,
    userId: string,
    userRole: string,
  ) {
    const bounty = await this.prisma.bounty.findUnique({
      where: { id },
    });

    if (!bounty) {
      throw new NotFoundException('Bounty not found');
    }

    // Only admin or bounty creator can update
    if (userRole !== 'ADMIN' && bounty.created_by !== userId) {
      throw new ForbiddenException('Not authorized to update this bounty');
    }

    return this.prisma.bounty.update({
      where: { id },
      data: updateBountyDto,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const bounty = await this.prisma.bounty.findUnique({
      where: { id },
    });

    if (!bounty) {
      throw new NotFoundException('Bounty not found');
    }

    // Only admin or bounty creator can delete
    if (userRole !== 'ADMIN' && bounty.created_by !== userId) {
      throw new ForbiddenException('Not authorized to delete this bounty');
    }

    // Delete related submissions first
    await this.prisma.submission.deleteMany({
      where: { bounty_id: id },
    });

    return this.prisma.bounty.delete({
      where: { id },
    });
  }

  async getStats() {
    const total = await this.prisma.bounty.count();
    const open = await this.prisma.bounty.count({
      where: { status: 'OPEN' },
    });
    const closed = await this.prisma.bounty.count({
      where: { status: 'CLOSED' },
    });
    const reviewing = await this.prisma.bounty.count({
      where: { status: 'REVIEWING' },
    });

    const totalReward = await this.prisma.bounty.aggregate({
      _sum: {
        reward_amount: true,
      },
    });

    return {
      total,
      open,
      closed,
      reviewing,
      totalRewardAmount: totalReward._sum.reward_amount || 0,
    };
  }
}
