variable "aws_region" {
  type        = string
  default     = "eu-west-1"
  description = "aws region for current resource"
}

variable "name_alias" {
  type = string
  default = "example_app"
  description = "name alias"  // ad your descrioption al needed
}