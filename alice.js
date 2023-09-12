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
import { agentDependencies } from '@aries-framework/node'
import { IndySdkModule, IndySdkAnonCredsRegistry, IndySdkIndyDidRegistrar, IndySdkIndyDidResolver } from '@aries-framework/indy-sdk'
import indySdk from 'indy-sdk'
import { anoncreds } from '@hyperledger/anoncreds-nodejs'
import { AnonCredsModule, LegacyIndyCredentialFormatService, AnonCredsCredentialFormatService } from '@aries-framework/anoncreds'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'

// paste your invitation url here
const mediatorInvitationUrl = ""

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
    })

    agent.registerOutboundTransport(new HttpOutboundTransport())
    agent.registerOutboundTransport(new WsOutboundTransport())

    await agent.initialize()
    return agent
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
}

void run()