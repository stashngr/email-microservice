# The application's name
variable "app" {
  default = "emaild"
}

# The environment that is being built
variable "environment" {
  default = "prod"
}

variable "region" {
  default = "eu-central-1"
}

variable "organization" {
  default = "Stash Payments"
}

variable "logs_retention_in_days" {
  type        = number
  default     = 90
  description = "Specifies the number of days you want to retain log events"
}

variable "ecs_autoscale_min_instances" {
  default = "1"
}

# The maximum number of containers that should be running.
# used by both autoscale-perf.tf and autoscale.time.tf
variable "ecs_autoscale_max_instances" {
  default = "3"
}

# How many containers to run
variable "replicas" {
  default = "1"
}

# Application Env Variables
variable "NODE_ENV" {
  default = "production"
}

variable "PORT" {
  default = "3030"
}

variable "SENDGRID_API_KEY" {

}

variable "SESRegion" {
  default = "eu-central-1"
}

variable "SES_AWS_ACCESS_KEY_ID" {
  
}

variable "SES_AWS_SECRET_ACCESS_KEY" {
  
}

variable "launchType" {
  default = "FARGATE"
}