# Use the Amazon Linux base image to install zip
FROM amazonlinux:2 AS build

# Install necessary build tools and dependencies
RUN yum install -y gcc openssl-devel bzip2-devel libffi-devel make wget zip tar gzip

# Install Python 3.12 from source
RUN cd /usr/src && \
    wget https://www.python.org/ftp/python/3.12.0/Python-3.12.0.tgz && \
    tar xzf Python-3.12.0.tgz && \
    cd Python-3.12.0 && \
    ./configure --enable-optimizations && \
    make altinstall

# Ensure pip is installed and upgraded
RUN /usr/local/bin/pip3.12 install --upgrade pip

# Copy the requirements file and install dependencies
COPY requirements.txt ./
RUN  /usr/local/bin/pip3.12 install -r requirements.txt --target .

# Copy the lambda function code
COPY lambda.py ./

# Create the zip file
RUN zip -r /source.zip .

# Use the AWS Lambda Python base image
FROM public.ecr.aws/lambda/python:3.12

# Copy the zip file from the build stage
COPY --from=build /source.zip /source.zip

# Set the CMD to your handler (e.g., lambda.handler)
CMD ["lambda.handler"]