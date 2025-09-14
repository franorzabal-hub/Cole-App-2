import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private firebaseApp: admin.app.App;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // Initialize Firebase Admin - Skip in development mode
    const isDevelopment = this.configService.get('NODE_ENV') !== 'production';

    if (isDevelopment) {
      console.log('Running in development mode - Firebase authentication bypassed');
    } else {
      if (!admin.apps.length) {
        try {
          // Try to read from file if env variables not set
          const serviceAccountPath = './firebase-service-account.json';
          const serviceAccount = require(serviceAccountPath);

          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        } catch (error) {
          console.warn('Firebase initialization failed, using mock auth:', error.message);
        }
      } else {
        this.firebaseApp = admin.app();
      }
    }
  }

  /**
   * Verify Firebase token and return/create user
   */
  async validateFirebaseToken(idToken: string) {
    const isDevelopment = this.configService.get('NODE_ENV') !== 'production';

    try {
      // In development mode, bypass Firebase and use mock authentication
      if (isDevelopment) {
        // Parse the mock token (email-based)
        const mockEmail = idToken.includes('@') ? idToken : `${idToken}@test.com`;

        // Find or create user in database
        let user = await this.prisma.user.findUnique({
          where: { email: mockEmail },
        });

        if (!user) {
          user = await this.prisma.user.create({
            data: {
              firebaseUid: `mock-${mockEmail}`,
              email: mockEmail,
              firstName: mockEmail.split('@')[0],
              lastName: 'Test',
              emailVerifiedAt: new Date(),
            },
          });
        }

        // Generate JWT token
        const payload = {
          sub: user.id,
          email: user.email,
          firebaseUid: user.firebaseUid,
        };

        return {
          user,
          accessToken: this.jwtService.sign(payload),
        };
      }

      // Production mode - use real Firebase
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Find or create user in database
      let user = await this.prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            firebaseUid: decodedToken.uid,
            email: decodedToken.email || '',
            firstName: decodedToken.name?.split(' ')[0] || '',
            lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
            emailVerifiedAt: decodedToken.email_verified ? new Date() : null,
          },
        });
      }

      // Generate JWT token
      const payload = {
        sub: user.id,
        email: user.email,
        firebaseUid: user.firebaseUid,
      };

      return {
        user,
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  /**
   * Login with email and password (creates Firebase user)
   */
  async login(email: string, password: string) {
    try {
      // This would typically be handled by Firebase Auth on the client
      // Here we just validate the user exists
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const payload = {
        sub: user.id,
        email: user.email,
        roles: user.userRoles.map((ur) => ur.role.name),
      };

      return {
        user,
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Register new user
   */
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    role: string;
  }) {
    try {
      // Create Firebase user
      const firebaseUser = await admin.auth().createUser({
        email: data.email,
        password: data.password,
        displayName: `${data.firstName} ${data.lastName}`,
      });

      // Create user in database
      const user = await this.prisma.user.create({
        data: {
          firebaseUid: firebaseUser.uid,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });

      // Assign role
      const role = await this.prisma.role.findUnique({
        where: { name: data.role },
      });

      if (role) {
        await this.prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
            tenantId: data.tenantId,
          },
        });
      }

      const payload = {
        sub: user.id,
        email: user.email,
        firebaseUid: user.firebaseUid,
      };

      return {
        user,
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Get user by ID with roles and permissions
   */
  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
        tenants: true,
      },
    });
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.getUserById(userId);

    if (!user) return false;

    // Super admin has all permissions
    if (user.isSuperAdmin) return true;

    // Check user's permissions through roles
    for (const userRole of user.userRoles) {
      const hasPermission = userRole.role.permissions.some(
        (p) => p.name === permission,
      );
      if (hasPermission) return true;
    }

    return false;
  }

  /**
   * Get user's tenants
   */
  async getUserTenants(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: true,
        tenants: true,
      },
    });

    if (!user) return [];

    // Get unique tenant IDs from user roles
    const tenantIds = [...new Set(user.userRoles.map((ur) => ur.tenantId))];

    // Fetch tenant details
    return this.prisma.tenant.findMany({
      where: {
        id: { in: tenantIds },
      },
    });
  }
}
