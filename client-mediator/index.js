/**
 * The mediator supports both
 * HTTP and WebSockets for communication and will automatically accept
 * incoming mediation requests.
 *
 * You can get an invitation by going to '/invitation', which by default is
 * http://localhost:3001/invitation
 *
 * To connect to the mediator from another agent, you can set the
 * 'mediatorConnectionsInvite' parameter in the agent config to the
 * url that is returned by the '/invitation/ endpoint. This will connect
 * to the mediator, request mediation and set the mediator as default.
 */
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import {
  ConnectionsModule,
  MediatorModule,
  HttpOutboundTransport,
  Agent,
  ConnectionInvitationMessage,
  WsOutboundTransport,
} from "@aries-framework/core";
import {
  HttpInboundTransport,
  agentDependencies,
  WsInboundTransport,
} from "@aries-framework/node";
import indySdk from "indy-sdk";
import { IndySdkModule } from "@aries-framework/indy-sdk";

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const endpoints = [`http://localhost:${port}`, `ws://localhost:${port}`];
const frontpoint = process.env.URL ? process.env.URL : "http://0.0.0.0:3001";
const agentConfig = {
  label: process.env.AGENT_LABEL || "Client Mediator",
  walletConfig: {
    id: process.env.WALLET_NAME || "clientmediator",
    key: process.env.WALLET_KEY || "clientmediator",
  },
  endpoints,
};

const run = async () => {
  // We create our own instance of express here.
  // which allows use to use the same server (and port) for both WebSockets and HTTP
  const app = express();
  app.use(cors());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(bodyParser.json());
  const socketServer = new WebSocketServer({ noServer: true });

  // Set up agent
  const agent = new Agent({
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
  });

  app.get("/ping", async (req, res) => {
    res.send("pong");
  });

  // Allow to create invitation, no other way to ask for invitation yet
  app.get("/invitation", async (req, res) => {
    if (typeof req.query.c_i === "string") {
      const invitation = ConnectionInvitationMessage.fromUrl(req.url);
      res.json(invitation.toJSON());
    } else {
      const { outOfBandInvitation } = await agent.oob.createInvitation({
        multiUseInvitation: true,
      });
      res.json({
        invitationUrl: outOfBandInvitation.toUrl({
          domain: frontpoint + "/invitation",
        }),
      });
    }
  });

  // Create all transports
  const httpInboundTransport = new HttpInboundTransport({ app, port });
  const httpOutboundTransport = new HttpOutboundTransport();
  const wsInboundTransport = new WsInboundTransport({ server: socketServer });
  const wsOutboundTransport = new WsOutboundTransport();

  // Register all Transports
  agent.registerInboundTransport(httpInboundTransport);
  agent.registerOutboundTransport(httpOutboundTransport);
  agent.registerInboundTransport(wsInboundTransport);
  agent.registerOutboundTransport(wsOutboundTransport);

  // When an 'upgrade' to WS is made on our http server, we forward the
  // request to the WS server
  httpInboundTransport.server?.on("upgrade", (request, socket, head) => {
    socketServer.handleUpgrade(request, socket, head, (ws) => {
      socketServer.emit("connection", ws, request);
    });
  });

  //Initialize the agent
  await agent.initialize();
};

void run();
