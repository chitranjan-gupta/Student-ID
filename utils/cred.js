const schemaResult = await acmeAgent.modules.anoncreds.registerSchema({
    schema: {
        attrNames: ['name'],
        issuerId: indyDid,
        name: 'Example Schema to register',
        version: '1.0.0',
    },
    options: {},
})
console.log(schemaResult)
if (schemaResult.schemaState.state === 'failed') {
    throw new Error(`Error creating schema: ${schemaResult.schemaState.reason}`)
}
const credentialDefinitionResult = await acmeAgent.modules.anoncreds.registerCredentialDefinition({
    credentialDefinition: {
        tag: 'default',
        issuerId: indyDid,
        schemaId: schemaResult.schemaState.schemaId
    },
    options: {},
})

if (credentialDefinitionResult.credentialDefinitionState.state === 'failed') {
    throw new Error(
        `Error creating credential definition: ${credentialDefinitionResult.credentialDefinitionState.reason}`
    )
}
console.log(credentialDefinitionResult)
const anonCredsCredentialExchangeRecord = await steward.credentials.offerCredential({
    protocolVersion: 'v2',
    connectionId: payload.connectionRecord.id,
    credentialFormats: {
        anoncreds: {
            credentialDefinitionId: 'did:indy:bcovrin:test:DxRyhqooU79KcCYpMDcPkP/anoncreds/v0/CLAIM_DEF/12642/default',//credentialDefinitionResult.credentialDefinitionState.credentialDefinitionId
            attributes: [
                { name: 'name', value: 'Jane Doe' },
            ],
        },
    },
})