variable "environment" {
  type = string
}

variable "region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "database_url_secret_arn" {
  type        = string
  description = "Secrets Manager ARN for DATABASE_URL"
}

variable "agent_api_key_arn" {
  type        = string
  description = "Secrets Manager ARN for AGENT_API_KEY"
}

variable "revalidate_secret_arn" {
  type        = string
  description = "Secrets Manager ARN for REVALIDATE_SECRET"
}

variable "revalidate_url" {
  type        = string
  description = "Full URL of apps/web /api/revalidate endpoint"
}

variable "github_owner" {
  type        = string
  description = "GitHub owner for issue creation (only used when issue_backend = github)"
  default     = ""
}

variable "github_repo" {
  type        = string
  description = "GitHub repo for issue creation (only used when issue_backend = github)"
  default     = ""
}

# Image tag injected by CI after docker push; default lets tofu apply before first push
variable "agent_image_tag" {
  type    = string
  default = "latest"
}

variable "otel_exporter_otlp_endpoint" {
  type        = string
  description = "OTLP HTTP endpoint (e.g. https://in-otel.hyperdx.io)"
  default     = ""
}

variable "otel_headers_arn" {
  type        = string
  description = "Secrets Manager ARN for OTEL_EXPORTER_OTLP_HEADERS"
  default     = ""
}

variable "field_encryption_key_arn" {
  type        = string
  description = "Secrets Manager ARN for FIELD_ENCRYPTION_KEY"
}
