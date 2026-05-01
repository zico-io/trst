data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

# ── IAM (SSM access — no SSH needed) ─────────────────────────────────────────

resource "aws_iam_role" "clickstack" {
  name = "trst-clickstack-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.clickstack.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "clickstack" {
  name = "trst-clickstack-${var.environment}"
  role = aws_iam_role.clickstack.name
}

# ── Security group ────────────────────────────────────────────────────────────

resource "aws_security_group" "clickstack" {
  name        = "trst-clickstack-${var.environment}"
  description = "HyperDX ClickStack: OTLP HTTP public, OTLP gRPC VPC-only, UI public"
  vpc_id      = var.vpc_id

  # OTLP HTTP — open to internet so Vercel can ship traces
  ingress {
    from_port   = 4318
    to_port     = 4318
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # OTLP gRPC — VPC-only (ECS, future services)
  ingress {
    from_port   = 4317
    to_port     = 4317
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
  }

  # Tailscale direct WireGuard — enables peer-to-peer connections (optional but faster)
  ingress {
    from_port   = 41641
    to_port     = 41641
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # HyperDX UI (port 8080) is NOT opened here — Tailscale handles it at the OS level

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ── Elastic IP ────────────────────────────────────────────────────────────────

resource "aws_eip" "clickstack" {
  domain = "vpc"
  tags   = { Name = "trst-clickstack-${var.environment}" }
}

resource "aws_eip_association" "clickstack" {
  instance_id   = aws_instance.clickstack.id
  allocation_id = aws_eip.clickstack.id
}

# ── EC2 instance ──────────────────────────────────────────────────────────────

resource "aws_instance" "clickstack" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t3.medium"
  subnet_id              = var.public_subnet_id
  vpc_security_group_ids = [aws_security_group.clickstack.id]
  iam_instance_profile   = aws_iam_instance_profile.clickstack.name

  # 100 GB root: ClickHouse + MongoDB Docker volumes live here.
  # Observability history is not business-critical; replace instance to resize.
  root_block_device {
    volume_size           = 100
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    hyperdx_api_key    = var.hyperdx_api_key
    tailscale_auth_key = var.tailscale_auth_key
    environment        = var.environment
  }))

  tags = { Name = "trst-clickstack-${var.environment}" }
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "otlp_endpoint" {
  description = "OTLP HTTP endpoint for apps — set as OTEL_EXPORTER_OTLP_ENDPOINT"
  value       = "http://${aws_eip.clickstack.public_ip}:4318"
}

output "ui_url" {
  description = "HyperDX dashboard URL — connect to tailnet first, then open this"
  value       = "http://trst-clickstack-${var.environment}:8080"
}
