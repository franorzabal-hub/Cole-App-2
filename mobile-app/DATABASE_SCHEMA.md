# ColeApp - Esquema de Base de Datos

## Tablas Principales

### 1. **schools** (Colegios)
```sql
- id: UUID PRIMARY KEY
- name: VARCHAR(255) NOT NULL
- logo_url: TEXT
- primary_color: VARCHAR(7)
- secondary_color: VARCHAR(7)
- contact_email: VARCHAR(255)
- contact_phone: VARCHAR(50)
- website: VARCHAR(255)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 2. **campuses** (Sedes)
```sql
- id: UUID PRIMARY KEY
- school_id: UUID FOREIGN KEY -> schools(id)
- name: VARCHAR(255) NOT NULL
- address: TEXT
- city: VARCHAR(100)
- postal_code: VARCHAR(20)
- phone: VARCHAR(50)
- email: VARCHAR(255)
- is_main: BOOLEAN DEFAULT false
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 3. **locations** (Lugares/Espacios)
```sql
- id: UUID PRIMARY KEY
- campus_id: UUID FOREIGN KEY -> campuses(id)
- name: VARCHAR(255) NOT NULL (ej: "Sala de Actos", "Patio Principal")
- type: ENUM('classroom', 'auditorium', 'sports_field', 'cafeteria', 'library', 'office', 'other')
- capacity: INTEGER
- floor: VARCHAR(50)
- building: VARCHAR(100)
- description: TEXT
- is_active: BOOLEAN DEFAULT true
- created_at: TIMESTAMP
```

