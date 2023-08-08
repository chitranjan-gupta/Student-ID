import {
    Agent,
    ConnectionEventTypes,
    WsOutboundTransport,
    HttpOutboundTransport,
    DidExchangeState,
    ConnectionsModule,
    DidsModule,
    TypedArrayEncoder,
    KeyType,
    CredentialsModule,
    V2CredentialProtocol
} from '@aries-framework/core'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import { IndySdkModule, IndySdkAnonCredsRegistry, IndySdkIndyDidRegistrar, IndySdkIndyDidResolver } from '@aries-framework/indy-sdk'
import indySdk from 'indy-sdk'
import { anoncreds } from '@hyperledger/anoncreds-nodejs'
import { AnonCredsModule, LegacyIndyCredentialFormatService, AnonCredsCredentialFormatService } from '@aries-framework/anoncreds'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'

import { genesis } from "./bcovrin.js"

const seed = TypedArrayEncoder.fromString(`00000000000000000000000000Roshan`) // What you input on bcovrin. Should be kept secure in production!
const unqualifiedIndyDid = `Hn1G3Z8ENtgoRfGJpFx61g` // will be returned after registering seed on bcovrin
const indyDid = `did:indy:bcovrin:test:${unqualifiedIndyDid}`

const initializeAcmeAgent = async () => {
    // Simple agent configuration. This sets some basic fields like the wallet
    // configuration and the label.
    const config = {
        label: 'demo-agent-acme',
        walletConfig: {
            id: 'mainAcme',
            key: 'demoagentacme0000000000000000000',
        },
        endpoints: ['http://localhost:3001'],
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
    })

    // Register a simple `WebSocket` outbound transport
    agent.registerOutboundTransport(new WsOutboundTransport())

    // Register a simple `Http` outbound transport
    agent.registerOutboundTransport(new HttpOutboundTransport())

    // Register a simple `Http` inbound transport
    agent.registerInboundTransport(new HttpInboundTransport({ port: 3001 }))

    // Initialize the agent
    await agent.initialize()

    return agent
}

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

const run = async () => {
    console.log('Initializing Acme agent...')
    const acmeAgent = await initializeAcmeAgent()
    await acmeAgent.dids.import({
        did: indyDid,
        overwrite: true,
        privateKeys: [
            {
                privateKey: seed,
                keyType: KeyType.Ed25519,
            },
        ],
    })
    // const schemaResult = await acmeAgent.modules.anoncreds.registerSchema({
    //     schema: {
    //         attrNames: ['name'],
    //         issuerId: indyDid,
    //         name: 'Example Schema to register',
    //         version: '1.0.0',
    //     },
    //     options: {},
    // })
    // console.log(schemaResult)
    // if (schemaResult.schemaState.state === 'failed') {
    //     throw new Error(`Error creating schema: ${schemaResult.schemaState.reason}`)
    // }
    // const credentialDefinitionResult = await acmeAgent.modules.anoncreds.registerCredentialDefinition({
    //     credentialDefinition: {
    //         tag: 'default',
    //         issuerId: indyDid,
    //         schemaId: schemaResult.schemaState.schemaId
    //     },
    //     options: {},
    // })

    // if (credentialDefinitionResult.credentialDefinitionState.state === 'failed') {
    //     throw new Error(
    //         `Error creating credential definition: ${credentialDefinitionResult.credentialDefinitionState.reason}`
    //     )
    // }
    // console.log(credentialDefinitionResult)
    console.log('Creating the invitation as Acme...')
    const { outOfBandRecord, invitationUrl } = await createNewInvitation(acmeAgent)
    console.log(invitationUrl)
    console.log('Listening for connection changes...')
    acmeAgent.events.on(ConnectionEventTypes.ConnectionStateChanged, ({ payload }) => {
        if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) return
        if (payload.connectionRecord.state === DidExchangeState.Completed) {
            // the connection is now ready for usage in other protocols!
            console.log(`Connection for out-of-band id ${outOfBandRecord.id} completed`)
            // Custom business logic can be included here
            // In this example we can send a basic message to the connection, but
            // anything is possible
            cb()
            const anonCredsCredentialExchangeRecord = acmeAgent.credentials.offerCredential({
                protocolVersion: 'v2',
                connectionId: outOfBandRecord.id,
                credentialFormats: {
                    anoncreds: {
                        credentialDefinitionId: 'did:indy:bcovrin:test:Hn1G3Z8ENtgoRfGJpFx61g/anoncreds/v0/CLAIM_DEF/12595/default',//credentialDefinitionResult.credentialDefinitionState.credentialDefinitionId
                        attributes: [
                            { name: 'name', value: 'Jane Doe' }
                        ],
                    },
                },
            })
            anonCredsCredentialExchangeRecord.then((v) => console.log(v))

            // We exit the flow
            //process.exit(0)
        }
    })
    //console.log(anonCredsCredentialExchangeRecord)
    // const invitationUrl = "http://localhost:3002?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiI2MWVmMDAwNy1iMWZhLTQ4NDYtYjdkNi05ZjAzMjk3N2M0ZWMiLCJsYWJlbCI6ImRlbW8tYWdlbnQtYm9iIiwiYWNjZXB0IjpbImRpZGNvbW0vYWlwMSIsImRpZGNvbW0vYWlwMjtlbnY9cmZjMTkiXSwiaGFuZHNoYWtlX3Byb3RvY29scyI6WyJodHRwczovL2RpZGNvbW0ub3JnL2RpZGV4Y2hhbmdlLzEuMCIsImh0dHBzOi8vZGlkY29tbS5vcmcvY29ubmVjdGlvbnMvMS4wIl0sInNlcnZpY2VzIjpbeyJpZCI6IiNpbmxpbmUtMCIsInNlcnZpY2VFbmRwb2ludCI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMiIsInR5cGUiOiJkaWQtY29tbXVuaWNhdGlvbiIsInJlY2lwaWVudEtleXMiOlsiZGlkOmtleTp6Nk1rdWJDVmVraDIyTmJnVjc2blBLTnNWTVB6TjV3N1dLRndibWE4eEM1eXFqVWMiXSwicm91dGluZ0tleXMiOltdfV19"
    // console.log('Accepting the invitation as Acme...')
    // await receiveInvitation(acmeAgent, invitationUrl)
}

void run()
