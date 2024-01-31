resource "aws_api_gateway_rest_api" "api_gateway" {
  name = "api-gateway_${var.name_alias}"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "catch_all_resource" {
  parent_id   = aws_api_gateway_rest_api.api_gateway.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.api_gateway.id
  path_part   = "{proxy+}"  # This will capture any sub-route
}

resource "aws_api_gateway_method" "catch_all_method" {
  rest_api_id   = aws_api_gateway_rest_api.api_gateway.id
  resource_id   = aws_api_gateway_resource.catch_all_resource.id
  http_method   = "ANY"  # Set the method to ANY to catch all HTTP methods
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "integration" {
  rest_api_id             = aws_api_gateway_rest_api.api_gateway.id
  resource_id             = aws_api_gateway_resource.catch_all_resource.id
  http_method             = aws_api_gateway_method.catch_all_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.test_lambda.invoke_arn
}


resource "aws_api_gateway_deployment" "example_deployment" {
  depends_on = [aws_api_gateway_integration.integration]

  rest_api_id = aws_api_gateway_rest_api.api_gateway.id
  stage_name  = "prod"  # Replace with your desired stage name
}