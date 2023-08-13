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
    AutoAcceptCredential,
    BasicMessageEventTypes
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
            key: 'demoagentbob00000000000000000000'
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
                anoncreds
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
        autoAcceptCredentials: AutoAcceptCredential.ContentApproved
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
    bobAgent.events.on(BasicMessageEventTypes.BasicMessageStateChanged, async ({ payload }) => {
        console.log(payload.basicMessageRecord.content)
    })
    bobAgent.events.on(CredentialEventTypes.CredentialStateChanged, async ({ payload }) => {
        switch (payload.credentialRecord.state) {
            case CredentialState.OfferReceived:
                console.log("Received a credential")
                // custom logic here
                console.log(payload)
                await bobAgent.modules.anoncreds.createLinkSecret({ setAsDefault: true })
                await bobAgent.credentials.acceptOffer({ credentialRecordId: payload.credentialRecord.id })
            case CredentialState.Done:
                console.log(`Credential for credential id ${payload.credentialRecord.id} is accepted`)
                // For demo purposes we exit the program here.
                process.exit(0)
        }
    })
    // console.log('Creating the invitation as Bob...')
    // const { outOfBandRecord, invitationUrl } = await createNewInvitation(bobAgent)
    // console.log(invitationUrl)
    const invitationUrl = "http://localhost:5001?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiI5NjI3YjM3OC1iNTQ4LTRlMDQtOTQzMS0zYWI5MWM5NGU1ZTMiLCJsYWJlbCI6IlN0dWRlbnQiLCJhY2NlcHQiOlsiZGlkY29tbS9haXAxIiwiZGlkY29tbS9haXAyO2Vudj1yZmMxOSJdLCJoYW5kc2hha2VfcHJvdG9jb2xzIjpbImh0dHBzOi8vZGlkY29tbS5vcmcvZGlkZXhjaGFuZ2UvMS4wIiwiaHR0cHM6Ly9kaWRjb21tLm9yZy9jb25uZWN0aW9ucy8xLjAiXSwic2VydmljZXMiOlt7ImlkIjoiI2lubGluZS0wIiwic2VydmljZUVuZHBvaW50IjoiaHR0cDovL2xvY2FsaG9zdDo1MDAxIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWt0VU5rOFp1NW9MdFdldlR3R3BZdUJlMlNnTWdmVHZocXJmdVpYenlteGtEUSJdLCJyb3V0aW5nS2V5cyI6W119XX0"
    console.log('Accepting the invitation as Bob...')
    await receiveInvitation(bobAgent, invitationUrl)
    // console.log('Listening for connection changes...')
    // setupConnectionListener(bobAgent, outOfBandRecord, () =>
    //     console.log('We now have an active connection to use in the following tutorials')
    // )
}

void run()
