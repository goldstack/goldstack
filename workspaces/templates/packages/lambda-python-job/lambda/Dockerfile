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

# Final stage to extract the zip file
FROM scratch AS export

# Copy the zip file from the build stage
COPY --from=build /source.zip /source.zip

CMD ["echo", "File can be copied from `/source.zip`"]