import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UseGuards, ParseBoolPipe, ParseIntPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  CreateEventRegistrationDto,
  UpdateEventRegistrationDto,
} from './dto/event-registration.dto';
import { Field, ObjectType, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class Event {
  @Field(() => ID)
  id: string;

  @Field()
  campusId: string;

  @Field(() => ID, { nullable: true })
  locationId: string | null;

  @Field()
  organizerId: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String, { nullable: true })
  locationText: string | null;

  @Field()
  startDatetime: Date;

  @Field(() => Date, { nullable: true })
  endDatetime: Date | null;

  @Field(() => String, { nullable: true })
  category: string | null;

  @Field(() => String, { nullable: true })
  imageUrl: string | null;

  @Field(() => Int, { nullable: true })
  maxAttendees: number | null;

  @Field()
  registrationRequired: boolean;

  @Field(() => Date, { nullable: true })
  registrationDeadline: Date | null;

  @Field()
  allowGuests: boolean;

  @Field(() => Float)
  price: number;

  @Field(() => String, { nullable: true })
  requirements: string | null;

  @Field()
  isCancelled: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  organizerName: string | null;

  @Field(() => String, { nullable: true })
  campusName: string | null;

  @Field(() => String, { nullable: true })
  locationName: string | null;

  @Field(() => Int, { nullable: true })
  registrationCount: number | null;
}

@ObjectType()
export class EventRegistration {
  @Field(() => ID)
  id: string;

  @Field()
  eventId: string;

  @Field()
  userId: string;

  @Field(() => ID, { nullable: true })
  studentId: string | null;

  @Field(() => Int)
  numberOfGuests: number;

  @Field()
  status: string;

  @Field(() => String, { nullable: true })
  notes: string | null;

  @Field()
  registeredAt: Date;

  @Field(() => Date, { nullable: true })
  cancelledAt: Date | null;

  @Field(() => String, { nullable: true })
  studentName: string | null;
}

@Resolver(() => Event)
export class EventsResolver {
  constructor(private eventsService: EventsService) {}

  @Query(() => [Event])
  async events(
    @Args('tenantId') tenantId: string,
    @Args('campusId', { nullable: true }) campusId?: string,
    @Args('category', { nullable: true }) category?: string,
    @Args('upcoming', { nullable: true, type: () => Boolean })
    upcoming?: boolean,
    @Args('registrationRequired', { nullable: true, type: () => Boolean })
    registrationRequired?: boolean,
    @Args('skip', { nullable: true, type: () => Int }) skip?: number,
    @Args('take', { nullable: true, type: () => Int }) take?: number,
  ): Promise<Event[]> {
    return this.eventsService.findAll(tenantId, {
      campusId,
      category,
      upcoming,
      registrationRequired,
      skip,
      take,
    });
  }

  @Query(() => Event, { nullable: true })
  async event(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ): Promise<Event> {
    return this.eventsService.findOne(id, tenantId);
  }

  @Mutation(() => Event)
  async createEvent(
    @Args('tenantId') tenantId: string,
    @Args('input') input: CreateEventDto,
    @Context() context: any,
  ): Promise<Event> {
    const organizerId = context.req.user?.sub;
    return this.eventsService.create(tenantId, organizerId, input);
  }

  @Mutation(() => Event)
  async updateEvent(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Args('input') input: UpdateEventDto,
  ): Promise<Event> {
    return this.eventsService.update(id, tenantId, input);
  }

  @Mutation(() => Boolean)
  async deleteEvent(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ): Promise<boolean> {
    return this.eventsService.remove(id, tenantId);
  }

  @Mutation(() => Event)
  async cancelEvent(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ): Promise<Event> {
    return this.eventsService.cancelEvent(id, tenantId);
  }

  // Event Registration mutations
  @Mutation(() => EventRegistration)
  async registerForEvent(
    @Args('tenantId') tenantId: string,
    @Args('input') input: CreateEventRegistrationDto,
    @Context() context: any,
  ): Promise<EventRegistration> {
    const userId = context.req.user?.sub;
    return this.eventsService.registerForEvent(tenantId, userId, input);
  }

  @Mutation(() => EventRegistration)
  async updateEventRegistration(
    @Args('registrationId') registrationId: string,
    @Args('tenantId') tenantId: string,
    @Args('input') input: UpdateEventRegistrationDto,
    @Context() context: any,
  ): Promise<EventRegistration> {
    const userId = context.req.user?.sub;
    return this.eventsService.updateRegistration(
      registrationId,
      tenantId,
      userId,
      input,
    );
  }

  @Mutation(() => EventRegistration)
  async cancelEventRegistration(
    @Args('registrationId') registrationId: string,
    @Args('tenantId') tenantId: string,
    @Context() context: any,
  ): Promise<EventRegistration> {
    const userId = context.req.user?.sub;
    return this.eventsService.cancelRegistration(
      registrationId,
      tenantId,
      userId,
    );
  }

  // Event Registration queries
  @Query(() => [EventRegistration])
  async eventRegistrations(
    @Args('eventId') eventId: string,
    @Args('tenantId') tenantId: string,
  ): Promise<EventRegistration[]> {
    return this.eventsService.getEventRegistrations(eventId, tenantId);
  }

  @Query(() => [EventRegistration])
  async userEventRegistrations(
    @Args('tenantId') tenantId: string,
    @Context() context: any,
  ): Promise<EventRegistration[]> {
    const userId = context.req.user?.sub;
    return this.eventsService.getUserEventRegistrations(tenantId, userId);
  }
}
