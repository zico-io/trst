variable "region" {
  type    = string
  default = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to use; if null, falls back to AWS_PROFILE env var"
  type        = string
  default     = null
}

variable "github_repo" {
  description = "owner/repo used in the OIDC trust policy"
  type        = string
  default     = "zico-io/trst"
}

variable "state_bucket" {
  description = "S3 bucket name for tofu state (must be globally unique)"
  type        = string
  default     = "trst-tfstate"
}

variable "lock_table" {
  description = "DynamoDB table for tofu state locking"
  type        = string
  default     = "trst-tfstate-lock"
}
