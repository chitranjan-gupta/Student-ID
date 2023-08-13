export const acceptConnection = async (agent, connectionId) => {
    const connectionRecord = await agent.connections.acceptRequest(connectionId);
    return connectionRecord
}

export const acceptConnectionBack = async (agent, connectionId) => {
    const connectionRecord = await agent.connections.acceptResponse(connectionId);
    return connectionRecord
}