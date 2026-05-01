resource "random_password" "auth_secret" {
  length  = 32
  special = false
}

resource "random_password" "agent_api_key" {
  length  = 32
  special = false
}

resource "random_password" "db_password" {
  length  = 32
  special = false
}

# ── AWS Secrets Manager ───────────────────────────────────────────────────────

resource "aws_secretsmanager_secret" "auth_secret" {
  name                    = "/trst/${var.environment}/auth_secret"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "auth_secret" {
  secret_id     = aws_secretsmanager_secret.auth_secret.id
  secret_string = random_password.auth_secret.result
}

resource "aws_secretsmanager_secret" "agent_api_key" {
  name                    = "/trst/${var.environment}/agent_api_key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "agent_api_key" {
  secret_id     = aws_secretsmanager_secret.agent_api_key.id
  secret_string = random_password.agent_api_key.result
}

resource "random_password" "revalidate_secret" {
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "revalidate_secret" {
  name                    = "/trst/${var.environment}/revalidate_secret"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "revalidate_secret" {
  secret_id     = aws_secretsmanager_secret.revalidate_secret.id
  secret_string = random_password.revalidate_secret.result
}

resource "random_password" "hyperdx_api_key" {
  length  = 32
  special = false
}

resource "random_bytes" "field_encryption_key" {
  length = 32
}

resource "random_password" "install_state_secret" {
  length  = 32
  special = false
}


resource "aws_secretsmanager_secret" "otel_headers" {
  name                    = "/trst/${var.environment}/otel_exporter_otlp_headers"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "otel_headers" {
  secret_id     = aws_secretsmanager_secret.otel_headers.id
  secret_string = "authorization=${random_password.hyperdx_api_key.result}"
}

resource "aws_secretsmanager_secret" "field_encryption_key" {
  name                    = "/trst/${var.environment}/field_encryption_key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "field_encryption_key" {
  secret_id     = aws_secretsmanager_secret.field_encryption_key.id
  secret_string = random_bytes.field_encryption_key.hex
}

resource "aws_secretsmanager_secret" "install_state_secret" {
  name                    = "/trst/${var.environment}/install_state_secret"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "install_state_secret" {
  secret_id     = aws_secretsmanager_secret.install_state_secret.id
  secret_string = random_password.install_state_secret.result
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "db_password" {
  value     = random_password.db_password.result
  sensitive = true
}

output "auth_secret" {
  value     = random_password.auth_secret.result
  sensitive = true
}

output "auth_secret_arn" {
  value = aws_secretsmanager_secret.auth_secret.arn
}

output "agent_api_key" {
  value     = random_password.agent_api_key.result
  sensitive = true
}

output "agent_api_key_arn" {
  value = aws_secretsmanager_secret.agent_api_key.arn
}

output "revalidate_secret" {
  value     = random_password.revalidate_secret.result
  sensitive = true
}

output "revalidate_secret_arn" {
  value = aws_secretsmanager_secret.revalidate_secret.arn
}

output "otel_headers_arn" {
  value = aws_secretsmanager_secret.otel_headers.arn
}

output "hyperdx_api_key" {
  value     = random_password.hyperdx_api_key.result
  sensitive = true
}


output "otel_headers" {
  value     = "authorization=${random_password.hyperdx_api_key.result}"
  sensitive = true
}

output "field_encryption_key" {
  value     = random_bytes.field_encryption_key.hex
  sensitive = true
}

output "field_encryption_key_arn" {
  value = aws_secretsmanager_secret.field_encryption_key.arn
}

output "install_state_secret" {
  value     = random_password.install_state_secret.result
  sensitive = true
}

output "install_state_secret_arn" {
  value = aws_secretsmanager_secret.install_state_secret.arn
}
