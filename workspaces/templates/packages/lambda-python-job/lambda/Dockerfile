FROM public.ecr.aws/lambda/python:3.12

RUN yum install -y zip

# Copy the requirements file and install dependencies
COPY requirements.txt ./
RUN pip install -r requirements.txt --target .

# Copy the lambda function code
COPY lambda.py ./

# Create the zip file
RUN zip -r /source.zip .

# Set the CMD to your handler (e.g., lambda.handler)
CMD ["lambda.handler"]