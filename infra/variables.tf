variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
  validation {
    condition     = contains(["production", "staging"], var.environment)
    error_message = "environment must be production or staging"
  }
}

variable "region" {
  description = "Cloud region for all resources"
  type        = string
  # Set in tfvars or environment
}
