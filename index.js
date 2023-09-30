import {
  Agent,
  ConnectionEventTypes,
  WsOutboundTransport,
  HttpOutboundTransport,
  DidExchangeState,
  DidsModule,
  TypedArrayEncoder,
  CredentialsModule,
  V2CredentialProtocol,
  BasicMessageEventTypes,
  CredentialEventTypes,
  CredentialState,
  KeyType,
  ProofsModule,
  V2ProofProtocol,
  ProofEventTypes,
  ProofState,
  KeyDidRegistrar,
  KeyDidResolver,
  PeerDidResolver,
  PeerDidRegistrar,
  ConsoleLogger,
  LogLevel,
} from "@aries-framework/core";
import {
  agentDependencies,
  HttpInboundTransport,
  WsInboundTransport,
} from "@aries-framework/node";
import {
  IndySdkModule,
  IndySdkAnonCredsRegistry,
  IndySdkIndyDidRegistrar,
  IndySdkIndyDidResolver,
} from "@aries-framework/indy-sdk";
import indySdk from "indy-sdk";
import { anoncreds } from "@hyperledger/anoncreds-nodejs";
import {
  AnonCredsModule,
  AnonCredsCredentialFormatService,
  AnonCredsProofFormatService,
} from "@aries-framework/anoncreds";
import { AnonCredsRsModule } from "@aries-framework/anoncreds-rs";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { WebSocketServer } from "ws";

import oobs from "./routes/oobs.js";
import credential from "./routes/credential.js";
import schema from "./routes/schema.js";
import credentialDef from "./routes/credential-def.js";
import connection from "./routes/connection.js";
import did from "./routes/did.js";
import message from "./routes/message.js";
import proof from "./routes/proof.js";
import { acceptConnection, acceptConnectionBack } from "./utils/request.js";
import { send } from "./utils/chat.js";
import { pullLinkSecret, pushLinkSecret } from "./utils/cred.js";
import { port, frontpoint } from "./utils/config.js";

import { genesis } from "./bcovrin.js";

const stewardseed = "0000000000000000000000000Roshan1";
const seed = TypedArrayEncoder.fromString(stewardseed); // What you input on bcovrin. Should be kept secure in production!
const unqualifiedIndyDid = `DxRyhqooU79KcCYpMDcPkP`; // will be returned after registering seed on bcovrin
const indyDid = `did:indy:bcovrin:test:${unqualifiedIndyDid}`; //did:indy:bcovrin:test:DxRyhqooU79KcCYpMDcPkP

const endpoints = [
  frontpoint,
  process.env.URL ? `wss://${process.env.URL}` : `ws://localhost:${port}`,
];
const defaultSecretId = "myLinkId";
const config = {
  label: "College",
  walletConfig: {
    id: "testcollege",
    key: process.env.AGENT_WALLET_KEY || "testcollege",
  },
  logger: new ConsoleLogger(LogLevel.error),
  endpoints,
};

class Container {
  constructor() {
    this.dependencies = {};
  }
  register(name, dependency) {
    this.dependencies[name] = dependency;
  }
  get(name) {
    if (!this.dependencies[name]) {
      throw new Error(`Dependency ${name} is not registered`);
    }
    return this.dependencies[name];
  }
}

const getExpress = (container) => {
  const app = express();
  app.use(cors());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(bodyParser.json());
  app.get("/ping", (req, res) => {
    res.send("pong");
  });
  app.use((req, res, next) => {
    req.container = container;
    next();
  });
  app.use("/oobs", oobs);
  app.use("/credential", credential);
  app.use("/schema", schema);
  app.use("/credential-def", credentialDef);
  app.use("/did", did);
  app.use("/message", message);
  app.use("/proof", proof);
  app.use("/connection", connection);
  return app;
};

const getAgent = async (socketServer, app) => {
  const agent = new Agent({
    config,
    modules: {
      indySdk: new IndySdkModule({
        indySdk,
        networks: [
          {
            id: "bcovrin-test-net",
            isProduction: false,
            indyNamespace: "bcovrin:test",
            genesisTransactions: genesis,
            connectOnStartup: true,
          },
        ],
      }),
      anoncredsRs: new AnonCredsRsModule({
        anoncreds,
      }),
      anoncreds: new AnonCredsModule({
        registries: [new IndySdkAnonCredsRegistry()],
      }),
      dids: new DidsModule({
        registrars: [
          new IndySdkIndyDidRegistrar(),
          new PeerDidRegistrar(),
          new KeyDidRegistrar(),
        ],
        resolvers: [
          new IndySdkIndyDidResolver(),
          new PeerDidResolver(),
          new KeyDidResolver(),
        ],
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
            proofFormats: [new AnonCredsProofFormatService()],
          }),
        ],
      }),
    },
    dependencies: agentDependencies,
  });
  const httpInboundTransport = new HttpInboundTransport({ app, port });
  agent.registerInboundTransport(httpInboundTransport);
  agent.registerInboundTransport(
    new WsInboundTransport({ server: socketServer })
  );
  agent.registerOutboundTransport(new HttpOutboundTransport());
  agent.registerOutboundTransport(new WsOutboundTransport());
  await agent.initialize();
  return { agent, httpInboundTransport };
};

