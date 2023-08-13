import {
    Agent,
    ConnectionEventTypes,
    WsOutboundTransport,
    HttpOutboundTransport,
    DidExchangeState,
    DidsModule,
    TypedArrayEncoder,
    CredentialsModule,
    V2CredentialProtocol,
    BasicMessageEventTypes,
} from '@aries-framework/core'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import { IndySdkModule, IndySdkAnonCredsRegistry, IndySdkIndyDidRegistrar, IndySdkIndyDidResolver } from '@aries-framework/indy-sdk'
import indySdk from 'indy-sdk'
import { anoncreds } from '@hyperledger/anoncreds-nodejs'
import { AnonCredsModule, AnonCredsCredentialFormatService } from '@aries-framework/anoncreds'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'
import { startServer } from '@aries-framework/rest'
import express from "express"
import bodyParser from 'body-parser'
import cors from 'cors'
import oobs from "./routes/oobs.js"
import { acceptConnection, acceptConnectionBack } from "./utils/request.js"
import { send } from './utils/chat.js'

import { genesis } from "./bcovrin.js"

//const stewardseed = "0000000000000000000000000Roshan1"
//const seed = TypedArrayEncoder.fromString(stewardseed) // What you input on bcovrin. Should be kept secure in production!
//const unqualifiedIndyDid = `DxRyhqooU79KcCYpMDcPkP` // will be returned after registering seed on bcovrin
//const indyDid = `did:indy:bcovrin:test:${unqualifiedIndyDid}`

const getAgent = async () => {
    const config = {
        label: 'College',
        walletConfig: {
            id: 'testcollege',
            key: process.env.AGENT_WALLET_KEY || 'testcollege',
        },
        endpoints: ["http://localhost:5002"],
    }
    const agent = new Agent({
        config,
        modules: {
            indySdk: new IndySdkModule({
                indySdk,
                networks: [
                    {
                        isProduction: false,
                        indyNamespace: "bcovrin:test",
                        genesisTransactions: genesis,
                        connectOnStartup: true
                    }
                ]
            }),
            anoncredsRs: new AnonCredsRsModule({
                anoncreds,
            }),
            anoncreds: new AnonCredsModule({
                registries: [new IndySdkAnonCredsRegistry()],
            }),
            dids: new DidsModule({
                registrars: [new IndySdkIndyDidRegistrar()],
                resolvers: [new IndySdkIndyDidResolver()],
            }),
            credentials: new CredentialsModule({
                credentialProtocols: [
                    new V2CredentialProtocol({
                        credentialFormats: [new AnonCredsCredentialFormatService()],
                    }),
                ],
            }),
        },
        dependencies: agentDependencies
    })

    agent.registerInboundTransport(new HttpInboundTransport({ port: 5002 }))

    agent.registerOutboundTransport(new HttpOutboundTransport())
    agent.registerOutboundTransport(new WsOutboundTransport())

    await agent.initialize()
    return agent
}

const run = async () => {
    const steward = await getAgent();
    steward.events.on(BasicMessageEventTypes.BasicMessageStateChanged, async ({ payload }) => {
        console.log(payload.basicMessageRecord.content)
    })
    steward.events.on(ConnectionEventTypes.ConnectionStateChanged, async ({ payload }) => {
        if (payload.connectionRecord.state === DidExchangeState.ResponseReceived) {
            const connectionRecord = await acceptConnectionBack(steward, payload.connectionRecord.id);
            console.log("Connection Responded")
            console.log(connectionRecord)
        }else if (payload.connectionRecord.state === DidExchangeState.RequestReceived) {
            const connectionRecord = await acceptConnection(steward, payload.connectionRecord.id);
            console.log("Connection Requested")
            console.log(connectionRecord)
        }else if (payload.connectionRecord.state === DidExchangeState.Completed) {
            console.log("Connection completed")
            await send(steward, payload.connectionRecord.id, "Hi thik ba")
        }
    })
    const app = express()
    app.use(cors())
    app.use(
        bodyParser.urlencoded({
            extended: true,
        })
    )
    app.use(bodyParser.json())
    app.use((req, res, next) => {
        req.steward = steward;
        next();
    })
    app.use("/oobs", oobs);
    await startServer(steward, {
        app: app,
        port: 8000,
        cors: true
    })
}

void run()