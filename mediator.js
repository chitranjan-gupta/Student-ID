import {
    Agent,
    HttpOutboundTransport,
    ConnectionsModule,
    MediatorModule
} from '@aries-framework/core'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import { IndySdkModule } from '@aries-framework/indy-sdk'
import indySdk from 'indy-sdk'

const Name = 'mediator'
const port = 3001

const agentConfig = {
  label: `Aries Framework JavaScript ${Name}`,
  walletConfig: {
    id: Name,
    key: Name,
  },
  endpoints: [`http://localhost:${port}`],
}

const mediator = new Agent({
  config: agentConfig,
  dependencies: agentDependencies,
  modules: {
    indySdk: new IndySdkModule({ indySdk }),
    mediator: new MediatorModule({
      autoAcceptMediationRequests: true,
    }),
    connections: new ConnectionsModule({
      autoAcceptConnections: true,
    }),
  },
})

mediator.registerOutboundTransport(new HttpOutboundTransport())
mediator.registerInboundTransport(new HttpInboundTransport({ port }))

await mediator.initialize()
const mediatorOutOfBandRecord = await mediator.oob.createInvitation({ multiUseInvitation: true })

const mediatiorInvitationUrl = mediatorOutOfBandRecord.outOfBandInvitation.toUrl({
  domain: `http://localhost:${port}`,
})
console.log(mediatiorInvitationUrl)