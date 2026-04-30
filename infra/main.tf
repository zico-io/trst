terraform {
  required_version = ">= 1.8.0"

  # Backend config will be added when cloud target is decided.
  # Uncomment and configure one of:
  # backend "gcs" { bucket = "trst-tfstate" }
  # backend "s3"  { bucket = "trst-tfstate" }

  required_providers {
    # Add cloud provider here, e.g.:
    # google = { source = "hashicorp/google", version = "~> 6.0" }
    # vercel = { source = "vercel/vercel", version = "~> 2.0" }
  }
}

module "networking" {
  source = "./networking"
}

module "data" {
  source     = "./data"
  depends_on = [module.networking]
}

module "secrets" {
  source = "./secrets"
}

module "compute" {
  source     = "./compute"
  depends_on = [module.data, module.secrets]
}
