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
    CredentialEventTypes,
    CredentialState,
    KeyType,
    ProofsModule,
    V2ProofProtocol,
    ProofEventTypes,
    ProofState
} from '@aries-framework/core'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import { IndySdkModule, IndySdkAnonCredsRegistry, IndySdkIndyDidRegistrar, IndySdkIndyDidResolver } from '@aries-framework/indy-sdk'
import indySdk from 'indy-sdk'
import { anoncreds } from '@hyperledger/anoncreds-nodejs'
import { AnonCredsModule, AnonCredsCredentialFormatService, AnonCredsProofFormatService } from '@aries-framework/anoncreds'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'
import { startServer } from '@aries-framework/rest'
import express from "express"
import bodyParser from 'body-parser'
import cors from 'cors'
import oobs from "./routes/oobs.js"
import credential from "./routes/credential.js"
import schema from "./routes/schema.js"
import credentialDef from "./routes/credential-def.js"
import connection from "./routes/connection.js"
import did from "./routes/did.js"
import message from "./routes/message.js"
import proof from "./routes/proof.js"
import { acceptConnection, acceptConnectionBack } from "./utils/request.js"
import { send } from './utils/chat.js'

import { genesis } from "./bcovrin.js"

const stewardseed = "0000000000000000000000000Roshan1"
const seed = TypedArrayEncoder.fromString(stewardseed) // What you input on bcovrin. Should be kept secure in production!
const unqualifiedIndyDid = `DxRyhqooU79KcCYpMDcPkP` // will be returned after registering seed on bcovrin
const indyDid = `did:indy:bcovrin:test:${unqualifiedIndyDid}`//did:indy:bcovrin:test:DxRyhqooU79KcCYpMDcPkP

const getAgent = async () => {
    const config = {
        label: 'College',
        walletConfig: {
            id: 'testcollege',
            key: process.env.AGENT_WALLET_KEY || 'testcollege',
        },
        endpoints: ["http://localhost:5001"],
    }
    const agent = new Agent({
        config,
        modules: {
            indySdk: new IndySdkModule({
                indySdk,
                networks: [
                    {
                        id: "bcovrin-test-net",
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
            proofs: new ProofsModule({
                proofProtocols: [
                    new V2ProofProtocol({
                        proofFormats: [new AnonCredsProofFormatService()]
                    })
                ]
            }),
        },
        dependencies: agentDependencies
    })

    agent.registerInboundTransport(new HttpInboundTransport({ port: 5001 }))

    agent.registerOutboundTransport(new HttpOutboundTransport())
    agent.registerOutboundTransport(new WsOutboundTransport())

    await agent.initialize()
    return agent
}

const run = async () => {
    const steward = await getAgent();
    await steward.dids.import({
        did:indyDid,
        overwrite: true,
        privateKeys: [
            {
                privateKey: seed,
                keyType: KeyType.Ed25519
            }
        ]
    })
    await steward.modules.anoncreds.createLinkSecret({ setAsDefault: true })
    steward.events.on(BasicMessageEventTypes.BasicMessageStateChanged, async ({ payload }) => {
        console.log(payload.basicMessageRecord.content)
    })
    steward.events.on(ConnectionEventTypes.ConnectionStateChanged, async ({ payload }) => {
        switch (payload.connectionRecord.state) {
            case DidExchangeState.ResponseReceived: {
                const connectionRecord = await acceptConnectionBack(steward, payload.connectionRecord.id);
                console.log("Connection Responded")
                console.log(connectionRecord)
                break
            }
            case DidExchangeState.RequestReceived: {
                const connectionRecord = await acceptConnection(steward, payload.connectionRecord.id);
                console.log("Connection Requested")
                console.log(connectionRecord)
                break
            }
            case DidExchangeState.Completed: {
                console.log(`Connection completed`)
                await send(steward, payload.connectionRecord.id, "Hi Kya hal ba")
                break
            }
        }
    })
    steward.events.on(CredentialEventTypes.CredentialStateChanged, async ({ payload }) => {
        switch (payload.credentialRecord.state) {
            case CredentialState.ProposalReceived: {
                console.log(`Received a credential proposal ${payload.credentialRecord.id}`)
                break
            }
            case CredentialState.OfferReceived: {
                console.log(`Received a credential offer ${payload.credentialRecord.id}`)
                await steward.credentials.acceptOffer({ credentialRecordId: payload.credentialRecord.id })
                break
            }
            case CredentialState.RequestReceived: {
                console.log(`Received a credential request ${payload.credentialRecord.id}`)
                await steward.credentials.acceptRequest({ credentialRecordId: payload.credentialRecord.id })
                break
            }
            case CredentialState.CredentialReceived: {
                console.log(`Received a credential ${payload.credentialRecord.id}`)
                await steward.credentials.acceptCredential({ credentialRecordId: payload.credentialRecord.id })
                break
            }
            case CredentialState.Done: {
                console.log(`Credential for credential id ${payload.credentialRecord.id} is accepted`)
                break
            }
        }
    })
    steward.events.on(ProofEventTypes.ProofStateChanged, async ({ payload }) => {
        switch (payload.proofRecord.state) {
            case ProofState.PresentationReceived:{
                console.log("Presentation Received")
                console.log(payload)
                break;
            }
            case ProofState.Done: {
                const formattedData = await steward.proofs.getFormatData(
                    payload.proofRecord.id
                )
                const items = Object.entries(
                    formattedData.presentation?.anoncreds.requested_proof
                        .revealed_attr_groups.identity.values
                )
                console.log("============= Presentation ==============")
                items.forEach(([key, { raw }]) => {
                    console.log(`- ${key}: ${raw}`)
                })
                console.log("=========================================")
                break
            }
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
    app.use("/credential", credential);
    app.use("/schema", schema);
    app.use("/credential-def", credentialDef);
    app.use("/did", did);
    app.use("/message", message);
    app.use("/proof", proof);
    app.use("/connection", connection);
    await startServer(steward, {
        app: app,
        port: 5000,
        cors: true
    })
}

void run()