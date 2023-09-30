import { ConnectionEventTypes, DidExchangeState } from "@aries-framework/core"

import { sendMessage } from "./message";

export const acceptConnection = async (agent, connectionId) => {
    const connectionRecord = await agent.connections.acceptRequest(connectionId);
    return connectionRecord
}

export const acceptConnectionBack = async (agent, connectionId) => {
    const connectionRecord = await agent.connections.acceptResponse(connectionId);
    return connectionRecord
}

export const registerConnectionEvent = (agent) => {
    agent.events.on(ConnectionEventTypes.ConnectionStateChanged, async ({ payload }) => {
        switch (payload.connectionRecord.state) {
            case DidExchangeState.ResponseReceived: {
                console.log("Connection Responded")
                const connectionRecord = await acceptConnectionBack(agent, payload.connectionRecord.id);
                console.log(connectionRecord)
                break
            }
            case DidExchangeState.RequestReceived: {
                console.log("Connection Requested")
                const connectionRecord = await acceptConnection(agent, payload.connectionRecord.id);
                console.log(connectionRecord)
                break
            }
            case DidExchangeState.Completed: {
                console.log(`Connection completed`)
                await sendMessage(agent, payload.connectionRecord.id, "Hi Kya hal ba")
                break
            }
        }
    })
}