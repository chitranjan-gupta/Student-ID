export const pullSchema = async (agent, schemaId) => {
    const schemaResult = await agent.modules.anoncreds.getSchema(schemaId)
    return schemaResult
}
export const pushSchema = async (agent, did, schema) => {
    const schemaResult = await agent.modules.anoncreds.registerSchema({
        schema: {
            attrNames: ['first_name', 'last_name'],
            issuerId: did,
            name: 'Test Schema to register',
            version: '1.0.0',
        },
        options: {},
    })

    if (schemaResult.schemaState.state === 'failed') {
        throw new Error(`Error creating schema: ${schemaResult.schemaState.reason}`)
    }

    return schemaResult
}

export const pullLinkSecret = async (agent) => {
    const linkSecret = await agent.modules.anoncreds.getLinkSecretIds();
    return linkSecret
}

export const pushLinkSecret = async (agent, defaultSecretId) => {
    await agent.modules.anoncreds.createLinkSecret({
        linkSecretId: defaultSecretId,
        setAsDefault: true,
    });
}