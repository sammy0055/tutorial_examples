data "aws_caller_identity" "current" {}

data "aws_ecr_authorization_token" "token" {}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole" ]
  }
}

data "aws_iam_policy_document" "cloudwatch_policy" {
 statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents" 
      ]
    resources = ["arn:aws:logs:*:*:*"]  // Allows access to all CloudWatch Logs resources
  }
}