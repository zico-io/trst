variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_id" {
  type        = string
  description = "Single public subnet to place the instance in"
}

variable "vpc_cidr_block" {
  type = string
}

variable "hyperdx_api_key" {
  type      = string
  sensitive = true
}

variable "tailscale_auth_key" {
  description = "Tailscale pre-auth key — reusable, non-ephemeral, pre-authorized"
  type        = string
  sensitive   = true
}
