import {
    Agent,
    ConnectionEventTypes,
    WsOutboundTransport,
    HttpOutboundTransport,
    DidExchangeState,
    ConnectionsModule,
    DidsModule,
    CredentialsModule,
    V2CredentialProtocol,
    CredentialEventTypes,
    CredentialState,
    AutoAcceptCredential
} from '@aries-framework/core'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import { IndySdkModule, IndySdkAnonCredsRegistry, IndySdkIndyDidRegistrar, IndySdkIndyDidResolver } from '@aries-framework/indy-sdk'
import indySdk from 'indy-sdk'
import { anoncreds } from '@hyperledger/anoncreds-nodejs'
import { AnonCredsModule, LegacyIndyCredentialFormatService, AnonCredsCredentialFormatService } from '@aries-framework/anoncreds'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'

import { genesis } from "./bcovrin.js"

const initializeBobAgent = async () => {
    // Simple agent configuration. This sets some basic fields like the wallet
    // configuration and the label. It also sets the mediator invitation url,
    // because this is most likely required in a mobile environment.
    const config = {
        label: 'demo-agent-bob',
        walletConfig: {
            id: 'mainBob',
            key: 'demoagentbob00000000000000000000',
        },
        endpoints: ['http://localhost:3002'],
    }

    // A new instance of an agent is created here
    // indy-sdk can also be replaced by the Askar if required
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
                        credentialFormats: [new LegacyIndyCredentialFormatService(), new AnonCredsCredentialFormatService()],
                    }),
                ],
            }),
            connections: new ConnectionsModule({ autoAcceptConnections: true }),
        },
        dependencies: agentDependencies,
        autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
    })

    // Register a simple `WebSocket` outbound transport
    agent.registerOutboundTransport(new WsOutboundTransport())

    // Register a simple `Http` outbound transport
    agent.registerOutboundTransport(new HttpOutboundTransport())

    // Register a simple `Http` inbound transport
    agent.registerInboundTransport(new HttpInboundTransport({ port: 3002 }))


    // Initialize the agent
    await agent.initialize()

    return agent
}

const createNewInvitation = async (agent) => {
    const outOfBandRecord = await agent.oob.createInvitation()

    return {
        invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: 'http://localhost:3002' }),
        outOfBandRecord,
    }
}

const receiveInvitation = async (agent, invitationUrl) => {
    const connection = await agent.oob.receiveInvitationFromUrl(invitationUrl)
    console.log(connection)
    return connection
}

const setupConnectionListener = (agent, outOfBandRecord, cb) => {
    agent.events.on(ConnectionEventTypes.ConnectionStateChanged, ({ payload }) => {
        if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) return
        if (payload.connectionRecord.state === DidExchangeState.Completed) {
            // the connection is now ready for usage in other protocols!
            console.log(`Connection for out-of-band id ${outOfBandRecord.id} completed`)

            // Custom business logic can be included here
            // In this example we can send a basic message to the connection, but
            // anything is possible
            cb()

            // We exit the flow
            process.exit(0)
        }
    })
}

const run = async () => {
    console.log('Initializing Bob agent...')
    const bobAgent = await initializeBobAgent()
    bobAgent.events.on(CredentialEventTypes.CredentialStateChanged, async ({ payload }) => {
        switch (payload.credentialRecord.state) {
            case CredentialState.OfferReceived:
                console.log('received a credential')
                // custom logic here
                console.log(payload)
                await bobAgent.credentials.acceptOffer({ credentialRecordId: payload.credentialRecord.id })
            case CredentialState.Done:
                console.log(`Credential for credential id ${payload.credentialRecord.id} is accepted`)
                // For demo purposes we exit the program here.
                process.exit(0)
        }
    })
    //console.log(await bobAgent.oob.findById("d2d6a96e-fc00-42ec-abec-ff5347964418"))
    //await bobAgent.oob.deleteById("d2d6a96e-fc00-42ec-abec-ff5347964418")
    // console.log('Creating the invitation as Bob...')
    // const { outOfBandRecord, invitationUrl } = await createNewInvitation(bobAgent)
    // console.log(invitationUrl)
    const invitationUrl = "http://localhost:3001?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiJiMTg4NGNlMi05MjZjLTRhZjktOTA5MC04OWQwOTM2YzRmY2IiLCJsYWJlbCI6ImRlbW8tYWdlbnQtYWNtZSIsImFjY2VwdCI6WyJkaWRjb21tL2FpcDEiLCJkaWRjb21tL2FpcDI7ZW52PXJmYzE5Il0sImhhbmRzaGFrZV9wcm90b2NvbHMiOlsiaHR0cHM6Ly9kaWRjb21tLm9yZy9kaWRleGNoYW5nZS8xLjAiLCJodHRwczovL2RpZGNvbW0ub3JnL2Nvbm5lY3Rpb25zLzEuMCJdLCJzZXJ2aWNlcyI6W3siaWQiOiIjaW5saW5lLTAiLCJzZXJ2aWNlRW5kcG9pbnQiOiJodHRwOi8vbG9jYWxob3N0OjMwMDEiLCJ0eXBlIjoiZGlkLWNvbW11bmljYXRpb24iLCJyZWNpcGllbnRLZXlzIjpbImRpZDprZXk6ejZNa25WQWhnbWdhbTdmWENDOWhQcW41UkVOZFRwclFkZU1Lb1NEYTFvNDRKclI3Il0sInJvdXRpbmdLZXlzIjpbXX1dfQ"
    console.log('Accepting the invitation as Bob...')
    await receiveInvitation(bobAgent, invitationUrl)
    // console.log('Listening for connection changes...')
    // setupConnectionListener(bobAgent, outOfBandRecord, () =>
    //     console.log('We now have an active connection to use in the following tutorials')
    // )
}

void run()
