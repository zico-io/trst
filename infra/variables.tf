variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
  validation {
    condition     = contains(["production", "staging"], var.environment)
    error_message = "environment must be production or staging"
  }
}

variable "region" {
  description = "AWS region for all resources"
  type        = string
}

variable "admin_github_logins" {
  description = "Comma-separated GitHub logins allowed to access /admin"
  type        = string
}

variable "vercel_team_id" {
  description = "Vercel team ID (leave empty for a personal account)"
  type        = string
  default     = ""
}

variable "revalidate_url" {
  description = "Full URL of apps/web /api/revalidate — used by the agent after each audit"
  type        = string
  # e.g. "https://trst.vercel.app/api/revalidate"
}

variable "github_owner" {
  description = "GitHub owner for issue creation (only needed when issue_backend = github in admin)"
  type        = string
  default     = ""
}

variable "github_repo" {
  description = "GitHub repo for issue creation (only needed when issue_backend = github in admin)"
  type        = string
  default     = ""
}

variable "tailscale_auth_key" {
  description = "Tailscale pre-auth key for the ClickStack EC2 — reusable, non-ephemeral, pre-authorized. Generate at tailscale.com/admin/settings/keys."
  type        = string
  sensitive   = true
}

