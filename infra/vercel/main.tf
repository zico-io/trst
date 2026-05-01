terraform {
  required_providers {
    vercel = {
      source  = "registry.terraform.io/vercel/vercel"
      version = "~> 2.0"
    }
  }
}

resource "vercel_project" "web" {
  name           = var.project_name
  framework      = "nextjs"
  root_directory = "apps/web"

  git_repository = {
    type              = "github"
    repo              = var.github_repo
    production_branch = "main"
  }
}

# ── Environment variables managed by OpenTofu ─────────────────────────────────
# AUTH_GITHUB_ID and AUTH_GITHUB_SECRET are set manually in the Vercel dashboard.

resource "vercel_project_environment_variable" "auth_secret" {
  project_id = vercel_project.web.id
  key        = "AUTH_SECRET"
  value      = var.auth_secret
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "database_url" {
  project_id = vercel_project.web.id
  key        = "DATABASE_URL"
  value      = var.database_url
  target     = ["production"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "agent_url" {
  project_id = vercel_project.web.id
  key        = "AGENT_URL"
  value      = var.agent_url
  target     = ["production"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "agent_api_key" {
  project_id = vercel_project.web.id
  key        = "AGENT_API_KEY"
  value      = var.agent_api_key
  target     = ["production"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "revalidate_secret" {
  project_id = vercel_project.web.id
  key        = "REVALIDATE_SECRET"
  value      = var.revalidate_secret
  target     = ["production"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "admin_github_logins" {
  project_id = vercel_project.web.id
  key        = "ADMIN_GITHUB_LOGINS"
  value      = var.admin_github_logins
  target     = ["production", "preview"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "field_encryption_key" {
  project_id = vercel_project.web.id
  key        = "FIELD_ENCRYPTION_KEY"
  value      = var.field_encryption_key
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "install_state_secret" {
  project_id = vercel_project.web.id
  key        = "INSTALL_STATE_SECRET"
  value      = var.install_state_secret
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "otel_endpoint" {
  count      = var.otel_exporter_otlp_endpoint != "" ? 1 : 0
  project_id = vercel_project.web.id
  key        = "OTEL_EXPORTER_OTLP_ENDPOINT"
  value      = var.otel_exporter_otlp_endpoint
  target     = ["production"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "otel_headers" {
  count      = var.otel_exporter_otlp_headers != "" ? 1 : 0
  project_id = vercel_project.web.id
  key        = "OTEL_EXPORTER_OTLP_HEADERS"
  value      = var.otel_exporter_otlp_headers
  target     = ["production"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "otel_service_name" {
  count      = var.otel_exporter_otlp_endpoint != "" ? 1 : 0
  project_id = vercel_project.web.id
  key        = "OTEL_SERVICE_NAME"
  value      = "trst-web"
  target     = ["production"]
  sensitive  = false
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "project_id" {
  value = vercel_project.web.id
}

output "project_url" {
  value = "https://${var.project_name}.vercel.app"
}
