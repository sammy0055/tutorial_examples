resource "aws_iam_role" "iam_for_lambda" {
  name               = "iam_for_lambda_${var.name_alias}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

# Attach CloudWatch policy to IAM role
resource "aws_iam_role_policy" "cloudwatch_policy" {
  name   = "cloudwatch_lambda_policy"
  role   = aws_iam_role.iam_for_lambda.id
  policy = data.aws_iam_policy_document.cloudwatch_policy.json
}

resource "aws_lambda_function" "test_lambda" {
  function_name = "fuction_${var.name_alias}"
  role          = aws_iam_role.iam_for_lambda.arn
  package_type  = "Image"
  image_uri     = docker_registry_image.helloworld.name
  architectures = ["x86_64"]
  depends_on = [aws_ecr_repository.shedular]
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.test_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "${aws_api_gateway_rest_api.api_gateway.execution_arn}/*/*"
}