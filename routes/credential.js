import { Router } from "express";
import { offerCred, propCred } from "../utils/cred.js";

const router = Router();

router.get("/", async (req, res) => {
  res.send("");
});

router.get("/:credentialRecordId", async (req, res) => {
  res.send(req.params.credentialRecordId);
});

router.post("/propose-credential", async (req, res) => {
  const agent = req.container.get("agent");
  const json = req.body;
  const anonCredsCredentialExchangeRecord = await propCred(
    agent,
    json.connectionId,
    json.credentialDefinitionId
  );
  res.json({ anonCredsCredentialExchangeRecord });
});

router.post("/:credentialRecordId/accept-proposal", async (req, res) => {
  res.send(req.params.credentialRecordId);
});

router.post("/create-offer", async (req, res) => {
  res.send("Hello");
});

router.post("/offer-credential", async (req, res) => {
  const agent = req.container.get("agent");
  const json = req.body;
  const anonCredsCredentialExchangeRecord = await offerCred(
    agent,
    json.connectionId,
    json.credentialDefinitionId,
    json.first_name,
    json.last_name
  );
  res.json({ anonCredsCredentialExchangeRecord });
});

router.post("/:credentialRecordId/accept-offer", async (req, res) => {
  res.send(req.params.credentialRecordId);
});

router.post("/:credentialRecordId/accept-request", async (req, res) => {
  res.send(req.params.credentialRecordId);
});

router.post("/:credentialRecordId/accept-credential", async (req, res) => {
  res.send(req.params.credentialRecordId);
});

router.delete("/:credentialRecordId", async (req, res) => {
  res.send(req.params.credentialRecordId);
});

export default router;
