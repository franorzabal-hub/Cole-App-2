import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, authorId: string, input: any) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Validate author is a teacher
    const teacher = await tenantClient.teacher.findFirst({
      where: { userId: authorId },
    });

    if (!teacher) {
      throw new BadRequestException('Only teachers can create news');
    }

    // Validate campus exists
    const campus = await tenantClient.campus.findUnique({
      where: { id: input.campusId },
    });

    if (!campus) {
      throw new BadRequestException('Campus not found');
    }

    return tenantClient.news.create({
      data: {
        ...input,
        authorId: teacher.id,
      },
      include: {
        campus: true,
        author: {
          include: {
            person: true,
          },
        },
        newsTargets: true,
        newsReads: true,
      },
    });
  }

  async findAll(
    tenantId: string,
    userId?: string,
    filter?: string,
    studentId?: string,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const where: any = {
      isPublished: true,
    };

    if (filter === 'published') {
      where.isPublished = true;
    } else if (filter === 'draft') {
      where.isPublished = false;
    }

    // If studentId provided, filter by target audience
    if (studentId) {
      where.OR = [
        { targetAudience: 'all' },
        {
          newsTargets: {
            some: {
              targetType: 'student',
              targetId: studentId,
            },
          },
        },
      ];
    }

    const news = await tenantClient.news.findMany({
      where,
      include: {
        campus: true,
        newsReads: userId
          ? {
              where: {
                userId,
              },
            }
          : false,
        _count: {
          select: {
            newsReads: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return news.map((item: any) => ({
      ...item,
      isRead: userId ? item.newsReads?.length > 0 : false,
      authorName: item.author?.person
        ? `${item.author.person.firstName} ${item.author.person.lastName}`
        : 'Admin',
    }));
  }

  async findOne(id: string, tenantId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const news = await tenantClient.news.findUnique({
      where: { id },
      include: {
        campus: true,
        author: {
          include: {
            person: true,
          },
        },
        newsTargets: true,
        newsReads: true,
      },
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    return {
      ...news,
      authorName: `${news.author.person.firstName} ${news.author.person.lastName}`,
    };
  }

  async update(id: string, tenantId: string, input: any) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const news = await tenantClient.news.findUnique({
      where: { id },
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    return tenantClient.news.update({
      where: { id },
      data: input,
      include: {
        campus: true,
        author: {
          include: {
            person: true,
          },
        },
      },
    });
  }

  async delete(id: string, tenantId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const news = await tenantClient.news.findUnique({
      where: { id },
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    // Delete related records first
    await tenantClient.newsRead.deleteMany({
      where: { newsId: id },
    });

    await tenantClient.newsTarget.deleteMany({
      where: { newsId: id },
    });

    await tenantClient.news.delete({
      where: { id },
    });

    return true;
  }

  async markAsRead(newsId: string, tenantId: string, userId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Check if already read
    const existingRead = await tenantClient.newsRead.findUnique({
      where: {
        newsId_userId: {
          newsId,
          userId,
        },
      },
    });

    if (existingRead) {
      return true;
    }

    await tenantClient.newsRead.create({
      data: {
        newsId,
        userId,
      },
    });

    return true;
  }

  async getUnreadCount(tenantId: string, userId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const totalPublishedNews = await tenantClient.news.count({
      where: {
        isPublished: true,
      },
    });

    const readCount = await tenantClient.newsRead.count({
      where: {
        userId,
      },
    });

    return totalPublishedNews - readCount;
  }
}
