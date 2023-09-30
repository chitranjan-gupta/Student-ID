import { Router } from "express";
import { pullCredDef, pushCredDef } from "../utils/cred.js";

const router = Router();

router.get("/", async (req, res) => {
  const agent = req.container.get("agent");
  const json = req.body;
  const credentialDefinitionResult = await pullCredDef(
    agent,
    json.credentialDefinitionId
  );
  res.json({ credentialDefinitionResult });
});

router.post("/", async (req, res) => {
  const agent = req.container.get("agent");
  const json = req.body;
  const credentialDefinitionResult = await pushCredDef(
    agent,
    json.did,
    json.schemaId
  );
  res.json({ credentialDefinitionResult });
});

export default router;
