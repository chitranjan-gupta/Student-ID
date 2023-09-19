export const createNewInvitation = async (agent) => {
    const frontpoint = process.env.URL ? process.env.URL : `http://0.0.0.0:5000`
    const outOfBandRecord = await agent.oob.createInvitation()

    return {
        invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: frontpoint }),
        outOfBandRecord,
    }
}

export const acceptInvitation = async (agent, outOfBandId) => {
    const { outOfBandRecord, connectionRecord } = await agent.oob.acceptInvitation(outOfBandId, {
        "autoAcceptConnection": true,
    })
    return {
        outOfBandRecord,
        connectionRecord
    }
}

export const receiveInvitation = async (agent, invitationUrl) => {
    const { outOfBandRecord } = await agent.oob.receiveInvitationFromUrl(invitationUrl)

    return outOfBandRecord
}