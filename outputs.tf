# Output value definitions

output "entrypoint" {
  description = "Load balancer URL"
  value = aws_alb.my_load_balancer.dns_name
}

output "AWS_ACCOUNT_ID" {
  value = data.aws_caller_identity.current.account_id
}

output "AWS_ECR_ACCOUNT_URL" {
  description = "Docker Image"
  value = aws_ecr_repository.my_repo.repository_url
}

output "AWS_ECR_REGISTRY_ID" {
  value = data.aws_caller_identity.current.account_id
}

output "AWS_REGION" {
  value = var.region
}

output "MY_APP_PREFIX" {
  value = "${var.app}-${var.environment}"
}

output "AWS_ACCESS_KEY_ID" {
  value = "Generate it from AWS"
}

output "AWS_SECRET_ACCESS_KEY" {
  value = "get it from your AWS"
}