import { createContext, useCallback, useContext, useState } from "react";
import { initializeClient } from "./agent";
import { registerConnectionEvent } from "./connection";
import { registerMessageEvent } from "./message";

// Create a new context for Aries
const AriesContext = createContext({
  agent: undefined,
  setAgent: () => {},
  initializeAgent: () => Promise.resolve(),
});

const useAries = () => {
  const ariesContext = useContext(AriesContext);
  if (ariesContext === undefined) {
    throw new Error("useAries must be used within a AriesProvider");
  }
  return ariesContext;
};

const AriesProvider = ({ children }) => {
  const [agent, setAgent] = useState(undefined);
  const initializeAgent = useCallback(async () => {
    const ariesAgent = await initializeClient();
    const defaultSecretId = "myLinkId";
    const secretIds = await ariesAgent.modules.anoncreds.getLinkSecretIds();
    if (!secretIds.includes(defaultSecretId)) {
      await ariesAgent.modules.anoncreds.createLinkSecret({
        linkSecretId: defaultSecretId,
        setAsDefault: true,
      });
    }
    registerMessageEvent(ariesAgent);
    registerConnectionEvent(ariesAgent);
    setAgent(ariesAgent);
  }, [setAgent]);
  // Provide the AriesContext value to its children
  return (
    <AriesContext.Provider value={{ agent, setAgent, initializeAgent }}>
      {children}
    </AriesContext.Provider>
  );
};

export { AriesProvider, useAries };
