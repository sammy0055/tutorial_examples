FROM public.ecr.aws/lambda/nodejs:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . . ${LAMBDA_TASK_ROOT}

CMD [ "index.handler" ]