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
    BasicMessageEventTypes,
    MediationRecipientModule,
    PeerDidResolver,
    KeyDidResolver
} from '@aries-framework/core'
import { agentDependencies } from '@aries-framework/node'
import { IndySdkModule, IndySdkAnonCredsRegistry, IndySdkIndyDidRegistrar, IndySdkIndyDidResolver } from '@aries-framework/indy-sdk'
import indySdk from 'indy-sdk'
import { anoncreds } from '@hyperledger/anoncreds-nodejs'
import { AnonCredsModule, LegacyIndyCredentialFormatService, AnonCredsCredentialFormatService } from '@aries-framework/anoncreds'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'

// paste your invitation url here
const mediatorInvitationUrl = "http://0.0.0.0:3001/invitation?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiIwZWRlN2E3ZC05N2UzLTQxZDAtOWQ1ZS04ZTBmNDM3NmNlNjkiLCJsYWJlbCI6IkNsaWVudCBNZWRpYXRvciIsImFjY2VwdCI6WyJkaWRjb21tL2FpcDEiLCJkaWRjb21tL2FpcDI7ZW52PXJmYzE5Il0sImhhbmRzaGFrZV9wcm90b2NvbHMiOlsiaHR0cHM6Ly9kaWRjb21tLm9yZy9kaWRleGNoYW5nZS8xLjAiLCJodHRwczovL2RpZGNvbW0ub3JnL2Nvbm5lY3Rpb25zLzEuMCJdLCJzZXJ2aWNlcyI6W3siaWQiOiIjaW5saW5lLTAiLCJzZXJ2aWNlRW5kcG9pbnQiOiJodHRwOi8vbG9jYWxob3N0OjMwMDEiLCJ0eXBlIjoiZGlkLWNvbW11bmljYXRpb24iLCJyZWNpcGllbnRLZXlzIjpbImRpZDprZXk6ejZNa2h5U3VDcFB2WkdYWXZ1NDdITGNNM1QyeW5FbVF3YnlpSHhodmdVYTRKMm1OIl0sInJvdXRpbmdLZXlzIjpbXX0seyJpZCI6IiNpbmxpbmUtMSIsInNlcnZpY2VFbmRwb2ludCI6IndzOi8vbG9jYWxob3N0OjMwMDEiLCJ0eXBlIjoiZGlkLWNvbW11bmljYXRpb24iLCJyZWNpcGllbnRLZXlzIjpbImRpZDprZXk6ejZNa2h5U3VDcFB2WkdYWXZ1NDdITGNNM1QyeW5FbVF3YnlpSHhodmdVYTRKMm1OIl0sInJvdXRpbmdLZXlzIjpbXX1dfQ"

const agentConfig = {
    label: "Alice",
    walletConfig: {
        id: "alice",
        key: "alice",
    }
}

const initializeAliceAgent = async () => {
    const agent = new Agent({
        config: agentConfig,
        dependencies: agentDependencies,
        autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
        modules: {
            connections: new ConnectionsModule({ autoAcceptConnections: true }),
            mediationRecipient: new MediationRecipientModule({
                mediatorInvitationUrl,
            }),
            indySdk: new IndySdkModule({ indySdk }),
            anoncredsRs: new AnonCredsRsModule({
                anoncreds
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
                        credentialFormats: [new LegacyIndyCredentialFormatService(), new AnonCredsCredentialFormatService()],
                    }),
                ],
            })
        },
    })

    agent.registerOutboundTransport(new HttpOutboundTransport())
    agent.registerOutboundTransport(new WsOutboundTransport())
    await agent.initialize()
    return agent
}

const createNewInvitation = async (agent) => {
    const outOfBandRecord = await agent.oob.createInvitation()

    return {
        invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: 'http://localhost:4555' }),
    }
}

const run = async () => {
    const aliceAgent = await initializeAliceAgent()
    await aliceAgent.modules.anoncreds.createLinkSecret({ setAsDefault: true })
    aliceAgent.events.on(BasicMessageEventTypes.BasicMessageStateChanged, async ({ payload }) => {
        console.log(payload.basicMessageRecord.content)
    })
    aliceAgent.events.on(ConnectionEventTypes.ConnectionStateChanged, ({ payload }) => {
        if (payload.connectionRecord.state === DidExchangeState.Completed) {
        }
    })
    aliceAgent.events.on(CredentialEventTypes.CredentialStateChanged, async ({ payload }) => {
        switch (payload.credentialRecord.state) {
            case CredentialState.OfferReceived:
                console.log("Received a credential")
                // custom logic here
                console.log(payload)
                await aliceAgent.credentials.acceptOffer({ credentialRecordId: payload.credentialRecord.id })
            case CredentialState.Done:
                console.log(`Credential for credential id ${payload.credentialRecord.id} is accepted`)
                process.exit(0)
        }
    })
    console.log(await createNewInvitation(aliceAgent))
}

void run()