const run = async () => {
  const container = new Container();
  const socketServer = new WebSocketServer({ noServer: true });
  const app = getExpress(container);
  const { agent, httpInboundTransport } = await getAgent(socketServer, app);
  await agent.dids.import({
    did: indyDid,
    overwrite: true,
    privateKeys: [
      {
        privateKey: seed,
        keyType: KeyType.Ed25519,
      },
    ],
  });
  const secretIds = await pullLinkSecret(agent);
  if (!secretIds.includes(defaultSecretId)) {
    await pushLinkSecret(agent, defaultSecretId);
  }
  container.register("agent", agent);
  httpInboundTransport.server?.on("upgrade", (request, socket, head) => {
    socketServer.handleUpgrade(request, socket, head, (ws) => {
      socketServer.emit("connection", ws, request);
    });
  });
  agent.events.on(
    BasicMessageEventTypes.BasicMessageStateChanged,
    async ({ payload }) => {
      console.log(payload.basicMessageRecord.content);
    }
  );
  agent.events.on(
    ConnectionEventTypes.ConnectionStateChanged,
    async ({ payload }) => {
      switch (payload.connectionRecord.state) {
        case DidExchangeState.ResponseReceived: {
          const connectionRecord = await acceptConnectionBack(
            agent,
            payload.connectionRecord.id
          );
          console.log("Connection Responded");
          console.log(connectionRecord);
          break;
        }
        case DidExchangeState.RequestReceived: {
          const connectionRecord = await acceptConnection(
            agent,
            payload.connectionRecord.id
          );
          console.log("Connection Requested");
          console.log(connectionRecord);
          break;
        }
        case DidExchangeState.Completed: {
          console.log(`Connection completed`);
          await send(agent, payload.connectionRecord.id, "Hi Kya hal ba");
          break;
        }
      }
    }
  );
  agent.events.on(
    CredentialEventTypes.CredentialStateChanged,
    async ({ payload }) => {
      switch (payload.credentialRecord.state) {
        case CredentialState.ProposalReceived: {
          console.log(
            `Received a credential proposal ${payload.credentialRecord.id}`
          );
          break;
        }
        case CredentialState.OfferReceived: {
          console.log(
            `Received a credential offer ${payload.credentialRecord.id}`
          );
          await agent.credentials.acceptOffer({
            credentialRecordId: payload.credentialRecord.id,
          });
          break;
        }
        case CredentialState.RequestReceived: {
          console.log(
            `Received a credential request ${payload.credentialRecord.id}`
          );
          await agent.credentials.acceptRequest({
            credentialRecordId: payload.credentialRecord.id,
          });
          break;
        }
        case CredentialState.CredentialReceived: {
          console.log(`Received a credential ${payload.credentialRecord.id}`);
          await agent.credentials.acceptCredential({
            credentialRecordId: payload.credentialRecord.id,
          });
          break;
        }
        case CredentialState.Done: {
          console.log(
            `Credential for credential id ${payload.credentialRecord.id} is accepted`
          );
          break;
        }
      }
    }
  );
  agent.events.on(ProofEventTypes.ProofStateChanged, async ({ payload }) => {
    switch (payload.proofRecord.state) {
      case ProofState.PresentationReceived: {
        console.log("Presentation Received");
        console.log(payload);
        break;
      }
      case ProofState.Done: {
        const formattedData = await agent.proofs.getFormatData(
          payload.proofRecord.id
        );
        const items = Object.entries(
          formattedData.presentation?.anoncreds.requested_proof
            .revealed_attr_groups.identity.values
        );
        console.log("============= Presentation ==============");
        items.forEach(([key, { raw }]) => {
          console.log(`- ${key}: ${raw}`);
        });
        console.log("=========================================");
        break;
      }
    }
  });
};

void run();
