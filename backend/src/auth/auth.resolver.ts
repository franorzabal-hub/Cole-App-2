import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  photoUrl?: string;

  @Field()
  isActive: boolean;

  @Field()
  isSuperAdmin: boolean;

  @Field(() => Date, { nullable: true })
  lastLoginAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field()
  user: User;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  tenantId: string;

  @Field({ defaultValue: 'parent' })
  role: string;
}

@InputType()
export class FirebaseAuthInput {
  @Field()
  idToken: string;
}

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput) {
    return this.authService.login(input.email, input.password);
  }

  @Mutation(() => AuthPayload)
  async register(@Args('input') input: RegisterInput) {
    return this.authService.register(input);
  }

  @Mutation(() => AuthPayload)
  async loginWithFirebase(@Args('input') input: FirebaseAuthInput) {
    return this.authService.validateFirebaseToken(input.idToken);
  }

  @Query(() => User, { nullable: true })
  async me(@Context() context: any) {
    // Get user from context (set by auth guard)
    const userId = context.req?.user?.sub;
    if (!userId) return null;

    return this.authService.getUserById(userId);
  }

  @Query(() => [String])
  async myPermissions(@Context() context: any) {
    const userId = context.req?.user?.sub;
    if (!userId) return [];

    const user = await this.authService.getUserById(userId);
    if (!user) return [];

    const permissions = new Set<string>();

    for (const userRole of user.userRoles) {
      for (const permission of userRole.role.permissions) {
        permissions.add(permission.name);
      }
    }

    return Array.from(permissions);
  }
}
