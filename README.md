# Student-ID

## Debian Linux 
Ubuntu -- 20.04.6 LTS
`$ lsb_release -a`

## Install Docker and Docker Compose

Docker version codespace -- Docker version 20.10.25+azure-2, build b82b9f3a0e763304a250531cb9350aa6d93723c9
`$ docker --version` or `$ docker -v`

## Install Node.js
`$ sudo apt-get install nodejs`

Node.js version -- v20.4.0
`$ node -v` or `$ node --version`

NPM Version -- 9.7.2
`$ npm -v` or `$ npm --version`

## Install the Packages
`$ npm install`

## Install the indy-sdk
To Get the required dependencies we have to add the repository
    1. `$ sudo apt-get install ca-certificates -y`
    2. `$ sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys CE7709D068DB5E88`
    3. `$ sudo add-apt-repository "deb https://repo.sovrin.org/sdk/deb bionic stable"`
    4. `$ sudo apt-get update`
Install the required dependencies 
    1. `$ sudo apt-get install -y libindy libnullpay libvcx indy-cli`
    2. `$ sudo apt-get install -y libsodium-dev libzmq3-dev`
## Official Docs -- https://github.com/hyperledger/indy-sdk
## Building libindy from source -- https://aries.js.org/guides/0.4/getting-started/set-up/indy-sdk/linux

## To Check is indy installed successfully
`$ npx -p @aries-framework/node@^0.3 is-indy-installed`

## Run indy pool docker container
Build from the source 
1. `$ git clone https://github.com/hyperledger/indy-sdk.git`
2. `$ cd indy-sdk`
3. `$ docker build -f ci/indy-pool.dockerfile -t indy_pool`
4. `$ docker run -itd -p 9701-9708:9701-9708 indy_pool`

Start from indy-node repository
1. `$ git clone https://github.com/hyperledger/indy-node.git`
2. `$ git indy-node`
3. `$ ./pool_start.sh --help`

Using the docker image repo -- https://github.com/ghoshbishakh
Start from a pre-configured docker image
1. `$ docker run -itd -p 9701-9708:9701-9708 ghoshbishakh/indy_pool`

Docker process
`$ docker ps`
Get the container id from `$ docker ps` command
Docker bash into container
`$ docker exec -it container_id bash`

Check that nodes are running in the indy pool
`$ tail -f /var/log/indy/sandbox/Node1.log`

Get the genesis transaction from indy pool
`$ cat /var/lib/indy/sandbox/pool_transactions_genesis`

Copy it and paste into a file name pool1.txn

Set the type to module in package.json
"type":"module" or "type":"commonjs"