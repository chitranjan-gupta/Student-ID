FROM ubuntu:22.04
RUN mkdir /app
COPY . /app
WORKDIR /app
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys CE7709D068DB5E88
RUN add-apt-repository "deb https://repo.sovrin.org/sdk/deb bionic stable"
RUN apt-get update
RUN apt-get install -y libindy libnullpay libvcx indy-cli
RUN apt-get install -y libsodium-dev libzmq3-dev
RUN apt-get install nodejs
RUN npm install
CMD ["npm", "start"]
EXPOSE 5000