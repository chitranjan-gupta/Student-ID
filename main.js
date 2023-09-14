import {
    Agent,
    ConnectionEventTypes,
    WsOutboundTransport,
    HttpOutboundTransport,
    DidExchangeState,
    DidsModule,
    CredentialsModule,
    V2CredentialProtocol,
    BasicMessageEventTypes,
    CredentialEventTypes,
    CredentialState,
    ProofEventTypes,
    ProofState,
    MediationRecipientModule,
    PeerDidResolver,
    KeyDidResolver,
    ProofsModule,
    V2ProofProtocol
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

const mediatorInvitationUrl = "http://localhost:3001/invitation?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiJmZmNlYmE4Yy1kY2E1LTRjNzItYmYwYy00YmE3NDZlYjUzZmIiLCJsYWJlbCI6Ik1lZGlhdG9yIiwiYWNjZXB0IjpbImRpZGNvbW0vYWlwMSIsImRpZGNvbW0vYWlwMjtlbnY9cmZjMTkiXSwiaGFuZHNoYWtlX3Byb3RvY29scyI6WyJodHRwczovL2RpZGNvbW0ub3JnL2RpZGV4Y2hhbmdlLzEuMCIsImh0dHBzOi8vZGlkY29tbS5vcmcvY29ubmVjdGlvbnMvMS4wIl0sInNlcnZpY2VzIjpbeyJpZCI6IiNpbmxpbmUtMCIsInNlcnZpY2VFbmRwb2ludCI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMSIsInR5cGUiOiJkaWQtY29tbXVuaWNhdGlvbiIsInJlY2lwaWVudEtleXMiOlsiZGlkOmtleTp6Nk1rb3FGQVhLclBRRUdZN1BIUGpNNmR2YXJHYUxVSlNOYVVrWllFeGhVeXNac28iXSwicm91dGluZ0tleXMiOltdfSx7ImlkIjoiI2lubGluZS0xIiwic2VydmljZUVuZHBvaW50Ijoid3M6Ly9sb2NhbGhvc3Q6MzAwMSIsInR5cGUiOiJkaWQtY29tbXVuaWNhdGlvbiIsInJlY2lwaWVudEtleXMiOlsiZGlkOmtleTp6Nk1rb3FGQVhLclBRRUdZN1BIUGpNNmR2YXJHYUxVSlNOYVVrWllFeGhVeXNac28iXSwicm91dGluZ0tleXMiOltdfV19"

const agentConfig = {
    label: 'Student',
    walletConfig: {
        id: 'teststudent',
        key: process.env.AGENT_WALLET_KEY || 'teststudent',
    },
    //    endpoints: ["http://localhost:5002"],
}

const getAgent = async () => {
    const agent = new Agent({
        config: agentConfig,
        modules: {
            mediationRecipient: new MediationRecipientModule({
                mediatorInvitationUrl
            }),
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
                resolvers: [new IndySdkIndyDidResolver(), new PeerDidResolver(), new KeyDidResolver()],
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

    //    agent.registerInboundTransport(new HttpInboundTransport({ port: 5002 }))

    agent.registerOutboundTransport(new HttpOutboundTransport())
    agent.registerOutboundTransport(new WsOutboundTransport())
    console.log("Config")
    await agent.initialize()
    return agent
}

const run = async () => {
    console.log("Started")
    const steward = await getAgent();
    console.log("Agent")
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
                await steward.credentials.acceptProposal({ credentialRecordId: payload.credentialRecord.id })
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
            case ProofState.RequestReceived: {
                console.log("Proof Request")
                console.log(payload)
                break;
            }
            case ProofState.PresentationReceived: {
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
        port: 8000,
        cors: true
    })
}

void run()