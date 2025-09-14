import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { Field, ObjectType, InputType, ID } from '@nestjs/graphql';

@ObjectType()
export class News {
  @Field(() => ID)
  id: string;

  @Field()
  campusId: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => String, { nullable: true })
  summary?: string;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field()
  priority: string;

  @Field(() => String, { nullable: true })
  imageUrl?: string;

  @Field(() => [String], { nullable: true })
  attachmentUrls?: string[];

  @Field()
  targetAudience: string;

  @Field()
  isPublished: boolean;

  @Field(() => Date, { nullable: true })
  publishedAt?: Date;

  @Field(() => Date, { nullable: true })
  expiresAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Boolean, { nullable: true })
  isRead?: boolean;

  @Field(() => String, { nullable: true })
  authorName?: string;
}

@InputType()
export class CreateNewsInput {
  @Field()
  campusId: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => String, { nullable: true })
  summary?: string;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field({ defaultValue: 'normal' })
  priority: string;

  @Field(() => String, { nullable: true })
  imageUrl?: string;

  @Field(() => [String], { nullable: true })
  attachmentUrls?: string[];

  @Field({ defaultValue: 'all' })
  targetAudience: string;

  @Field({ defaultValue: false })
  isPublished: boolean;

  @Field(() => Date, { nullable: true })
  publishedAt?: Date;

  @Field(() => Date, { nullable: true })
  expiresAt?: Date;
}

@InputType()
export class UpdateNewsInput {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => String, { nullable: true })
  summary?: string;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field(() => String, { nullable: true })
  priority?: string;

  @Field(() => String, { nullable: true })
  imageUrl?: string;

  @Field(() => [String], { nullable: true })
  attachmentUrls?: string[];

  @Field(() => String, { nullable: true })
  targetAudience?: string;

  @Field(() => Boolean, { nullable: true })
  isPublished?: boolean;

  @Field(() => Date, { nullable: true })
  publishedAt?: Date;

  @Field(() => Date, { nullable: true })
  expiresAt?: Date;
}

@Resolver(() => News)
export class NewsResolver {
  constructor(private newsService: NewsService) {}

  @Query(() => [News])
  async news(
    @Args('tenantId') tenantId: string,
    @Args('filter', { nullable: true }) filter?: string,
    @Args('studentId', { nullable: true }) studentId?: string,
    @Context() context?: any,
  ) {
    const userId = context?.req?.user?.sub;
    return this.newsService.findAll(tenantId, userId, filter, studentId);
  }

  @Query(() => News, { nullable: true })
  async newsItem(@Args('id') id: string, @Args('tenantId') tenantId: string) {
    return this.newsService.findOne(id, tenantId);
  }

  @Mutation(() => News)
  async createNews(
    @Args('tenantId') tenantId: string,
    @Args('input') input: CreateNewsInput,
    @Context() context: any,
  ) {
    const authorId = context.req.user?.sub;
    return this.newsService.create(tenantId, authorId, input);
  }

  @Mutation(() => News)
  async updateNews(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Args('input') input: UpdateNewsInput,
  ) {
    return this.newsService.update(id, tenantId, input);
  }

  @Mutation(() => Boolean)
  async deleteNews(@Args('id') id: string, @Args('tenantId') tenantId: string) {
    return this.newsService.delete(id, tenantId);
  }

  @Mutation(() => Boolean)
  async markNewsAsRead(
    @Args('newsId') newsId: string,
    @Args('tenantId') tenantId: string,
    @Context() context: any,
  ) {
    const userId = context.req.user?.sub;
    return this.newsService.markAsRead(newsId, tenantId, userId);
  }

  @Query(() => Number)
  async unreadNewsCount(
    @Args('tenantId') tenantId: string,
    @Context() context: any,
  ) {
    const userId = context.req.user?.sub;
    return this.newsService.getUnreadCount(tenantId, userId);
  }
}
