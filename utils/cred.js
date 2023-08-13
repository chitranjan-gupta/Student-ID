export const pullSchema = async (agent, schemaId) => {
    const schemaResult = await agent.modules.anoncreds.getSchema(schemaId)
    return schemaResult
}
export const pushSchema = async (agent, did, schema) => {
    const schemaResult = await agent.modules.anoncreds.registerSchema({
        schema: {
            attrNames: ['name'],
            issuerId: did,
            name: 'Example Schema to register',
            version: '1.0.0',
        },
        options: {},
    })
    if (schemaResult.schemaState.state === 'failed') {
        throw new Error(`Error creating schema: ${schemaResult.schemaState.reason}`)
        return ""
    }
    return schemaResult
}
export const pullCredDef = async (agent, credentialDefinitionId) => {
    const credentialDefinitionResult = await agent.modules.anoncreds.getCredentialDefinition(credentialDefinitionId)
    return credentialDefinitionResult
}
export const pushCredDef = async (agent, did, schemaId) => {
    const credentialDefinitionResult = await agent.modules.anoncreds.registerCredentialDefinition({
        credentialDefinition: {
            tag: 'default',
            issuerId: did,
            schemaId: schemaId
        },
        options: {},
    })

    if (credentialDefinitionResult.credentialDefinitionState.state === 'failed') {
        throw new Error(
            `Error creating credential definition: ${credentialDefinitionResult.credentialDefinitionState.reason}`
        )
        return ""
    }
    return credentialDefinitionResult
}
export const offerCred = async (agent, connectionId, credentialDefinitionId) => {
    const anonCredsCredentialExchangeRecord = await agent.credentials.offerCredential({
        protocolVersion: 'v2',
        connectionId: connectionId,
        credentialFormats: {
            anoncreds: {
                credentialDefinitionId: credentialDefinitionId,
                attributes: [
                    { name: 'name', value: 'Jane Doe' },
                ],
            },
        },
    })
    return anonCredsCredentialExchangeRecord
}
export const pullLinkSecret = async (agent) => {
    const linkSecret = await agent.modules.anoncreds.getLinkSecretIds();
    return linkSecret
}