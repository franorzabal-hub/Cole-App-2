terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.10"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.10"
    }
  }

  backend "gcs" {
    bucket = "coleapp-terraform-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudrun.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "storage.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudtrace.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "compute.googleapis.com",
    "servicenetworking.googleapis.com"
  ])

  service            = each.key
  disable_on_destroy = false
}

# VPC Network
resource "google_compute_network" "vpc_network" {
  name                    = "coleapp-vpc"
  auto_create_subnetworks = false
  depends_on              = [google_project_service.required_apis]
}

resource "google_compute_subnetwork" "subnet" {
  name          = "coleapp-subnet"
  ip_cidr_range = "10.0.0.0/24"
  network       = google_compute_network.vpc_network.id
  region        = var.region

  private_ip_google_access = true
}

# Cloud SQL (PostgreSQL)
resource "google_sql_database_instance" "postgres" {
  name             = "coleapp-postgres-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier              = var.environment == "production" ? "db-g1-small" : "db-f1-micro"
    availability_type = var.environment == "production" ? "REGIONAL" : "ZONAL"

    database_flags {
      name  = "max_connections"
      value = "100"
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = var.environment == "production"
      backup_retention_settings {
        retained_backups = 7
        retention_unit   = "COUNT"
      }
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc_network.id
      require_ssl     = true
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }
  }

  deletion_protection = var.environment == "production"
  depends_on          = [google_project_service.required_apis, google_service_networking_connection.private_vpc_connection]
}

resource "google_sql_database" "database" {
  name     = "coleapp"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "db_user" {
  name     = "coleapp_user"
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Redis (Memorystore)
resource "google_redis_instance" "cache" {
  name               = "coleapp-redis-${var.environment}"
  tier               = var.environment == "production" ? "STANDARD_HA" : "BASIC"
  memory_size_gb     = var.environment == "production" ? 5 : 1
  region             = var.region
  authorized_network = google_compute_network.vpc_network.id

  redis_version = "REDIS_7_0"
  display_name  = "ColeApp Redis Cache"

  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 3
        minutes = 0
      }
    }
  }

  depends_on = [google_project_service.required_apis]
}

# Cloud Storage Buckets
resource "google_storage_bucket" "app_storage" {
  name          = "${var.project_id}-app-storage"
  location      = var.region
  force_destroy = var.environment != "production"

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "Delete"
    }
  }

  versioning {
    enabled = true
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_storage_bucket" "backups" {
  name          = "${var.project_id}-backups"
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }

  versioning {
    enabled = true
  }

  depends_on = [google_project_service.required_apis]
}

# Artifact Registry
resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = "coleapp-docker"
  description   = "Docker repository for ColeApp"
  format        = "DOCKER"

  depends_on = [google_project_service.required_apis]
}

# Secret Manager
resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password"

  replication {
    automatic = true
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"

  replication {
    automatic = true
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = random_password.jwt_secret.result
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

# Service Account for Cloud Run
resource "google_service_account" "cloud_run_sa" {
  account_id   = "coleapp-cloud-run"
  display_name = "ColeApp Cloud Run Service Account"
}

resource "google_project_iam_member" "cloud_run_permissions" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/redis.editor",
    "roles/storage.objectAdmin",
    "roles/secretmanager.secretAccessor",
    "roles/logging.logWriter",
    "roles/cloudtrace.agent"
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Cloud Run Services
resource "google_cloud_run_service" "backend" {
  name     = "coleapp-backend"
  location = var.region

  template {
    spec {
      service_account_name = google_service_account.cloud_run_sa.email
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/coleapp-docker/backend:latest"

        env {
          name  = "NODE_ENV"
          value = var.environment
        }

        env {
          name = "DATABASE_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.db_connection_string.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name  = "REDIS_HOST"
          value = google_redis_instance.cache.host
        }

        env {
          name  = "REDIS_PORT"
          value = google_redis_instance.cache.port
        }

        env {
          name = "JWT_SECRET"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.jwt_secret.secret_id
              key  = "latest"
            }
          }
        }

        resources {
          limits = {
            cpu    = var.environment == "production" ? "2" : "1"
            memory = var.environment == "production" ? "2Gi" : "512Mi"
          }
        }
      }
    }

    metadata {
      annotations = {
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.postgres.connection_name
        "autoscaling.knative.dev/minScale"      = var.environment == "production" ? "2" : "0"
        "autoscaling.knative.dev/maxScale"      = var.environment == "production" ? "100" : "10"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_project_service.required_apis,
    google_sql_database_instance.postgres,
    google_redis_instance.cache
  ]
}

resource "google_cloud_run_service" "web_admin" {
  name     = "coleapp-web-admin"
  location = var.region

  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/coleapp-docker/web-admin:latest"

        env {
          name  = "NEXT_PUBLIC_API_URL"
          value = google_cloud_run_service.backend.status[0].url
        }

        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_project_service.required_apis,
    google_cloud_run_service.backend
  ]
}

# IAM for Cloud Run services (public access)
resource "google_cloud_run_service_iam_member" "backend_public" {
  service  = google_cloud_run_service.backend.name
  location = google_cloud_run_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "web_admin_public" {
  service  = google_cloud_run_service.web_admin.name
  location = google_cloud_run_service.web_admin.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Private Service Connection for Cloud SQL
resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc_network.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
  depends_on              = [google_project_service.required_apis]
}

# Database connection string secret
resource "google_secret_manager_secret" "db_connection_string" {
  secret_id = "db-connection-string"

  replication {
    automatic = true
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "db_connection_string" {
  secret      = google_secret_manager_secret.db_connection_string.id
  secret_data = "postgresql://${google_sql_user.db_user.name}:${random_password.db_password.result}@${google_sql_database_instance.postgres.private_ip_address}:5432/${google_sql_database.database.name}"

  depends_on = [
    google_sql_database_instance.postgres,
    google_sql_user.db_user,
    google_sql_database.database
  ]
}

# Outputs
output "backend_url" {
  value = google_cloud_run_service.backend.status[0].url
}

output "web_admin_url" {
  value = google_cloud_run_service.web_admin.status[0].url
}

output "database_connection_name" {
  value     = google_sql_database_instance.postgres.connection_name
  sensitive = true
}

output "redis_host" {
  value = google_redis_instance.cache.host
}

output "storage_bucket" {
  value = google_storage_bucket.app_storage.name
}