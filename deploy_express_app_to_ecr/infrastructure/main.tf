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
    dir_sha1 = sha1(join("", [for f in fileset(path.module, "../example/*") : filesha1(f)]))
  }
}

# push image to ecr
resource "docker_registry_image" "helloworld" {
  name          = docker_image.lambda_image.name 
}