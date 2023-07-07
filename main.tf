terraform {
  cloud {
    organization = "Stash Payments"
    workspaces {
      name = "Email-Service"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
    acme = {
      source = "vancluever/acme"
      version = "2.10.0"
    }
  }
}

data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

provider "aws" {
  region = var.region
}

resource "aws_ecr_repository" "my_repo" {
  name                 = "${var.app}-${var.environment}"
  image_tag_mutability = "IMMUTABLE"

  tags = {
    repository = "https://github.com/stashngr/email-microservice"
  }
}

resource "aws_ecr_repository_policy" "repo_policy" {
  repository = aws_ecr_repository.my_repo.name
  policy = jsonencode(
  {
    "Version": "2008-10-17",
    "Statement": [
      {
            "Sid": "Core api",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:BatchCheckLayerAvailability",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecr:DescribeRepositories",
                "ecr:GetRepositoryPolicy",
                "ecr:ListImages",
                "ecr:DeleteRepository",
                "ecr:BatchDeleteImage",
                "ecr:SetRepositoryPolicy",
                "ecr:DeleteRepositoryPolicy"
            ]
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "logs" {
  name              = "/${lower(var.launchType)}/service/${var.app}-${var.environment}"
  retention_in_days = var.logs_retention_in_days
}

resource "aws_ecs_cluster" "my_cluster" {
  name = "${var.app}-${var.environment}-cluster"
}

resource "aws_ecs_task_definition" "my_service_task_defination" {
  family                   = "${var.app}-${var.environment}-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["${var.launchType}"]
  memory                   = "2048"
  cpu                      = "1024"
  execution_role_arn       = "${aws_iam_role.ecsTaskExecutionRole.arn}"
  container_definitions    = jsonencode(
  [
    {
      "name": "${var.app}-${var.environment}-service"
      "image": "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.region}.amazonaws.com/${aws_ecr_repository.my_repo.name}",
      "memory": 512,
      "cpu": 256,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3030,
          "hostPort": 3030
        }
      ],
      "logConfiguration": {
          "logDriver": "awslogs",
          "options": {
            "awslogs-group": "/${lower(var.launchType)}/service/${var.app}-${var.environment}",
            "awslogs-region": "${var.region}",
            "awslogs-stream-prefix": "ecs"
          }
      },
      "environment": [
          {
              "name": "NODE_ENV",
              "value": "${var.NODE_ENV}"
          },
          {
              "name": "PORT",
              "value": "${var.PORT}"
          },
          {
              "name": "SENDGRID_API_KEY",
              "value": "${var.SENDGRID_API_KEY}"
          },
          {
              "name": "SESRegion",
              "value": "${var.SESRegion}"
          },
          {
              "name": "AWS_ACCESS_KEY_ID",
              "value": "${var.SES_AWS_ACCESS_KEY_ID}"
          },
          {
              "name": "AWS_SECRET_ACCESS_KEY",
              "value": "${var.SES_AWS_SECRET_ACCESS_KEY}"
          }
      ],
    }
  ])
}

resource "aws_iam_role" "ecsTaskExecutionRole" {
  name               = "${var.app}-${var.environment}-ecs"
  assume_role_policy = "${data.aws_iam_policy_document.assume_role_policy.json}"
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy" {
  role       = "${aws_iam_role.ecsTaskExecutionRole.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_default_vpc" "default_vpc" {
}

resource "aws_default_subnet" "default_subnet_a" {
  availability_zone = "${var.region}a"
}

resource "aws_default_subnet" "default_subnet_b" {
  availability_zone = "${var.region}b"
}

resource "aws_default_subnet" "default_subnet_c" {
  availability_zone = "${var.region}c"
}

resource "aws_appautoscaling_target" "app_scale_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.my_cluster.name}/${aws_ecs_service.my_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  max_capacity       = var.ecs_autoscale_max_instances
  min_capacity       = var.ecs_autoscale_min_instances
}

resource "aws_ecs_service" "my_service" {
  name            = "${var.app}-${var.environment}-service"
  cluster         = aws_ecs_cluster.my_cluster.id
  task_definition = aws_ecs_task_definition.my_service_task_defination.arn
  launch_type     = "${var.launchType}"
  network_configuration {
    subnets          = ["${aws_default_subnet.default_subnet_a.id}", "${aws_default_subnet.default_subnet_b.id}", "${aws_default_subnet.default_subnet_c.id}"]
    assign_public_ip = var.launchType == "EC2" ? false : true # Providing our containers with public IPs
    security_groups  = ["${aws_security_group.my_service_security_group.id}"]
  }
  desired_count = var.replicas

  load_balancer {
    target_group_arn = "${aws_lb_target_group.my_target_group.arn}"
    container_name   = "${aws_ecs_task_definition.my_service_task_defination.family}"
    container_port   = 3030 # Specifying the container port
  }

  # [after initial apply] don't override changes made to task_definition
  # from outside of terraform (i.e.; fargate cli)
  lifecycle {
    ignore_changes = [task_definition]
  }
}

resource "aws_security_group" "my_lb_security_group" {
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic in from all sources
  }

  egress {
    from_port   = 0 
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


data "aws_elb_service_account" "main" {}

resource "aws_s3_bucket" "elb_logs" {
  bucket = "${var.app}-${var.environment}-lb-logs"
}

resource "aws_s3_bucket_acl" "elb_logs_acl" {
  bucket = aws_s3_bucket.elb_logs.id
  acl    = "private"
}

resource "aws_s3_bucket_policy" "allow_elb_logging" {
  bucket = aws_s3_bucket.elb_logs.id
  policy = <<POLICY
{
  "Id": "Policy",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Resource": "${aws_s3_bucket.elb_logs.arn}/AWSLogs/*",
      "Principal": {
        "AWS": [
          "${data.aws_elb_service_account.main.arn}"
        ]
      }
    }
  ]
}
POLICY
}

resource "aws_alb" "my_load_balancer" {
  name               = "${var.app}-${var.environment}-lb"
  load_balancer_type = "application"
  subnets = [
    "${aws_default_subnet.default_subnet_a.id}",
    "${aws_default_subnet.default_subnet_b.id}",
    "${aws_default_subnet.default_subnet_c.id}"
  ]
  security_groups = ["${aws_security_group.my_lb_security_group.id}",]
  # security_groups = ["${aws_security_group.my_lb_security_group.id}", "${aws_security_group.allow_tls.id}"]

  access_logs {
    bucket   = aws_s3_bucket.elb_logs.bucket
    enabled = true
  }
}

resource "aws_lb_target_group" "my_target_group" {
  name        = "${var.app}-${var.environment}-tg"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = "${aws_default_vpc.default_vpc.id}"
  health_check {
    matcher = "200,301,302"
    path = "/health"
  }
}

# resource "aws_lb_listener" "https_listener" {
#   load_balancer_arn = "${aws_alb.my_load_balancer.arn}" 
#   port              = "443"
#   protocol          = "HTTPS"
#   certificate_arn = aws_acm_certificate.certificate.arn
#   default_action {
#     type             = "forward"
#     target_group_arn = "${aws_lb_target_group.my_target_group.arn}"
#   }
# }

resource "aws_lb_listener" "listener" {
  load_balancer_arn = "${aws_alb.my_load_balancer.arn}" 
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = "${aws_lb_target_group.my_target_group.arn}"
  }
}

resource "aws_security_group" "my_service_security_group" {
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    # Only allowing traffic in from the load balancer security group
    # security_groups = ["${aws_security_group.my_lb_security_group.id}", "${aws_security_group.allow_tls.id}"]
    security_groups = ["${aws_security_group.my_lb_security_group.id}",]
  }

  egress {
    from_port   = 0 # Allowing any incoming port
    to_port     = 0 # Allowing any outgoing port
    protocol    = "-1" # Allowing any outgoing protocol 
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
  }
}