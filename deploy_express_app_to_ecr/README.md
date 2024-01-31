# Step-by-Step Guide: Deploying Your Express App as a Container image on AWS with Lambda Integration and API Gateway Setup all with terraform.

### Welcome to a comprehensive tutorial where we'll navigate through a seamless step-by-step process to containerize your application, deploy it to AWS Elastic Container Registry (ECR), craft a Lambda function derived from the container image, and effortlessly establish a connection with API Gateway – all orchestrated using Terraform.

### In this guide, we'll demystify the intricacies of each stage, ensuring you grasp the nuances of containerization, AWS ECR deployment, Lambda function creation, and API Gateway integration, all while embracing the efficiency and simplicity that Terraform brings to the table.

### Prepare to embark on a journey that empowers you to streamline your application deployment process with precision and confidence. Let's dive in, one step at a time.

## Prerequisites:

### Ensure you have a solid understanding of the following tools and have them installed:

<ul>
<li><a href="https://google.com">Docker</a>:  Containerization made easy </li>
<li><a href="https://google.com">Terraform</a>: Infrastructure as code, simplified.</li>
</ul>

## Agenda:

<ul>
<li>Setup AWS Access Key and Secret Key</li>
<li>Develop an express application</li>
<li>Containarize and deploy to AWS with Terraform</li>
</ul>

## Setup AWS Access Key and Secret Key

### go to aws console, navigate to the IAM and create a programmatic user with access policy of fullAdminAccess. copy your access key and secret key to a safe place.

#### NOTE: <span style="color: yellow">fullAdminAccess policy is not recommended for a production application, we are only using it for the purpose of this tutorial.

## Develop an express application.

### create a root directory

### `cd` into root directory and create two folders. you can name the folders what ever you want.

### folders
<ul>
<li>example. <i>application code lives here.</i></li>
<li>infrastructure. <i>terraform code lives here.</i></li>
</ul>

### `cd` into example folder and enter the following commands

`npm init -y` `npm i cors` `npm i express` `npm i serverless-http`

### create index.js file in the example directory. copy and past the code below.

```
<!-- index.js -->
import express from "express";
import cors from "cors";
import serverless from "serverless-http";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({ data: "welcome to lambda" });
});

app.post("/api", (req, res) => {
  return res
    .status(200)
    .json({ data: "welcome to lambda post", registerData: req.body });
});

app.get("/apples", (req, res) => {
  return res.status(200).json({ data: "welcome to apples route" });
});

app.post("/api/v1/register", (req, res) => {
  return res
    .status(200)
    .json({ data: "register route", registerData: req.body });
});

export const handler = serverless(app);
```

## Create Dockerfile and .dockerignore file in the example directory.

#### Dockerfile

```
FROM public.ecr.aws/lambda/nodejs:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . . ${LAMBDA_TASK_ROOT}

CMD [ "index.handler" ]
```

#### NOTE: <span style="color: yellow">`{LAMBDA_TASK_ROOT}` environment variable represents the root directory of the Lambda function

### .dockerignore

### In here you can add files and folders you don't want docker to copy

```
node_modules
```

## Containarize and deploy to AWS with Terraform

## `cd` into "infrastructure" directory

### create a `data.tf` file

```
data "aws_caller_identity" "current" {}

# token is needed for our local docker demeon to connect to aws ecr
data "aws_ecr_authorization_token" "token" {}

# lambda policy_document
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

# lambda cloudwatch_policy_document
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
```
### create a `variables.tf` file
```
variable "aws_region" {
  type        = string
  default     = "eu-west-1"
  description = "aws region for current resource"
}

variable "name_alias" {
  type = string
  default = "example_app"
  description = "name alias"  // ad your descrioption as needed
}
```
### create a `local.tf` file
```
locals {
  aws_ecr_url = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}
```
### create a `provider.tf` file

```
terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }

    docker = {
      source  = "kreuzwerker/docker"
    }
  }
}

provider "aws" {
  region     = "eu-west-1" // you can choose your region of prefrence
  access_key = "YOUR AWS ACCESS KEY GOES HERE"
  secret_key = "YOUR AWS SECRET KEY GOES HERE"
}

provider "docker" {
    registry_auth {
        address  = local.aws_ecr_url
        username = data.aws_ecr_authorization_token.token.user_name
        password = data.aws_ecr_authorization_token.token.password
  }
}
```
## Containarize and deploy to AWS with Terraform
### we are now going to containarize our application, create an ecr repo, deploy the application image, create lambda function from the image and integrate api-gateway to lambda.

### create a `main.tf`
```
# create ecr repository
resource "aws_ecr_repository" "shedular" {
  name                 = "repo_${var.name_alias}"
  image_tag_mutability = "MUTABLE"
}

# build and push image to ecr with docker
resource "docker_image" "lambda_image" {
  name = "${aws_ecr_repository.shedular.repository_url}:latest"
  build {
    context = "../example"
    dockerfile = "Dockerfile"
  }

  triggers = {
    dir_sha1 = sha1(join("", [for f in fileset(path.module, "../example/*/*") : filesha1(f)]))
  }
}

# push image to ecr
resource "docker_registry_image" "helloworld" {
  name          = docker_image.lambda_image.name 
}
```

### create a `lambda.tf` file
```
# lambda iam role
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
```

### create an `api-gateway.tf` file. Here we are integrating api-gateway to lambda.
```
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
```

## ensure you are on the infrastructure directory on your terminal and run `terraform init` to initialize terraform

## then run `terraform apply` to deploy the application and your pre-defined infrastructure.

## if deployed successfully, go to aws console and test the lambda function by calling the api endpoints.

## you can drop you question on the discussion section of this repo.