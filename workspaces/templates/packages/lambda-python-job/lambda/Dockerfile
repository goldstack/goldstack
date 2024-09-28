# Use the Amazon Linux base image to install zip
FROM python:3.12 AS build

RUN apt-get update && apt-get install -y zip

# Create a directory for the lambda function and dependencies
WORKDIR /lambda

# Copy the requirements file and install dependencies
COPY requirements.txt ./
RUN pip install -r requirements.txt --target .

# Copy the lambda function code
COPY lambda.py ./lambda.py

# Create the zip file
RUN zip -r /source.zip .

# Use the AWS Lambda Python base image
FROM public.ecr.aws/lambda/python:3.12

# Copy the zip file from the build stage
COPY --from=build /source.zip /source.zip

CMD ["lambda.handler"]