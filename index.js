import {
    AutoAcceptProof,
    Agent,
    AutoAcceptCredential,
    HttpOutboundTransport,
    WsOutboundTransport,
} from '@aries-framework/core'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import { IndySdkModule } from '@aries-framework/indy-sdk'
import indySdk from 'indy-sdk'
import { startServer } from '@aries-framework/rest'

import { genesis } from "./bcovrin.js"

const run = async () => {
    const config = {
        label: 'Student',
        walletConfig: {
            id: 'teststudent',
            key: process.env.AGENT_WALLET_KEY || 'teststudent',
        },
        endpoints: ["http://localhost:5001"],
    }

    const agent = new Agent({
        config,
        modules:{
            indySdk: new IndySdkModule({
                indySdk
            }),
        },
        autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
        autoAcceptProofs: AutoAcceptProof.ContentApproved,
        dependencies: agentDependencies
    })

    const httpInbound = new HttpInboundTransport({
        port: 5001,
    })

    agent.registerInboundTransport(httpInbound)

    agent.registerOutboundTransport(new HttpOutboundTransport())
    agent.registerOutboundTransport(new WsOutboundTransport())

    await agent.initialize()

    await startServer(agent, {
        port: 5000,
    })
}

run()