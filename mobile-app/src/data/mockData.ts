// Centralized mock data for development
// This file contains all mock data used across the application for development purposes

export interface MockStudent {
  id: string;
  name: string;
  grade: string;
  section: string;
}

export interface MockNewsItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  authorRole: string;
  category: string;
  publishedAt: Date;
  imageUrl?: string;
  priority: 'normal' | 'high' | 'urgent';
  attachments?: string[];
  isRead?: boolean;
  studentId?: string;
  studentName?: string;
}

export interface MockEventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  time: string;
  category: string;
  imageUrl?: string;
  attendees?: number;
  maxAttendees?: number;
  isRegistered?: boolean;
  isRead?: boolean;
  studentId?: string;
  studentName?: string;
}

export interface MockMessage {
  id: string;
  sender: string;
  senderRole: string;
  subject: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  attachments?: string[];
  studentId?: string;
  studentName?: string;
}

export interface MockChat {
  id: string;
  participants: string[];
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isGroup: boolean;
  type: 'teacher' | 'admin' | 'parent' | 'group';
}

export interface MockExitPermission {
  id: string;
  studentId: string;
  studentName: string;
  requestedBy: string;
  authorizedPerson: string;
  date: Date;
  time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface MockReport {
  id: string;
  studentId: string;
  studentName: string;
  type: 'grades' | 'behavior' | 'attendance' | 'general';
  title: string;
  period: string;
  date: Date;
  summary: string;
  downloadUrl?: string;
}

// Mock Students
export const mockStudents: MockStudent[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    grade: '3ro',
    section: 'A',
  },
  {
    id: '2',
    name: 'María Pérez',
    grade: '5to',
    section: 'B',
  },
];

// Mock News
export const mockNews: MockNewsItem[] = [
  {
    id: '1',
    title: 'Reunión de Padres - 3er Grado',
    summary: 'Se convoca a reunión de padres para el próximo viernes',
    content: 'Estimados padres de familia, los esperamos el próximo viernes a las 18:00 hrs en el aula de 3er grado para tratar temas académicos y de comportamiento. Es importante su asistencia para el seguimiento del progreso de sus hijos.',
    author: 'Prof. María García',
    authorRole: 'Directora',
    category: 'Académico',
    publishedAt: new Date(),
    priority: 'high',
    imageUrl: 'https://via.placeholder.com/400x200',
    isRead: false,
    studentId: '1',
    studentName: 'Juan Pérez',
  },
  {
    id: '2',
    title: 'Festival de Primavera 2024',
    summary: 'Gran festival con actividades para toda la familia',
    content: 'Este año celebraremos nuestro tradicional festival de primavera con actividades para toda la familia. Habrá presentaciones artísticas, juegos, comida típica y mucho más. Los esperamos el sábado 15 de octubre de 10:00 a 18:00 hrs.',
    author: 'Coord. Eventos',
    authorRole: 'Administración',
    category: 'Eventos',
    publishedAt: new Date(Date.now() - 86400000),
    priority: 'normal',
    imageUrl: 'https://via.placeholder.com/400x200',
    isRead: true,
  },
  {
    id: '3',
    title: 'Cambio de Horario Temporal',
    summary: 'Salida anticipada el día jueves por mantenimiento',
    content: 'Se informa a los padres que el día jueves 12 de octubre, los estudiantes tendrán salida anticipada a las 13:00 hrs debido a trabajos de mantenimiento en las instalaciones eléctricas del colegio.',
    author: 'Administración',
    authorRole: 'Secretaría',
    category: 'Urgente',
    publishedAt: new Date(Date.now() - 172800000),
    priority: 'urgent',
    isRead: false,
    studentId: '2',
    studentName: 'María Pérez',
  },
  {
    id: '4',
    title: 'Inscripciones Actividades Extracurriculares',
    summary: 'Abiertas las inscripciones para deportes y artes',
    content: 'Ya están disponibles las inscripciones para las actividades extracurriculares del segundo semestre. Incluimos fútbol, básquet, teatro, música y arte. Las inscripciones estarán abiertas hasta el 20 de octubre.',
    author: 'Depto. Deportes',
    authorRole: 'Coordinación',
    category: 'Deportes',
    publishedAt: new Date(Date.now() - 259200000),
    priority: 'normal',
    imageUrl: 'https://via.placeholder.com/400x200',
    isRead: true,
    studentId: '1',
    studentName: 'Juan Pérez',
  },
];

