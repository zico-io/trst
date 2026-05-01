terraform {
  required_version = ">= 1.8.0"

  backend "s3" {
    bucket         = "trst-tfstate"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "trst-tfstate-lock"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    vercel = {
      source  = "registry.terraform.io/vercel/vercel"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.region
}

provider "vercel" {
  # Reads VERCEL_API_TOKEN from environment — do not put the token in tfvars
  team = var.vercel_team_id != "" ? var.vercel_team_id : null
}

# ── Modules ───────────────────────────────────────────────────────────────────

module "networking" {
  source      = "./networking"
  environment = var.environment
}

module "secrets" {
  source      = "./secrets"
  environment = var.environment
}

module "data" {
  source             = "./data"
  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids
  vpc_cidr_block     = module.networking.vpc_cidr_block
  db_password        = module.secrets.db_password
}

module "observability" {
  source             = "./observability"
  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  public_subnet_id   = module.networking.public_subnet_ids[0]
  vpc_cidr_block     = module.networking.vpc_cidr_block
  hyperdx_api_key    = module.secrets.hyperdx_api_key
  tailscale_auth_key = var.tailscale_auth_key
}

module "compute" {
  source                      = "./compute"
  environment                 = var.environment
  region                      = var.region
  vpc_id                      = module.networking.vpc_id
  public_subnet_ids           = module.networking.public_subnet_ids
  private_subnet_ids          = module.networking.private_subnet_ids
  database_url_secret_arn     = module.data.database_url_secret_arn
  agent_api_key_arn           = module.secrets.agent_api_key_arn
  revalidate_secret_arn       = module.secrets.revalidate_secret_arn
  field_encryption_key_arn    = module.secrets.field_encryption_key_arn
  revalidate_url              = var.revalidate_url
  github_owner                = var.github_owner
  github_repo                 = var.github_repo
  otel_exporter_otlp_endpoint = module.observability.otlp_endpoint
  otel_headers_arn            = module.secrets.otel_headers_arn
}

module "vercel" {
  source                      = "./vercel"
  auth_secret                 = module.secrets.auth_secret
  database_url                = module.data.database_url
  agent_url                   = module.compute.agent_url
  agent_api_key               = module.secrets.agent_api_key
  admin_github_logins         = var.admin_github_logins
  revalidate_secret           = module.secrets.revalidate_secret
  field_encryption_key        = module.secrets.field_encryption_key
  install_state_secret        = module.secrets.install_state_secret
  otel_exporter_otlp_endpoint = module.observability.otlp_endpoint
  otel_exporter_otlp_headers  = module.secrets.otel_headers
}
