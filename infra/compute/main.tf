data "aws_caller_identity" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id
  ecr_url    = "${local.account_id}.dkr.ecr.${var.region}.amazonaws.com"
  image      = "${local.ecr_url}/trst-agent:${var.agent_image_tag}"
}

# ── ECR ───────────────────────────────────────────────────────────────────────

resource "aws_ecr_repository" "agent" {
  name                 = "trst-agent"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "agent" {
  repository = aws_ecr_repository.agent.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

# ── Security groups ───────────────────────────────────────────────────────────

resource "aws_security_group" "alb" {
  name        = "trst-alb-${var.environment}"
  description = "ALB: public HTTP inbound"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS: uncomment after adding ACM cert + HTTPS listener
  # ingress {
  #   from_port   = 443
  #   to_port     = 443
  #   protocol    = "tcp"
  #   cidr_blocks = ["0.0.0.0/0"]
  # }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs" {
  name        = "trst-ecs-${var.environment}"
  description = "ECS tasks: inbound from ALB, outbound to internet"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ── ALB ───────────────────────────────────────────────────────────────────────

resource "aws_lb" "agent" {
  name               = "trst-agent-${var.environment}"
  load_balancer_type = "application"
  subnets            = var.public_subnet_ids
  security_groups    = [aws_security_group.alb.id]
}

resource "aws_lb_target_group" "agent" {
  name        = "trst-agent-${var.environment}"
  port        = 3001
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  health_check {
    path                = "/health"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.agent.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.agent.arn
  }
}

# ── IAM ───────────────────────────────────────────────────────────────────────

data "aws_iam_policy_document" "ecs_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "execution" {
  name               = "trst-ecs-execution-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy_attachment" "execution_base" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "execution_secrets" {
  name = "read-secrets"
  role = aws_iam_role.execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["secretsmanager:GetSecretValue"]
      Resource = concat(
        [
          var.database_url_secret_arn,
          var.agent_api_key_arn,
          var.revalidate_secret_arn,
        ],
        var.otel_exporter_otlp_endpoint != "" ? [var.otel_headers_arn] : []
      )
    }]
  })
}

resource "aws_iam_role" "task" {
  name               = "trst-ecs-task-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

# ── CloudWatch log group ───────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "agent" {
  name              = "/ecs/trst-agent-${var.environment}"
  retention_in_days = 30
}

# ── ECS ───────────────────────────────────────────────────────────────────────

resource "aws_ecs_cluster" "main" {
  name = "trst-${var.environment}"
}

resource "aws_ecs_task_definition" "agent" {
  family                   = "trst-agent-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([{
    name      = "agent"
    image     = local.image
    essential = true

    portMappings = [{ containerPort = 3001, protocol = "tcp" }]

    environment = concat(
      [
        { name = "REVALIDATE_URL", value = var.revalidate_url },
        { name = "PORT",           value = "3001" },
        { name = "GITHUB_OWNER",   value = var.github_owner },
        { name = "GITHUB_REPO",    value = var.github_repo },
      ],
      var.otel_exporter_otlp_endpoint != "" ? [
        { name = "OTEL_EXPORTER_OTLP_ENDPOINT", value = var.otel_exporter_otlp_endpoint },
        { name = "OTEL_SERVICE_NAME",            value = "trst-agent" },
      ] : []
    )

    secrets = concat(
      [
        { name = "DATABASE_URL",      valueFrom = var.database_url_secret_arn },
        { name = "AGENT_API_KEY",     valueFrom = var.agent_api_key_arn },
        { name = "REVALIDATE_SECRET", valueFrom = var.revalidate_secret_arn },
      ],
      var.otel_exporter_otlp_endpoint != "" ? [
        { name = "OTEL_EXPORTER_OTLP_HEADERS", valueFrom = var.otel_headers_arn },
      ] : []
    )

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.agent.name
        awslogs-region        = var.region
        awslogs-stream-prefix = "agent"
      }
    }
  }])
}

resource "aws_ecs_service" "agent" {
  name            = "trst-agent-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.agent.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [aws_security_group.ecs.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.agent.arn
    container_name   = "agent"
    container_port   = 3001
  }

  depends_on = [aws_lb_listener.http]

  lifecycle {
    # Prevent tofu from resetting the image tag on every plan after CI updates it
    ignore_changes = [task_definition]
  }
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "agent_url" {
  value = "http://${aws_lb.agent.dns_name}"
}

output "ecr_repository_url" {
  value = aws_ecr_repository.agent.repository_url
}
