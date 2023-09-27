import {
    Agent, DidsModule, CredentialsModule, ProofsModule, V2CredentialProtocol, V2ProofProtocol, WsOutboundTransport,
    HttpOutboundTransport, MediationRecipientModule, PeerDidResolver, PeerDidRegistrar, KeyDidResolver, KeyDidRegistrar
} from '@aries-framework/core'
import { agentDependencies } from '@aries-framework/react-native'
import { IndySdkModule, IndySdkAnonCredsRegistry, IndySdkIndyDidRegistrar, IndySdkIndyDidResolver } from '@aries-framework/indy-sdk'
import indySdk from 'indy-sdk-react-native'
import { anoncreds } from '@hyperledger/anoncreds-react-native'
import { AnonCredsModule, AnonCredsCredentialFormatService, AnonCredsProofFormatService } from '@aries-framework/anoncreds'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'

import { genesis } from "./bcovrin.js"

export const initializeClient = async () => {
    const mediatorInvitationUrl = String(process.env.EXPO_PUBLIC_MEDIATOR_URL)
    const config = {
        label: 'client-app',
        walletConfig: {
            id: 'wallet-id',
            key: 'testkey0000000000000000000000000',
        },
    };
    const agent = new Agent({
        config,
        modules: {
            mediationRecipient: new MediationRecipientModule({
                mediatorInvitationUrl
            }),
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
                registrars: [new IndySdkIndyDidRegistrar(), new PeerDidRegistrar(), new KeyDidRegistrar()],
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
    agent.registerOutboundTransport(new HttpOutboundTransport())
    agent.registerOutboundTransport(new WsOutboundTransport())

    await agent.initialize()
    return agent
}