import {
  Agent,
  ConnectionEventTypes,
  WsOutboundTransport,
  HttpOutboundTransport,
  DidExchangeState,
  DidsModule,
  CredentialsModule,
  V2CredentialProtocol,
  BasicMessageEventTypes,
  CredentialEventTypes,
  CredentialState,
  ProofEventTypes,
  ProofState,
  MediationRecipientModule,
  PeerDidResolver,
  PeerDidRegistrar,
  KeyDidResolver,
  KeyDidRegistrar,
  ProofsModule,
  V2ProofProtocol,
  MediatorPickupStrategy,
  ConsoleLogger,
  LogLevel,
} from "@aries-framework/core";
import { agentDependencies, HttpInboundTransport } from "@aries-framework/node";
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
import { startServer } from "@aries-framework/rest";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
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

import { genesis } from "./bcovrin.js";

const mediatorInvitationUrl =
  "https://mediator.onrender.com/invitation?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiI3ZWZmMGU0MS05M2M1LTQyOGQtOGRkYS00ZTFlN2VlYmNhYzYiLCJsYWJlbCI6IkNsaWVudCBNZWRpYXRvciIsImFjY2VwdCI6WyJkaWRjb21tL2FpcDEiLCJkaWRjb21tL2FpcDI7ZW52PXJmYzE5Il0sImhhbmRzaGFrZV9wcm90b2NvbHMiOlsiaHR0cHM6Ly9kaWRjb21tLm9yZy9kaWRleGNoYW5nZS8xLjAiLCJodHRwczovL2RpZGNvbW0ub3JnL2Nvbm5lY3Rpb25zLzEuMCJdLCJzZXJ2aWNlcyI6W3siaWQiOiIjaW5saW5lLTAiLCJzZXJ2aWNlRW5kcG9pbnQiOiJodHRwczovL21lZGlhdG9yLm9ucmVuZGVyLmNvbSIsInR5cGUiOiJkaWQtY29tbXVuaWNhdGlvbiIsInJlY2lwaWVudEtleXMiOlsiZGlkOmtleTp6Nk1rdHRSa0NQTnc5bjlhc3g3cVluZmJkNmd5cWdDOGRaVGNHSjVEZ1F0Q1hBVkoiXSwicm91dGluZ0tleXMiOltdfSx7ImlkIjoiI2lubGluZS0xIiwic2VydmljZUVuZHBvaW50Ijoid3NzOi8vbWVkaWF0b3Iub25yZW5kZXIuY29tIiwidHlwZSI6ImRpZC1jb21tdW5pY2F0aW9uIiwicmVjaXBpZW50S2V5cyI6WyJkaWQ6a2V5Ono2TWt0dFJrQ1BOdzluOWFzeDdxWW5mYmQ2Z3lxZ0M4ZFpUY0dKNURnUXRDWEFWSiJdLCJyb3V0aW5nS2V5cyI6W119XX0";

const agentConfig = {
  label: "Student",
  walletConfig: {
    id: "teststudent",
    key: process.env.AGENT_WALLET_KEY || "teststudent",
  },
  logger: new ConsoleLogger(LogLevel.debug),
  endpoints: ["http://localhost:5002"],
};

const getAgent = async () => {
  const agent = new Agent({
    config: agentConfig,
    modules: {
      mediationRecipient: new MediationRecipientModule({
        mediatorInvitationUrl: mediatorInvitationUrl,
        mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
      }),
      indySdk: new IndySdkModule({
        indySdk,
        networks: [
          {
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

  agent.registerInboundTransport(new HttpInboundTransport({ port: 5002 }));

  agent.registerOutboundTransport(new HttpOutboundTransport());
  agent.registerOutboundTransport(new WsOutboundTransport());
  console.log("Config");
  await agent.initialize();
  return agent;
};

const run = async () => {
  console.log("Started");
  const steward = await getAgent();
  console.log("Agent");
  await steward.modules.anoncreds.createLinkSecret({ setAsDefault: true });
  steward.events.on(
    BasicMessageEventTypes.BasicMessageStateChanged,
    async ({ payload }) => {
      console.log(payload.basicMessageRecord.content);
    }
  );
  steward.events.on(
    ConnectionEventTypes.ConnectionStateChanged,
    async ({ payload }) => {
      switch (payload.connectionRecord.state) {
        case DidExchangeState.ResponseReceived: {
          console.log("Connection Responded");
          const connectionRecord = await acceptConnectionBack(
            steward,
            payload.connectionRecord.id
          );
          console.log(connectionRecord);
          break;
        }
        case DidExchangeState.RequestReceived: {
          console.log("Connection Requested");
          const connectionRecord = await acceptConnection(
            steward,
            payload.connectionRecord.id
          );
          console.log(connectionRecord);
          break;
        }
        case DidExchangeState.Completed: {
          console.log(`Connection completed`);
          await send(steward, payload.connectionRecord.id, "Hi Kya hal ba");
          break;
        }
      }
    }
  );
  steward.events.on(
    CredentialEventTypes.CredentialStateChanged,
    async ({ payload }) => {
      switch (payload.credentialRecord.state) {
        case CredentialState.ProposalReceived: {
          console.log(
            `Received a credential proposal ${payload.credentialRecord.id}`
          );
          await steward.credentials.acceptProposal({
            credentialRecordId: payload.credentialRecord.id,
          });
          break;
        }
        case CredentialState.OfferReceived: {
          console.log(
            `Received a credential offer ${payload.credentialRecord.id}`
          );
          await steward.credentials.acceptOffer({
            credentialRecordId: payload.credentialRecord.id,
          });
          break;
        }
        case CredentialState.RequestReceived: {
          console.log(
            `Received a credential request ${payload.credentialRecord.id}`
          );
          await steward.credentials.acceptRequest({
            credentialRecordId: payload.credentialRecord.id,
          });
          break;
        }
        case CredentialState.CredentialReceived: {
          console.log(`Received a credential ${payload.credentialRecord.id}`);
          await steward.credentials.acceptCredential({
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
  steward.events.on(ProofEventTypes.ProofStateChanged, async ({ payload }) => {
    switch (payload.proofRecord.state) {
      case ProofState.RequestReceived: {
        console.log("Proof Request");
        console.log(payload);
        break;
      }
      case ProofState.PresentationReceived: {
        console.log("Presentation Received");
        console.log(payload);
        break;
      }
      case ProofState.Done: {
        const formattedData = await steward.proofs.getFormatData(
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
  const app = express();
  app.use(cors());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(bodyParser.json());
  app.use((req, res, next) => {
    req.steward = steward;
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
  await startServer(steward, {
    app: app,
    port: 8000,
    cors: true,
  });
};

void run();
