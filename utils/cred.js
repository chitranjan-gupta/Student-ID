export const pullSchema = async (agent, schemaId) => {
  const schemaResult = await agent.modules.anoncreds.getSchema(schemaId);
  return schemaResult;
};
export const pushSchema = async (agent, did, schema) => {
  const schemaResult = await agent.modules.anoncreds.registerSchema({
    schema: {
      attrNames: ["first_name", "last_name"],
      issuerId: did,
      name: "Test Schema to register",
      version: "1.0.0",
    },
    options: {},
  });
  if (schemaResult.schemaState.state === "failed") {
    throw new Error(
      `Error creating schema: ${schemaResult.schemaState.reason}`
    );
    return "Error";
  }
  return schemaResult;
};
export const pullCredDef = async (agent, credentialDefinitionId) => {
  const credentialDefinitionResult =
    await agent.modules.anoncreds.getCredentialDefinition(
      credentialDefinitionId
    );
  return credentialDefinitionResult;
};
export const pushCredDef = async (agent, did, schemaId) => {
  const credentialDefinitionResult =
    await agent.modules.anoncreds.registerCredentialDefinition({
      credentialDefinition: {
        tag: "default",
        issuerId: did,
        schemaId: schemaId,
      },
      options: {},
    });

  if (credentialDefinitionResult.credentialDefinitionState.state === "failed") {
    throw new Error(
      `Error creating credential definition: ${credentialDefinitionResult.credentialDefinitionState.reason}`
    );
    return "Error";
  }
  return credentialDefinitionResult;
};
export const propCred = async (agent, connectionId, credentialDefinitionId) => {
  const anonCredsCredentialExchangeRecord =
    await agent.credentials.proposeCredential({
      protocolVersion: "v2",
      connectionId: connectionId,
      credentialFormats: {
        anoncreds: {
          credentialDefinitionId: credentialDefinitionId,
          attributes: [
            { name: "first_name", value: "Jane" },
            { name: "last_name", value: "Doe" },
          ],
        },
      },
    });
  return anonCredsCredentialExchangeRecord;
};
export const offerCred = async (
  agent,
  connectionId,
  credentialDefinitionId,
  first_name,
  last_name
) => {
  const anonCredsCredentialExchangeRecord =
    await agent.credentials.offerCredential({
      protocolVersion: "v2",
      connectionId: connectionId,
      credentialFormats: {
        anoncreds: {
          credentialDefinitionId: credentialDefinitionId,
          attributes: [
            { name: "first_name", value: "Jane" },
            { name: "last_name", value: "Doe" },
          ],
        },
      },
    });
  return anonCredsCredentialExchangeRecord;
};
export const acceptCred = async (
  agent,
  credentialRecordId,
  credentialDefinitionId
) => {
  await agent.credentials.acceptProposal({
    credentialRecordId: credentialRecordId,
    credentialFormats: {
      anoncreds: {
        credentialDefinitionId: credentialDefinitionId,
        attributes: [{ name: "name", value: "Jane Doe" }],
      },
    },
  });
};
export const pullLinkSecret = async (agent) => {
  const linkSecret = await agent.modules.anoncreds.getLinkSecretIds();
  return linkSecret;
};

export const pushLinkSecret = async (agent, defaultSecretId) => {
  await agent.modules.anoncreds.createLinkSecret({
    linkSecretId: defaultSecretId,
    setAsDefault: true,
  });
};

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
