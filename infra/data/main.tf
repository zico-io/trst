resource "aws_db_subnet_group" "main" {
  name       = "trst-${var.environment}"
  subnet_ids = concat(var.public_subnet_ids, var.private_subnet_ids)
}

resource "aws_db_parameter_group" "main" {
  name   = "trst-${var.environment}"
  family = "postgres16"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }
}

resource "aws_security_group" "rds" {
  name        = "trst-rds-${var.environment}"
  description = "RDS: allow Postgres from VPC and public internet (SSL enforced)"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "main" {
  identifier        = "trst-${var.environment}"
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = "db.t3.micro"
  storage_type      = "gp3"
  allocated_storage = 20
  max_allocated_storage = 100
  storage_encrypted = true

  db_name  = "trst"
  username = "trst"
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.main.name
  publicly_accessible    = true

  backup_retention_period = var.environment == "production" ? 7 : 1
  skip_final_snapshot     = var.environment != "production"
  deletion_protection     = var.environment == "production"
  copy_tags_to_snapshot   = true

  auto_minor_version_upgrade = true

  performance_insights_enabled          = true
  performance_insights_retention_period = 7

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = { Name = "trst-${var.environment}" }
}

# Store connection string in Secrets Manager so ECS can reference it by ARN
resource "aws_secretsmanager_secret" "database_url" {
  name                    = "/trst/${var.environment}/database_url"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = "postgresql://${aws_db_instance.main.username}:${var.db_password}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}?sslmode=require"
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "database_url" {
  value     = aws_secretsmanager_secret_version.database_url.secret_string
  sensitive = true
}

output "database_url_secret_arn" {
  value = aws_secretsmanager_secret.database_url.arn
}
