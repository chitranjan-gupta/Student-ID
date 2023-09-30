export const send = async (agent, connectionId, chat) => {
  const basicMessageRecord = await agent.basicMessages.sendMessage(
    connectionId,
    chat
  );
  return basicMessageRecord;
};
