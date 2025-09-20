// Common TypeScript interfaces and types for ColeApp

// User Types
export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseUser {
  role: UserRole;
  tenantId?: string;
  firebaseUid?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  preferredLanguage?: string;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  STAFF = 'STAFF',
}

// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo?: string;
  settings: TenantSettings;
  subscription?: Subscription;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface TenantSettings {
  features: FeatureFlags;
  branding?: BrandingSettings;
  notifications?: NotificationSettings;
  locale?: LocaleSettings;
}

export interface FeatureFlags {
  messaging: boolean;
  assignments: boolean;
  grades: boolean;
  attendance: boolean;
  calendar: boolean;
  payments: boolean;
  reports: boolean;
  videoConferencing: boolean;
}

export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCss?: string;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  defaultChannel: 'email' | 'push' | 'sms';
}

export interface LocaleSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  tenantId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  trialEndsAt?: Date;
  cancelledAt?: Date;
  paymentMethod?: PaymentMethod;
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIALING = 'TRIALING',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'other';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

// Academic Types
export interface School {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  principalId?: string;
  academicYear: AcademicYear;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  terms: Term[];
  isActive: boolean;
}

export interface Term {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface Class {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  grade: string;
  section?: string;
  teacherId: string;
  students: string[]; // Array of student IDs
  schedule?: Schedule[];
  room?: string;
}

export interface Schedule {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  subject?: string;
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

// Communication Types
export interface Message {
  id: string;
  tenantId: string;
  senderId: string;
  recipientIds: string[];
  subject?: string;
  content: string;
  attachments?: Attachment[];
  readBy: ReadReceipt[];
  isImportant: boolean;
  category?: MessageCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface ReadReceipt {
  userId: string;
  readAt: Date;
}

export enum MessageCategory {
  GENERAL = 'GENERAL',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  HOMEWORK = 'HOMEWORK',
  EVENT = 'EVENT',
  EMERGENCY = 'EMERGENCY',
  PARENT_TEACHER = 'PARENT_TEACHER',
}

// Assignment Types
export interface Assignment {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: Date;
  points?: number;
  attachments?: Attachment[];
  submissions?: Submission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string;
  attachments?: Attachment[];
  grade?: number;
  feedback?: string;
  status: SubmissionStatus;
  submittedAt?: Date;
  gradedAt?: Date;
}

export enum SubmissionStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  LATE = 'LATE',
  GRADED = 'GRADED',
  RETURNED = 'RETURNED',
}

// Grade Types
export interface Grade {
  id: string;
  studentId: string;
  classId: string;
  termId: string;
  subject: string;
  assessments: Assessment[];
  finalGrade?: number;
  letterGrade?: string;
  comments?: string;
}

export interface Assessment {
  id: string;
  name: string;
  type: AssessmentType;
  score: number;
  maxScore: number;
  weight?: number;
  date: Date;
}

export enum AssessmentType {
  EXAM = 'EXAM',
  QUIZ = 'QUIZ',
  HOMEWORK = 'HOMEWORK',
  PROJECT = 'PROJECT',
  PARTICIPATION = 'PARTICIPATION',
  OTHER = 'OTHER',
}

// Attendance Types
export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
  markedBy: string;
  markedAt: Date;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
  HOLIDAY = 'HOLIDAY',
}

// Event Types
export interface Event {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  type: EventType;
  visibility: EventVisibility;
  attendees?: string[]; // User IDs
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum EventType {
  ACADEMIC = 'ACADEMIC',
  SPORTS = 'SPORTS',
  CULTURAL = 'CULTURAL',
  MEETING = 'MEETING',
  HOLIDAY = 'HOLIDAY',
  EXAM = 'EXAM',
  OTHER = 'OTHER',
}

export enum EventVisibility {
  PUBLIC = 'PUBLIC',
  SCHOOL = 'SCHOOL',
  CLASS = 'CLASS',
  PRIVATE = 'PRIVATE',
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

export enum NotificationType {
  MESSAGE = 'MESSAGE',
  ASSIGNMENT = 'ASSIGNMENT',
  GRADE = 'GRADE',
  ATTENDANCE = 'ATTENDANCE',
  EVENT = 'EVENT',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  SYSTEM = 'SYSTEM',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ResponseMetadata {
  timestamp: Date;
  version: string;
  requestId: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  tenantId?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Export all enums together for convenience
export const Enums = {
  UserRole,
  SubscriptionPlan,
  SubscriptionStatus,
  DayOfWeek,
  MessageCategory,
  SubmissionStatus,
  AssessmentType,
  AttendanceStatus,
  EventType,
  EventVisibility,
  NotificationType,
  NotificationPriority,
};