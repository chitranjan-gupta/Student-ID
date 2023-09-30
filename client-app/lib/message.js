import {
  BasicMessageEventTypes,
  BasicMessageRole,
} from "@aries-framework/core";

export const sendMessage = async (agent, connectionId, chat) => {
  const basicMessageRecord = await agent.basicMessages.sendMessage(
    connectionId,
    chat
  );
  return basicMessageRecord;
};

export const registerMessageEvent = (agent) => {
  agent.events.on(
    BasicMessageEventTypes.BasicMessageStateChanged,
    async ({ payload }) => {
      switch (payload.basicMessageRecord.role) {
        case BasicMessageRole.Receiver: {
          console.log(payload.basicMessageRecord.content);
          break;
        }
        case BasicMessageRole.Sender: {
          break;
        }
      }
    }
  );
};
