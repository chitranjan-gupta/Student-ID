export const createNewInvitation = async (agent) => {
    const outOfBandRecord = await agent.oob.createInvitation()

    return {
        invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: 'http://localhost:5001' }),
        outOfBandRecord,
    }
}

export const acceptInvitation = async (agent, outOfBandId) => {
    const returns = await agent.oob.acceptInvitation(outOfBandId, {
        "autoAcceptConnection": true,
    })
    console.log(returns)
    return {
        outOfBandRecord: returns.outOfBandRecord,
        connectionRecord: returns.connectionRecord
    }
}

export const receiveInvitation = async (agent, invitationUrl) => {
    const { outOfBandRecord } = await agent.oob.receiveInvitationFromUrl(invitationUrl)

    return outOfBandRecord
}