// Mock Events
export const mockEvents: MockEventItem[] = [
  {
    id: '1',
    title: 'Festival de Primavera',
    description: 'Gran festival con actividades para toda la familia',
    location: 'Patio Principal',
    date: new Date(Date.now() + 86400000 * 7),
    time: '10:00 - 18:00',
    category: 'Festival',
    imageUrl: 'https://via.placeholder.com/400x200',
    attendees: 45,
    maxAttendees: 100,
    isRegistered: true,
    isRead: false,
  },
  {
    id: '2',
    title: 'Reunión de Padres 3er Grado',
    description: 'Reunión informativa sobre el progreso académico',
    location: 'Sala de Conferencias',
    date: new Date(Date.now() + 86400000 * 3),
    time: '18:30',
    category: 'Reunión',
    attendees: 25,
    maxAttendees: 30,
    isRegistered: false,
    isRead: false,
    studentId: '1',
    studentName: 'Juan Pérez',
  },
  {
    id: '3',
    title: 'Torneo de Fútbol Interescolar',
    description: 'Competencia deportiva entre colegios',
    location: 'Campo Deportivo',
    date: new Date(Date.now() + 86400000 * 14),
    time: '09:00 - 16:00',
    category: 'Deportes',
    imageUrl: 'https://via.placeholder.com/400x200',
    attendees: 80,
    maxAttendees: 100,
    isRegistered: true,
    isRead: true,
  },
  {
    id: '4',
    title: 'Obra de Teatro - Primaria',
    description: 'Presentación teatral de los estudiantes de primaria',
    location: 'Auditorio Principal',
    date: new Date(Date.now() + 86400000 * 21),
    time: '19:00',
    category: 'Cultural',
    imageUrl: 'https://via.placeholder.com/400x200',
    attendees: 35,
    maxAttendees: 150,
    isRegistered: false,
    isRead: false,
    studentId: '2',
    studentName: 'María Pérez',
  },
];

// Mock Messages
export const mockMessages: MockMessage[] = [
  {
    id: '1',
    sender: 'Prof. Ana López',
    senderRole: 'Profesora de Matemáticas',
    subject: 'Tarea de Matemáticas',
    content: 'Estimados padres, les informo que Juan ha mostrado una mejora significativa en matemáticas. Felicitaciones por el apoyo en casa.',
    timestamp: new Date(Date.now() - 3600000),
    isRead: false,
    isImportant: false,
    studentId: '1',
    studentName: 'Juan Pérez',
  },
  {
    id: '2',
    sender: 'Dirección Académica',
    senderRole: 'Administración',
    subject: 'Cronograma de Exámenes',
    content: 'Se adjunta el cronograma de exámenes del segundo trimestre. Por favor revisen las fechas y comuniquen cualquier consulta.',
    timestamp: new Date(Date.now() - 7200000),
    isRead: true,
    isImportant: true,
    attachments: ['cronograma_examenes.pdf'],
  },
  {
    id: '3',
    sender: 'Prof. Carlos Ruiz',
    senderRole: 'Profesor de Ciencias',
    subject: 'Proyecto de Ciencias',
    content: 'María ha entregado un excelente proyecto sobre el sistema solar. Será presentado en la feria de ciencias.',
    timestamp: new Date(Date.now() - 86400000),
    isRead: false,
    isImportant: false,
    studentId: '2',
    studentName: 'María Pérez',
  },
];

// Mock Chats
export const mockChats: MockChat[] = [
  {
    id: '1',
    participants: ['Prof. Ana López', 'Padre de Juan'],
    lastMessage: 'Gracias por la información, estaremos atentos',
    timestamp: new Date(Date.now() - 1800000),
    unreadCount: 2,
    isGroup: false,
    type: 'teacher',
  },
  {
    id: '2',
    participants: ['Dirección', 'Padres 3er Grado'],
    lastMessage: 'La reunión será el viernes a las 18:00',
    timestamp: new Date(Date.now() - 3600000),
    unreadCount: 0,
    isGroup: true,
    type: 'group',
  },
  {
    id: '3',
    participants: ['Secretaría', 'Padre de María'],
    lastMessage: 'Los documentos están listos para retiro',
    timestamp: new Date(Date.now() - 7200000),
    unreadCount: 1,
    isGroup: false,
    type: 'admin',
  },
];

