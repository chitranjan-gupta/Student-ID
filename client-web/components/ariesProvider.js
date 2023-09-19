import {
    Agent,
    AutoAcceptCredential,
    AutoAcceptProof,
    BasicMessageEventTypes,
    BasicMessageStateChangedEvent,
    ConnectionsModule,
    ConsoleLogger,
    CredentialsModule,
    DidsModule,
    InitConfig,
    KeyDidResolver,
    LogLevel,
    MediationRecipientModule,
    PeerDidResolver,
    ProofsModule,
    V2CredentialProtocol,
    V2ProofProtocol,
    WsOutboundTransport,
} from "@aries-framework/core"
import {
    AnonCredsCredentialFormatService,
    AnonCredsProofFormatService
} from "@aries-framework/anoncreds"
import AgentProvider from "@aries-framework/react-hooks"
import { createContext, useCallback, useContext, useState } from "react"
const AriesProvider = ({ children }) => {
    const mediatorInvitationUrl = ""
    const initializeAgent = useCallback(async (agentId, agentLabel, agentKey) => {
        const config = {
            label: agentLabel,
            walletConfig: {
                id: agentId,
                key: agentKey
            },
            logger: new ConsoleLogger(LogLevel.trace),
        }
        const agent = new Agent({
            config,
            modules: {
                connections: new ConnectionsModule({
                    autoAcceptConnections: true,
                }),
                dids: new DidsModule({
                    resolvers: [new PeerDidResolver(), new KeyDidResolver()],
                }),
                credentials: new CredentialsModule({
                    autoAcceptCredentials: AutoAcceptCredential.Always,
                    credentialProtocols: [
                        new V2CredentialProtocol({
                            credentialFormats: [new AnonCredsCredentialFormatService()],
                        }),
                    ],
                }),

                proofs: new ProofsModule({
                    autoAcceptProofs: AutoAcceptProof.Always,
                    proofProtocols: [
                        new V2ProofProtocol({
                            proofFormats: [new AnonCredsProofFormatService()],
                        }),
                    ],
                }),
                mediationRecipient: new MediationRecipientModule({
                    mediatorInvitationUrl,
                }),
                wallet: new BrowserWalletModule({}),
            }
        })
    })
}