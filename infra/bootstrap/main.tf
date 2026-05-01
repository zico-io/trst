terraform {
  required_version = ">= 1.8.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.region
  profile = var.aws_profile
}

# ── S3 state bucket ───────────────────────────────────────────────────────────

resource "aws_s3_bucket" "tfstate" {
  bucket = var.state_bucket
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket                  = aws_s3_bucket.tfstate.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ── DynamoDB state lock ───────────────────────────────────────────────────────

resource "aws_dynamodb_table" "tfstate_lock" {
  name         = var.lock_table
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

# ── GitHub Actions OIDC ───────────────────────────────────────────────────────

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  # GitHub's OIDC CA thumbprints (stable; AWS auto-validates via CA library)
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}

data "aws_iam_policy_document" "github_assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Scope to this repo only; both plan (PR) and apply (main) use the same role.
    # The GitHub Environment approval gate (not IAM) controls who can apply.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:*"]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name               = "trst-github-actions"
  assume_role_policy = data.aws_iam_policy_document.github_assume.json
}

resource "aws_iam_role_policy" "github_actions_infra" {
  name = "trst-infra"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "StateBackend"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
        ]
        Resource = [
          aws_s3_bucket.tfstate.arn,
          "${aws_s3_bucket.tfstate.arn}/*",
        ]
      },
      {
        Sid    = "StateLock"
        Effect = "Allow"
        Action = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"]
        Resource = aws_dynamodb_table.tfstate_lock.arn
      },
      {
        # iam:* is needed because tofu creates ECS execution/task roles.
        # Scope this further with a permissions boundary if stricter controls are required.
        Sid    = "Infra"
        Effect = "Allow"
        Action = [
          "ec2:*",
          "rds:*",
          "secretsmanager:*",
          "ecr:*",
          "ecs:*",
          "iam:*",
          "elasticloadbalancing:*",
          "logs:*",
          "cloudwatch:*",
        ]
        Resource = "*"
      },
    ]
  })
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "github_actions_role_arn" {
  description = "Set as AWS_ROLE_ARN GitHub Actions variable (not secret)"
  value       = aws_iam_role.github_actions.arn
}

output "state_bucket" {
  value = aws_s3_bucket.tfstate.id
}

output "lock_table" {
  value = aws_dynamodb_table.tfstate_lock.name
}