### 4. **people** (Personas)
```sql
- id: UUID PRIMARY KEY
- document_type: ENUM('dni', 'passport', 'other')
- document_number: VARCHAR(50) UNIQUE
- first_name: VARCHAR(100) NOT NULL
- last_name: VARCHAR(100) NOT NULL
- date_of_birth: DATE
- gender: ENUM('male', 'female', 'other')
- blood_type: VARCHAR(5)
- medical_notes: TEXT
- emergency_contact_name: VARCHAR(255)
- emergency_contact_phone: VARCHAR(50)
- photo_url: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 5. **users** (Usuarios del Sistema)
```sql
- id: UUID PRIMARY KEY
- person_id: UUID FOREIGN KEY -> people(id) UNIQUE
- email: VARCHAR(255) UNIQUE NOT NULL
- password_hash: VARCHAR(255) NOT NULL
- phone: VARCHAR(50)
- notification_preferences: JSONB
- language: VARCHAR(5) DEFAULT 'es'
- timezone: VARCHAR(50) DEFAULT 'America/Buenos_Aires'
- is_active: BOOLEAN DEFAULT true
- last_login_at: TIMESTAMP
- email_verified_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 6. **students** (Estudiantes/Alumnos)
```sql
- id: UUID PRIMARY KEY
- person_id: UUID FOREIGN KEY -> people(id) UNIQUE
- campus_id: UUID FOREIGN KEY -> campuses(id)
- student_code: VARCHAR(50) UNIQUE
- enrollment_date: DATE
- grade_level: VARCHAR(50)
- section: VARCHAR(10)
- academic_year: INTEGER
- status: ENUM('active', 'inactive', 'graduated', 'transferred')
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 7. **classes** (Clases/Cursos)
```sql
- id: UUID PRIMARY KEY
- campus_id: UUID FOREIGN KEY -> campuses(id)
- name: VARCHAR(255) NOT NULL (ej: "3er Grado A")
- grade_level: VARCHAR(50)
- section: VARCHAR(10)
- academic_year: INTEGER
- primary_teacher_id: UUID FOREIGN KEY -> users(id)
- location_id: UUID FOREIGN KEY -> locations(id)
- max_students: INTEGER
- is_active: BOOLEAN DEFAULT true
- created_at: TIMESTAMP
```

### 8. **roles** (Roles)
```sql
- id: UUID PRIMARY KEY
- name: VARCHAR(50) UNIQUE NOT NULL (ej: 'parent', 'teacher', 'admin', 'director')
- display_name: VARCHAR(100)
- description: TEXT
- is_system: BOOLEAN DEFAULT false
- created_at: TIMESTAMP
```

### 9. **permissions** (Permisos)
```sql
- id: UUID PRIMARY KEY
- name: VARCHAR(100) UNIQUE NOT NULL (ej: 'news.create', 'events.manage')
- display_name: VARCHAR(255)
- description: TEXT
- module: VARCHAR(50) (ej: 'news', 'events', 'messages')
- created_at: TIMESTAMP
```

## Tablas de Relaciones

### 10. **user_roles** (Usuarios-Roles)
```sql
- id: UUID PRIMARY KEY
- user_id: UUID FOREIGN KEY -> users(id)
- role_id: UUID FOREIGN KEY -> roles(id)
- campus_id: UUID FOREIGN KEY -> campuses(id) NULLABLE
- assigned_at: TIMESTAMP
- assigned_by: UUID FOREIGN KEY -> users(id)
- UNIQUE(user_id, role_id, campus_id)
```

### 11. **role_permissions** (Roles-Permisos)
```sql
- role_id: UUID FOREIGN KEY -> roles(id)
- permission_id: UUID FOREIGN KEY -> permissions(id)
- PRIMARY KEY(role_id, permission_id)
```

### 12. **family_relationships** (Relaciones Familiares)
```sql
- id: UUID PRIMARY KEY
- student_id: UUID FOREIGN KEY -> students(id)
- user_id: UUID FOREIGN KEY -> users(id)
- relationship_type: ENUM('father', 'mother', 'guardian', 'tutor', 'other')
- is_primary_contact: BOOLEAN DEFAULT false
- can_pickup: BOOLEAN DEFAULT true
- can_view_grades: BOOLEAN DEFAULT true
- can_authorize_exits: BOOLEAN DEFAULT false
- notes: TEXT
- created_at: TIMESTAMP
```

### 13. **student_classes** (Estudiantes-Clases)
```sql
- student_id: UUID FOREIGN KEY -> students(id)
- class_id: UUID FOREIGN KEY -> classes(id)
- enrollment_date: DATE
- withdrawal_date: DATE NULLABLE
- status: ENUM('active', 'withdrawn', 'completed')
- PRIMARY KEY(student_id, class_id)
```

### 14. **teacher_classes** (Profesores-Clases)
```sql
- teacher_id: UUID FOREIGN KEY -> users(id)
- class_id: UUID FOREIGN KEY -> classes(id)
- subject: VARCHAR(100) (ej: "Matemáticas", "Lengua")
- is_primary: BOOLEAN DEFAULT false
- PRIMARY KEY(teacher_id, class_id, subject)
```

## Tablas de Contenido

### 15. **news** (Novedades)
```sql
- id: UUID PRIMARY KEY
- campus_id: UUID FOREIGN KEY -> campuses(id)
- title: VARCHAR(255) NOT NULL
- content: TEXT NOT NULL
- summary: TEXT
- author_id: UUID FOREIGN KEY -> users(id)
- category: VARCHAR(50)
- priority: ENUM('low', 'normal', 'high', 'urgent')
- image_url: TEXT
- attachment_urls: JSONB
- target_audience: ENUM('all', 'parents', 'teachers', 'students')
- is_published: BOOLEAN DEFAULT false
- published_at: TIMESTAMP
- expires_at: TIMESTAMP NULLABLE
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 16. **events** (Eventos)
```sql
- id: UUID PRIMARY KEY
- campus_id: UUID FOREIGN KEY -> campuses(id)
- title: VARCHAR(255) NOT NULL
- description: TEXT
- location_id: UUID FOREIGN KEY -> locations(id) NULLABLE
- location_text: VARCHAR(255)
- start_datetime: TIMESTAMP NOT NULL
- end_datetime: TIMESTAMP
- category: VARCHAR(50)
- image_url: TEXT
- organizer_id: UUID FOREIGN KEY -> users(id)
- max_attendees: INTEGER
- registration_required: BOOLEAN DEFAULT false
- registration_deadline: TIMESTAMP
- allow_guests: BOOLEAN DEFAULT false
- price: DECIMAL(10,2)
- requirements: TEXT
- is_cancelled: BOOLEAN DEFAULT false
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 17. **messages** (Mensajes)
```sql
- id: UUID PRIMARY KEY
- sender_id: UUID FOREIGN KEY -> users(id)
- subject: VARCHAR(255)
- content: TEXT NOT NULL
- priority: ENUM('low', 'normal', 'high')
- type: ENUM('announcement', 'inquiry', 'response', 'notification')
- allow_replies: BOOLEAN DEFAULT true
- parent_message_id: UUID FOREIGN KEY -> messages(id) NULLABLE
- attachment_urls: JSONB
- sent_at: TIMESTAMP
- created_at: TIMESTAMP
```

### 18. **exit_permissions** (Cambios de Salida)
```sql
- id: UUID PRIMARY KEY
- student_id: UUID FOREIGN KEY -> students(id)
- requested_by: UUID FOREIGN KEY -> users(id)
- authorized_person_name: VARCHAR(255)
- authorized_person_document: VARCHAR(50)
- authorized_person_phone: VARCHAR(50)
- relationship: VARCHAR(100)
- exit_date: DATE NOT NULL
- exit_time: TIME
- return_time: TIME NULLABLE
- reason: TEXT
- transportation_method: VARCHAR(100)
- status: ENUM('pending', 'approved', 'rejected', 'cancelled')
- approved_by: UUID FOREIGN KEY -> users(id) NULLABLE
- approved_at: TIMESTAMP
- rejection_reason: TEXT
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 19. **reports** (Boletines e Informes)
```sql
- id: UUID PRIMARY KEY
- student_id: UUID FOREIGN KEY -> students(id) NULLABLE
- class_id: UUID FOREIGN KEY -> classes(id) NULLABLE
- type: ENUM('grade_report', 'behavior_report', 'attendance_report', 'general_report')
- title: VARCHAR(255)
- period: VARCHAR(50) (ej: "1er Trimestre 2024")
- content: JSONB
- file_url: TEXT
- generated_by: UUID FOREIGN KEY -> users(id)
- is_final: BOOLEAN DEFAULT false
- created_at: TIMESTAMP
```

