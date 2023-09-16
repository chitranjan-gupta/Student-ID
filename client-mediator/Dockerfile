FROM ubuntu:22.04

ARG uid=1000

RUN apt-get update -y && apt-get install -y \
	git \
	wget \
	python3 \
	python3-pip \
	python-setuptools \
	python3-nacl \
	apt-transport-https \
	ca-certificates \
	supervisor \
	gettext-base \
	software-properties-common \
    curl

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys CE7709D068DB5E88
ARG indy_stream=stable
RUN echo "deb http://security.ubuntu.com/ubuntu focal-security main" | tee /etc/apt/sources.list.d/focal-security.list
RUN add-apt-repository "deb https://repo.sovrin.org/sdk/deb bionic $indy_stream"

RUN useradd -ms /bin/bash -u $uid indy

RUN apt-get update -y && apt-get install -y \
    libssl1.1 \
	libsodium-dev \
    libzmq3-dev \
	vim \
	libindy \
	indy-cli \
    libnullpay \
    libvcx
RUN rm /etc/apt/sources.list.d/focal-security.list

RUN mkdir /app
COPY . /app
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
EXPOSE 3001