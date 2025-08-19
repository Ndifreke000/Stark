/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionStatusDto } from './dto/update-submission.dto';
import { SubmissionStatus } from '@prisma/client';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSubmissionDto: CreateSubmissionDto, analystId: string) {
    // Check if bounty exists and is open
    const bounty = await this.prisma.bounty.findUnique({
      where: { id: createSubmissionDto.bounty_id },
    });

    if (!bounty) {
      throw new NotFoundException('Bounty not found');
    }

    if (bounty.status !== 'OPEN') {
      throw new BadRequestException('Cannot submit to a closed bounty');
    }

    // Check if user already submitted for this bounty
    const existingSubmission = await this.prisma.submission.findUnique({
      where: {
        bounty_id_analyst_id: {
          bounty_id: createSubmissionDto.bounty_id,
          analyst_id: analystId,
        },
      },
    });

    if (existingSubmission) {
      throw new BadRequestException(
        'You have already submitted for this bounty',
      );
    }

    return this.prisma.submission.create({
      data: {
        ...createSubmissionDto,
        analyst_id: analystId,
      },
      include: {
        bounty: {
          select: {
            id: true,
            title: true,
            reward_amount: true,
            status: true,
          },
        },
        analyst: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(status?: SubmissionStatus) {
    const where = status ? { status } : {};

    return this.prisma.submission.findMany({
      where,
      include: {
        bounty: {
          select: {
            id: true,
            title: true,
            reward_amount: true,
            status: true,
          },
        },
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
    });
  }

  async findMySubmissions(analystId: string) {
    return this.prisma.submission.findMany({
      where: { analyst_id: analystId },
      include: {
        bounty: {
          select: {
            id: true,
            title: true,
            reward_amount: true,
            status: true,
          },
        },
      },
      orderBy: {
        submitted_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        bounty: {
          select: {
            id: true,
            title: true,
            description: true,
            reward_amount: true,
            status: true,
          },
        },
        analyst: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }

  async updateStatus(
    id: string,
    updateDto: UpdateSubmissionStatusDto,
    userId: string,
    userRole: string,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        bounty: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Only admin or bounty creator can update submission status
    if (userRole !== 'ADMIN' && submission.bounty.created_by !== userId) {
      throw new ForbiddenException('Not authorized to update this submission');
    }

    return this.prisma.submission.update({
      where: { id },
      data: { status: updateDto.status },
      include: {
        bounty: {
          select: {
            id: true,
            title: true,
            reward_amount: true,
            status: true,
          },
        },
        analyst: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getStats() {
    const total = await this.prisma.submission.count();
    const pending = await this.prisma.submission.count({
      where: { status: 'PENDING' },
    });
    const approved = await this.prisma.submission.count({
      where: { status: 'APPROVED' },
    });
    const rejected = await this.prisma.submission.count({
      where: { status: 'REJECTED' },
    });

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }
}
