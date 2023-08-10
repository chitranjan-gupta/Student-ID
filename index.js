import {
    Agent,
    ConnectionEventTypes,
    WsOutboundTransport,
    HttpOutboundTransport,
    DidExchangeState,
    ConnectionsModule,
    DidsModule,
    TypedArrayEncoder,
    CredentialsModule,
    V2CredentialProtocol,
    AutoAcceptCredential,
    AutoAcceptProof
} from '@aries-framework/core'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import { IndySdkModule, IndySdkAnonCredsRegistry, IndySdkIndyDidRegistrar, IndySdkIndyDidResolver } from '@aries-framework/indy-sdk'
import indySdk from 'indy-sdk'
import { anoncreds } from '@hyperledger/anoncreds-nodejs'
import { AnonCredsModule, AnonCredsCredentialFormatService } from '@aries-framework/anoncreds'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'
import { startServer } from '@aries-framework/rest'
import express from 'express'

import { genesis } from "./bcovrin.js"

const stewardseed = "0000000000000000000000000Roshan1"
const seed = TypedArrayEncoder.fromString(stewardseed) // What you input on bcovrin. Should be kept secure in production!
const unqualifiedIndyDid = `DxRyhqooU79KcCYpMDcPkP` // will be returned after registering seed on bcovrin
const indyDid = `did:indy:bcovrin:test:${unqualifiedIndyDid}`

const createNewInvitation = async (agent) => {
    const outOfBandRecord = await agent.oob.createInvitation()

    return {
        invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: 'http://localhost:3001' }),
        outOfBandRecord,
    }
}

const receiveInvitation = async (agent, invitationUrl) => {
    const { outOfBandRecord } = await agent.oob.receiveInvitationFromUrl(invitationUrl)

    return outOfBandRecord
}

const getAgent = async () => {
    const config = {
        label: 'Student',
        walletConfig: {
            id: 'teststudent',
            key: process.env.AGENT_WALLET_KEY || 'teststudent',
        },
        endpoints: ["http://localhost:5001"],
        publicDidSeed: stewardseed,
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
            connections: new ConnectionsModule({ autoAcceptConnections: true }),
        },
        autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
        autoAcceptProofs: AutoAcceptProof.ContentApproved,
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
    steward.events.on(ConnectionEventTypes.ConnectionStateChanged, async ({ payload }) => {
        if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) return
        if (payload.connectionRecord.state === DidExchangeState.Completed) {
            // the connection is now ready for usage in other protocols!
            console.log(`Connection for out-of-band id ${outOfBandRecord.id} completed`)
            // Custom business logic can be included here
            // In this example we can send a basic message to the connection, but
            // anything is possible
            console.log(payload)
        }
    })

    const app = express()

    await startServer(steward, {
        app: app,
        port: 5000,
        cors: true
    })
}

void run()