FROM ubuntu:22.04
RUN apt-get update
RUN apt-get install -y libsodium-dev libzmq3-dev
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
RUN git clone https://github.com/hyperledger/indy-sdk
RUN cd indy-sdk/libindy
RUN cargo build --release
RUN cd ../cli
RUN cargo build --release
RUN cd ../libnullpay
RUN cargo build --release
RUN cd ../vcx/libvcx
RUN cargo build --release
RUN cd ../../
RUN mv libindy/target/release/libindy.so /usr/lib/libindy.so
RUN mv libnullpay/target/release/libnullpay.so /usr/lib/libnullpay.so
RUN mv vcx/libvcx/target/release/libvcx.so /usr/lib/libvcx.so
RUN apt-get install nodejs
RUN mkdir /app
COPY . /app
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
EXPOSE 5000