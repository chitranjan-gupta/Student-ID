import { Router } from "express";
import { pullSchema, pushSchema } from "../utils/cred.js";

const router = Router();

router.get("/", async (req, res) => {
  const agent = req.container.get("agent");
  const json = req.body;
  const schemaResult = await pullSchema(agent, json.schemaId);
  res.json({ schemaResult });
});

router.post("/", async (req, res) => {
  const agent = req.container.get("agent");
  const json = req.body;
  const schemaResult = await pushSchema(agent, json.did, json.schema);
  res.json({ schemaResult });
});

export default router;
