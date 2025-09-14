import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  CreateEventRegistrationDto,
  UpdateEventRegistrationDto,
} from './dto/event-registration.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  private mapEventToGraphQL(event: any): any {
    return {
      ...event,
      organizerName: event.organizer?.person
        ? `${event.organizer.person.firstName} ${event.organizer.person.lastName}`
        : null,
      campusName: event.campus?.name || null,
      locationName: event.location?.name || null,
      registrationCount:
        event._count?.registrations || event.registrations?.length || null,
    };
  }

  private mapEventRegistrationToGraphQL(registration: any): any {
    return {
      ...registration,
      studentName: registration.student?.person
        ? `${registration.student.person.firstName} ${registration.student.person.lastName}`
        : null,
    };
  }

  async create(
    tenantId: string,
    organizerId: string,
    createEventDto: CreateEventDto,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Validate campus exists
    const campus = await tenantClient.campus.findUnique({
      where: { id: createEventDto.campusId },
    });

    if (!campus) {
      throw new BadRequestException('Campus not found');
    }

    // Validate location if provided
    if (createEventDto.locationId) {
      const location = await tenantClient.location.findUnique({
        where: { id: createEventDto.locationId },
      });

      if (!location) {
        throw new BadRequestException('Location not found');
      }
    }

    // Validate organizer exists
    const organizer = await tenantClient.teacher.findUnique({
      where: { id: organizerId },
    });

    if (!organizer) {
      throw new BadRequestException('Organizer not found or not a teacher');
    }

    const event = await tenantClient.event.create({
      data: {
        ...createEventDto,
        organizerId,
      },
      include: {
        campus: true,
        location: true,
        organizer: {
          include: {
            person: true,
          },
        },
        registrations: true,
      },
    });

    return this.mapEventToGraphQL(event);
  }

  async findAll(
    tenantId: string,
    options: {
      campusId?: string;
      category?: string;
      upcoming?: boolean;
      registrationRequired?: boolean;
      skip?: number;
      take?: number;
    } = {},
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const where: any = {};

    if (options.campusId) {
      where.campusId = options.campusId;
    }

    if (options.category) {
      where.category = options.category;
    }

    if (options.upcoming) {
      where.startDatetime = {
        gte: new Date(),
      };
    }

    if (options.registrationRequired !== undefined) {
      where.registrationRequired = options.registrationRequired;
    }

    const events = await tenantClient.event.findMany({
      where,
      include: {
        campus: true,
        location: true,
        organizer: {
          include: {
            person: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        startDatetime: 'asc',
      },
      skip: options.skip,
      take: options.take,
    });

    return events.map((event) => this.mapEventToGraphQL(event));
  }

  async findOne(id: string, tenantId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const event = await tenantClient.event.findUnique({
      where: { id },
      include: {
        campus: true,
        location: true,
        organizer: {
          include: {
            person: true,
          },
        },
        registrations: {
          include: {
            student: {
              include: {
                person: true,
              },
            },
            parent: {
              include: {
                person: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.mapEventToGraphQL(event);
  }

  async update(id: string, tenantId: string, updateEventDto: UpdateEventDto) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Check if event exists
    const existingEvent = await tenantClient.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    // Validate location if provided
    if (updateEventDto.locationId) {
      const location = await tenantClient.location.findUnique({
        where: { id: updateEventDto.locationId },
      });

      if (!location) {
        throw new BadRequestException('Location not found');
      }
    }

    const event = await tenantClient.event.update({
      where: { id },
      data: updateEventDto,
      include: {
        campus: true,
        location: true,
        organizer: {
          include: {
            person: true,
          },
        },
        registrations: true,
      },
    });

    return this.mapEventToGraphQL(event);
  }

  async remove(id: string, tenantId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const event = await tenantClient.event.findUnique({
      where: { id },
      include: {
        registrations: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if event has registrations
    if (event.registrations.length > 0) {
      throw new BadRequestException(
        'Cannot delete event with existing registrations',
      );
    }

    await tenantClient.event.delete({
      where: { id },
    });

    return true;
  }

  async cancelEvent(id: string, tenantId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const existingEvent = await tenantClient.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    const event = await tenantClient.event.update({
      where: { id },
      data: { isCancelled: true },
      include: {
        campus: true,
        location: true,
        organizer: {
          include: {
            person: true,
          },
        },
      },
    });

    return this.mapEventToGraphQL(event);
  }

  // Event Registration methods
  async registerForEvent(
    tenantId: string,
    userId: string,
    registrationDto: CreateEventRegistrationDto,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    // Check if event exists and registration is allowed
    const event = await tenantClient.event.findUnique({
      where: { id: registrationDto.eventId },
      include: {
        registrations: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.isCancelled) {
      throw new BadRequestException('Cannot register for cancelled event');
    }

    if (
      event.registrationRequired &&
      event.registrationDeadline &&
      new Date() > event.registrationDeadline
    ) {
      throw new BadRequestException('Registration deadline has passed');
    }

    if (
      event.maxAttendees &&
      event.registrations.length >= event.maxAttendees
    ) {
      throw new BadRequestException('Event is full');
    }

    // Check if already registered
    const existingRegistration = await tenantClient.eventRegistration.findFirst(
      {
        where: {
          eventId: registrationDto.eventId,
          userId,
          studentId: registrationDto.studentId || null,
        },
      },
    );

    if (existingRegistration) {
      throw new BadRequestException('Already registered for this event');
    }

    const registration = await tenantClient.eventRegistration.create({
      data: {
        eventId: registrationDto.eventId,
        studentId: registrationDto.studentId || null,
        numberOfGuests: registrationDto.numberOfGuests || 0,
        notes: registrationDto.notes || null,
        status: 'registered',
        userId,
      },
      include: {
        event: true,
        student: {
          include: {
            person: true,
          },
        },
      },
    });

    return this.mapEventRegistrationToGraphQL(registration);
  }

  async updateRegistration(
    registrationId: string,
    tenantId: string,
    userId: string,
    updateRegistrationDto: UpdateEventRegistrationDto,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const registration = await tenantClient.eventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.userId !== userId) {
      throw new ForbiddenException(
        'Not authorized to update this registration',
      );
    }

    if (registration.event.isCancelled) {
      throw new BadRequestException(
        'Cannot update registration for cancelled event',
      );
    }

    const updatedRegistration = await tenantClient.eventRegistration.update({
      where: { id: registrationId },
      data: updateRegistrationDto,
      include: {
        event: true,
        student: {
          include: {
            person: true,
          },
        },
      },
    });

    return this.mapEventRegistrationToGraphQL(updatedRegistration);
  }

  async cancelRegistration(
    registrationId: string,
    tenantId: string,
    userId: string,
  ) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const registration = await tenantClient.eventRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.userId !== userId) {
      throw new ForbiddenException(
        'Not authorized to cancel this registration',
      );
    }

    const cancelledRegistration = await tenantClient.eventRegistration.update({
      where: { id: registrationId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
      include: {
        student: {
          include: {
            person: true,
          },
        },
      },
    });

    return this.mapEventRegistrationToGraphQL(cancelledRegistration);
  }

  async getEventRegistrations(eventId: string, tenantId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const registrations = await tenantClient.eventRegistration.findMany({
      where: { eventId },
      include: {
        student: {
          include: {
            person: true,
          },
        },
        parent: {
          include: {
            person: true,
          },
        },
      },
      orderBy: {
        registeredAt: 'asc',
      },
    });

    return registrations.map((registration) =>
      this.mapEventRegistrationToGraphQL(registration),
    );
  }

  async getUserEventRegistrations(tenantId: string, userId: string) {
    const tenantClient = this.prisma.getTenantClient(tenantId);

    const registrations = await tenantClient.eventRegistration.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            campus: true,
            location: true,
          },
        },
        student: {
          include: {
            person: true,
          },
        },
      },
      orderBy: {
        registeredAt: 'desc',
      },
    });

    return registrations.map((registration) =>
      this.mapEventRegistrationToGraphQL(registration),
    );
  }
}
