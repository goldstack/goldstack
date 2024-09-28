FROM ubuntu
RUN apt-get update
RUN apt-get install -y software-properties-common zip findutils curl
RUN DEBIAN_FRONTEND=noninteractive apt-get -y install tzdata
RUN add-apt-repository --yes ppa:deadsnakes/ppa

RUN apt-get -y install python3.9-full
RUN curl https://bootstrap.pypa.io/get-pip.py --output get-pip.py
RUN python3.9 get-pip.py
      
ADD ./requirements.txt ./src/requirements.txt
RUN python3.9 -m pip install -t /src -r /src/requirements.txt


ADD ./lambda.py ./src/lambda.py 

RUN cd /src && zip -r /source.zip .