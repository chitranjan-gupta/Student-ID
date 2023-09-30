import { ProofEventTypes, ProofState } from "@aries-framework/core";

export const reqProof = async (agent, connectionId) => {
  await agent.proofs.requestProof({
    connectionId,
    protocolVersion: "v2",
    proofFormats: {
      anoncreds: {
        requested_attributes: {
          identity: { names: ["name"] },
        },
        name: "Signup",
        version: "2",
      },
    },
  });
};

export const acceptProof = async (agent, proofRecordId) => {
  await agent.proofs.acceptRequest({ proofRecordId });
};

export const registerProofEvent = (agent) => {
  agent.events.on(ProofEventTypes.ProofStateChanged, async ({ payload }) => {
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
        const formattedData = await agent.proofs.getFormatData(
          payload.proofRecord.id
        );
        const items = Object.entries(
          formattedData.presentation?.anoncreds.requested_proof
            .revealed_attr_groups.identity.values
        );
        items.forEach(([key, { raw }]) => {
          console.log(`- ${key}: ${raw}`);
        });
        break;
      }
    }
  });
};
