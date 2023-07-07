# create ci/cd user with access keys (for build system)
resource "aws_iam_user" "cicd" {
  name = "devOps_${var.app}_${var.environment}_cicd"
}

resource "aws_iam_access_key" "cicd_keys" {
  user = aws_iam_user.cicd.name
}

resource "aws_iam_role" "app_role" {
  name               = "${var.app}-${var.environment}"
  assume_role_policy = "${data.aws_iam_policy_document.assume_role_policy.json}"
}


# grant required permissions to deploy
data "aws_iam_policy_document" "cicd_policy" {
  # allows user to push/pull to the registry
  statement {
    sid = "ecr"

    actions = [
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:BatchCheckLayerAvailability",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
    ]

    resources = [
      "${aws_ecr_repository.my_repo.arn}",
    ]
  }

  # allows user to deploy to ecs
  statement {
    sid = "ecs"

    actions = [
      "ecr:GetAuthorizationToken",
      "ecs:DescribeServices",
      "ecs:DescribeTaskDefinition",
      "ecs:UpdateService",
      "ecs:RegisterTaskDefinition",
    ]

    resources = [
      "*",
    ]
  }

  # allows user to run ecs task using task execution and app roles
  statement {
    sid = "approle"

    actions = [
      "iam:PassRole",
    ]

    resources = [
      aws_iam_role.app_role.arn,
      aws_iam_role.ecsTaskExecutionRole.arn,
    ]
  }
}

resource "aws_iam_user_policy" "cicd_user_policy" {
  name   = "devOps_${var.app}_${var.environment}_cicd"
  user   = aws_iam_user.cicd.name
  policy = data.aws_iam_policy_document.cicd_policy.json
}

# The AWS keys for the CICD user to use in a build system
output "cicd_keys" {
  value = "terraform show -json | jq '.values.root_module.resources | .[] | select ( .address == \"aws_iam_access_key.cicd_keys\") | { AWS_ACCESS_KEY_ID: .values.id, AWS_SECRET_ACCESS_KEY: .values.secret }'"
}