// Mock Exit Permissions
export const mockExitPermissions: MockExitPermission[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Juan Pérez',
    requestedBy: 'Madre - Carmen Pérez',
    authorizedPerson: 'Abuela - Rosa García',
    date: new Date(Date.now() + 86400000),
    time: '14:30',
    reason: 'Cita médica',
    status: 'pending',
    notes: 'Cita con el dentista',
  },
  {
    id: '2',
    studentId: '1',
    studentName: 'Juan Pérez',
    requestedBy: 'Padre - Luis Pérez',
    authorizedPerson: 'Padre - Luis Pérez',
    date: new Date(Date.now() - 86400000 * 7),
    time: '15:00',
    reason: 'Compromiso familiar',
    status: 'approved',
    notes: 'Cumpleaños de familiar',
  },
  {
    id: '3',
    studentId: '2',
    studentName: 'María Pérez',
    requestedBy: 'Madre - Carmen Pérez',
    authorizedPerson: 'Tía - Ana Pérez',
    date: new Date(Date.now() - 86400000 * 3),
    time: '13:00',
    reason: 'Cita médica',
    status: 'rejected',
    notes: 'Documentación incompleta',
  },
];

// Mock Reports
export const mockReports: MockReport[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Juan Pérez',
    type: 'grades',
    title: 'Boletín de Calificaciones - Q3 2024',
    period: '3er Trimestre 2024',
    date: new Date(Date.now() - 86400000 * 5),
    summary: 'Promedio general: 8.5 - Buen rendimiento académico',
    downloadUrl: 'boletin_q3_2024_juan.pdf',
  },
  {
    id: '2',
    studentId: '1',
    studentName: 'Juan Pérez',
    type: 'behavior',
    title: 'Reporte de Comportamiento - Octubre',
    period: 'Octubre 2024',
    date: new Date(Date.now() - 86400000 * 10),
    summary: 'Comportamiento ejemplar durante el mes',
  },
  {
    id: '3',
    studentId: '2',
    studentName: 'María Pérez',
    type: 'grades',
    title: 'Boletín de Calificaciones - Q3 2024',
    period: '3er Trimestre 2024',
    date: new Date(Date.now() - 86400000 * 5),
    summary: 'Promedio general: 9.2 - Excelente rendimiento académico',
    downloadUrl: 'boletin_q3_2024_maria.pdf',
  },
  {
    id: '4',
    studentId: '2',
    studentName: 'María Pérez',
    type: 'attendance',
    title: 'Reporte de Asistencia - Octubre',
    period: 'Octubre 2024',
    date: new Date(Date.now() - 86400000 * 2),
    summary: 'Asistencia: 100% - Sin faltas ni tardanzas',
  },
];

// Helper functions
export const getStudentById = (id: string): MockStudent | undefined => {
  return mockStudents.find(student => student.id === id);
};

export const getNewsByStudent = (studentId: string): MockNewsItem[] => {
  return mockNews.filter(news => news.studentId === studentId);
};

export const getEventsByStudent = (studentId: string): MockEventItem[] => {
  return mockEvents.filter(event => event.studentId === studentId);
};

export const getMessagesByStudent = (studentId: string): MockMessage[] => {
  return mockMessages.filter(message => message.studentId === studentId);
};

export const getPermissionsByStudent = (studentId: string): MockExitPermission[] => {
  return mockExitPermissions.filter(permission => permission.studentId === studentId);
};

export const getReportsByStudent = (studentId: string): MockReport[] => {
  return mockReports.filter(report => report.studentId === studentId);
};

// Auth mock data
export const mockAuthCredentials = {
  email: 'test@test.com',
  password: 'password123',
  user: {
    uid: 'test-user-123',
    email: 'test@test.com',
    displayName: 'Test User',
  }
};