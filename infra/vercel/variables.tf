variable "project_name" {
  type    = string
  default = "trst"
}

variable "github_repo" {
  type    = string
  default = "zico-io/trst"
}

variable "auth_secret" {
  type      = string
  sensitive = true
}

variable "database_url" {
  type      = string
  sensitive = true
}

variable "agent_url" {
  type = string
}

variable "agent_api_key" {
  type      = string
  sensitive = true
}

variable "admin_github_logins" {
  type = string
}

variable "revalidate_secret" {
  type      = string
  sensitive = true
}

variable "field_encryption_key" {
  type      = string
  sensitive = true
}

variable "install_state_secret" {
  type      = string
  sensitive = true
}

variable "otel_exporter_otlp_endpoint" {
  type    = string
  default = ""
}

variable "otel_exporter_otlp_headers" {
  type      = string
  sensitive = true
  default   = ""
}
