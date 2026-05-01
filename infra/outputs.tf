# ── Sensitive values (read with: tofu output -raw <name>) ─────────────────────

output "auth_secret" {
  description = "AUTH_SECRET — managed via Vercel module; here for reference"
  value       = module.secrets.auth_secret
  sensitive   = true
}

output "database_url" {
  description = "DATABASE_URL — managed via Vercel module; here for reference"
  value       = module.data.database_url
  sensitive   = true
}

output "agent_api_key" {
  description = "AGENT_API_KEY — managed via Vercel module; here for reference"
  value       = module.secrets.agent_api_key
  sensitive   = true
}

# ── CI/CD reference ───────────────────────────────────────────────────────────

output "ecr_repository_url" {
  description = "ECR URL — used by CI to push agent images"
  value       = module.compute.ecr_repository_url
}

output "agent_url" {
  description = "AGENT_URL — managed via Vercel module; here for reference"
  value       = module.compute.agent_url
}

output "vercel_project_url" {
  description = "Vercel project URL"
  value       = module.vercel.project_url
}

output "hyperdx_ui_url" {
  description = "HyperDX dashboard — open this in your browser after first apply"
  value       = module.observability.ui_url
}

output "otlp_endpoint" {
  description = "OTLP HTTP ingest endpoint (for reference)"
  value       = module.observability.otlp_endpoint
}

output "admin_github_logins" {
  description = "ADMIN_GITHUB_LOGINS — as configured in tfvars"
  value       = var.admin_github_logins
}
