import { CredentialEventTypes, CredentialState } from "@aries-framework/core"

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
    }

    return credentialDefinitionResult
}

export const propCred = async (agent, connectionId, credentialDefinitionId) => {
    const anonCredsCredentialExchangeRecord = await agent.credentials.proposeCredential({
        protocolVersion: 'v2',
        connectionId: connectionId,
        credentialFormats: {
            anoncreds: {
                credentialDefinitionId: credentialDefinitionId,
                attributes: [
                    { name: 'first_name', value: 'Jane' },
                    { name: 'last_name', value: 'Doe' }
                ],
            },
        },
    })

    return anonCredsCredentialExchangeRecord
}

export const offerCred = async (agent, connectionId, credentialDefinitionId, first_name, last_name) => {
    const anonCredsCredentialExchangeRecord = await agent.credentials.offerCredential({
        protocolVersion: 'v2',
        connectionId: connectionId,
        credentialFormats: {
            anoncreds: {
                credentialDefinitionId: credentialDefinitionId,
                attributes: [
                    { name: 'first_name', value: 'Jane' },
                    { name: 'last_name', value: 'Doe' }
                ],
            },
        },
    })

    return anonCredsCredentialExchangeRecord
}

export const acceptCred = async (agent, credentialRecordId, credentialDefinitionId) => {
    await agent.credentials.acceptProposal({
        credentialRecordId: credentialRecordId,
        credentialFormats: {
            anoncreds: {
                credentialDefinitionId: credentialDefinitionId,
                attributes: [
                    { name: 'name', value: 'Jane Doe' },
                ],
            },
        },
    })
}

export const registerCredentialEvent = (agent) => {
    agent.events.on(CredentialEventTypes.CredentialStateChanged, async ({ payload }) => {
        switch (payload.credentialRecord.state) {
            case CredentialState.ProposalReceived: {
                console.log(`Received a credential proposal ${payload.credentialRecord.id}`)
                await agent.credentials.acceptProposal({ credentialRecordId: payload.credentialRecord.id })
                break
            }
            case CredentialState.OfferReceived: {
                console.log(`Received a credential offer ${payload.credentialRecord.id}`)
                await agent.credentials.acceptOffer({ credentialRecordId: payload.credentialRecord.id })
                break
            }
            case CredentialState.RequestReceived: {
                console.log(`Received a credential request ${payload.credentialRecord.id}`)
                await agent.credentials.acceptRequest({ credentialRecordId: payload.credentialRecord.id })
                break
            }
            case CredentialState.CredentialReceived: {
                console.log(`Received a credential ${payload.credentialRecord.id}`)
                await agent.credentials.acceptCredential({ credentialRecordId: payload.credentialRecord.id })
                break
            }
            case CredentialState.Done: {
                console.log(`Credential for credential id ${payload.credentialRecord.id} is accepted`)
                break
            }
        }
    })
}