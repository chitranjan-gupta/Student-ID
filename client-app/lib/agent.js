import {
    Agent, DidsModule, CredentialsModule, ProofsModule, V2CredentialProtocol, V2ProofProtocol, WsOutboundTransport,
    HttpOutboundTransport, MediationRecipientModule, PeerDidResolver, PeerDidRegistrar, KeyDidResolver, KeyDidRegistrar,
    MediatorPickupStrategy, ConsoleLogger, LogLevel
} from '@aries-framework/core'
import { agentDependencies } from '@aries-framework/react-native'
import { IndySdkModule, IndySdkAnonCredsRegistry, IndySdkIndyDidRegistrar, IndySdkIndyDidResolver } from '@aries-framework/indy-sdk'
import indySdk from 'indy-sdk-react-native'
import { anoncreds } from '@hyperledger/anoncreds-react-native'
import { AnonCredsModule, AnonCredsCredentialFormatService, AnonCredsProofFormatService } from '@aries-framework/anoncreds'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'

import { genesis } from "./bcovrin.js"

export const initializeClient = async () => {
    console.log(process.env.EXPO_PUBLIC_MEDIATOR_URL)
    const mediatorInvitationUrl = String("https://mediator.onrender.com/invitation?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiI0NDM2Y2JjMC01YTQzLTQ2ZjUtODA3ZS02MmU3NTBiYWY0Y2YiLCJsYWJlbCI6IkNsaWVudCBNZWRpYXRvciIsImFjY2VwdCI6WyJkaWRjb21tL2FpcDEiLCJkaWRjb21tL2FpcDI7ZW52PXJmYzE5Il0sImhhbmRzaGFrZV9wcm90b2NvbHMiOlsiaHR0cHM6Ly9kaWRjb21tLm9yZy9kaWRleGNoYW5nZS8xLjAiLCJodHRwczovL2RpZGNvbW0ub3JnL2Nvbm5lY3Rpb25zLzEuMCJdLCJzZXJ2aWNlcyI6W3siaWQiOiIjaW5saW5lLTAiLCJzZXJ2aWNlRW5kcG9pbnQiOiJodHRwOi8vbG9jYWxob3N0OjEwMDAwIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWtyQXE4cGszMW5MTnBKdThBUnRBOHhqOUozcjYxZGVFZm1FWGlXVnE3djFjQiJdLCJyb3V0aW5nS2V5cyI6W119LHsiaWQiOiIjaW5saW5lLTEiLCJzZXJ2aWNlRW5kcG9pbnQiOiJ3czovL2xvY2FsaG9zdDoxMDAwMCIsInR5cGUiOiJkaWQtY29tbXVuaWNhdGlvbiIsInJlY2lwaWVudEtleXMiOlsiZGlkOmtleTp6Nk1rckFxOHBrMzFuTE5wSnU4QVJ0QTh4ajlKM3I2MWRlRWZtRVhpV1ZxN3YxY0IiXSwicm91dGluZ0tleXMiOltdfV19")
    const config = {
        label: 'client-app',
        walletConfig: {
            id: 'wallet-id',
            key: 'testkey0000000000000000000000000',
        },
        logger: new ConsoleLogger(LogLevel.info),
    };
    const agent = new Agent({
        config,
        modules: {
            mediationRecipient: new MediationRecipientModule({
                mediatorInvitationUrl:mediatorInvitationUrl,
                mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
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