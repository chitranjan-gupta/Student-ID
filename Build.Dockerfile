FROM ubuntu:22.04
RUN apt-get update
RUN apt-get install -y libsodium-dev libzmq3-dev curl git
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs -o rustup-init.sh
RUN sh rustup-init.sh -y
RUN git clone https://github.com/hyperledger/indy-sdk
RUN cd indy-sdk/libindy
RUN cargo build --release
RUN cd ../cli
RUN RUSTFLAGS=" -L ../libindy/target/release" cargo build --release
RUN cd ../libnullpay
RUN RUSTFLAGS=" -L ../libindy/target/release" cargo build --release
RUN cd ../vcx/libvcx
RUN RUSTFLAGS=" -L ../../libindy/target/release" cargo build --release
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