## Tablas de Interacción

### 20. **news_targets** (Destinatarios de Novedades)
```sql
- news_id: UUID FOREIGN KEY -> news(id)
- target_type: ENUM('class', 'student', 'role')
- target_id: UUID
- PRIMARY KEY(news_id, target_type, target_id)
```

### 21. **news_reads** (Lecturas de Novedades)
```sql
- news_id: UUID FOREIGN KEY -> news(id)
- user_id: UUID FOREIGN KEY -> users(id)
- read_at: TIMESTAMP
- PRIMARY KEY(news_id, user_id)
```

### 22. **event_registrations** (Inscripciones a Eventos)
```sql
- id: UUID PRIMARY KEY
- event_id: UUID FOREIGN KEY -> events(id)
- user_id: UUID FOREIGN KEY -> users(id)
- student_id: UUID FOREIGN KEY -> students(id) NULLABLE
- number_of_guests: INTEGER DEFAULT 0
- status: ENUM('registered', 'waitlisted', 'cancelled')
- notes: TEXT
- registered_at: TIMESTAMP
- cancelled_at: TIMESTAMP
```

### 23. **message_recipients** (Destinatarios de Mensajes)
```sql
- message_id: UUID FOREIGN KEY -> messages(id)
- recipient_type: ENUM('user', 'role', 'class')
- recipient_id: UUID
- is_read: BOOLEAN DEFAULT false
- read_at: TIMESTAMP
- PRIMARY KEY(message_id, recipient_type, recipient_id)
```

### 24. **report_access_log** (Log de Acceso a Informes)
```sql
- report_id: UUID FOREIGN KEY -> reports(id)
- user_id: UUID FOREIGN KEY -> users(id)
- accessed_at: TIMESTAMP
- ip_address: INET
- PRIMARY KEY(report_id, user_id, accessed_at)
```

### 25. **notifications** (Notificaciones Push/Email)
```sql
- id: UUID PRIMARY KEY
- user_id: UUID FOREIGN KEY -> users(id)
- type: ENUM('push', 'email', 'sms')
- title: VARCHAR(255)
- message: TEXT
- data: JSONB
- is_read: BOOLEAN DEFAULT false
- sent_at: TIMESTAMP
- read_at: TIMESTAMP
- created_at: TIMESTAMP
```

## Índices Recomendados

```sql
-- Búsquedas frecuentes
CREATE INDEX idx_students_campus ON students(campus_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_news_published ON news(is_published, published_at);
CREATE INDEX idx_events_dates ON events(start_datetime, end_datetime);
CREATE INDEX idx_messages_sender ON messages(sender_id, sent_at);
CREATE INDEX idx_exit_permissions_date ON exit_permissions(exit_date, status);

-- Relaciones familiares
CREATE INDEX idx_family_student ON family_relationships(student_id);
CREATE INDEX idx_family_user ON family_relationships(user_id);

-- Lecturas y notificaciones
CREATE INDEX idx_news_reads_user ON news_reads(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```

## Notas de Implementación

1. **Seguridad**:
   - Usar UUID para todos los IDs para evitar ataques de enumeración
   - Encriptar datos sensibles como información médica
   - Implementar auditoría de cambios en tablas críticas

2. **Performance**:
   - Implementar soft deletes donde sea apropiado
   - Usar JSONB para datos flexibles que no requieren queries complejos
   - Considerar particionamiento para tablas de logs y notificaciones

3. **Escalabilidad**:
   - Diseñado para soportar múltiples colegios y sedes
   - Estructura flexible de permisos y roles
   - Soporte para diferentes tipos de relaciones familiares

4. **Integridad**:
   - Constraints para evitar duplicados
   - Triggers para mantener consistencia (ej: actualizar contadores)
   - Validaciones a nivel de base de datos