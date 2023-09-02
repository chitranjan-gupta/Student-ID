import { Router } from "express"
import { offerCred, propCred, pullLinkSecret } from "../utils/cred.js";

const router = Router()

router.get("/", async (req, res) => {
    const ids = await pullLinkSecret(req.steward)
    res.send({ ids });
})

router.get("/:credentialRecordId", async (req, res) => {
    res.send(req.params.credentialRecordId);
})

router.post("/propose-credential", async (req, res) => {
    const json = req.body
    const anonCredsCredentialExchangeRecord = await propCred(req.steward, json.connectionId, json.credentialDefinitionId)
    res.json({ anonCredsCredentialExchangeRecord });
})

router.post("/:credentialRecordId/accept-proposal", async (req, res) => {
    res.send(req.params.credentialRecordId);
})

router.post("/create-offer", async (req, res) => {
    res.send("Hello");
})

router.post("/offer-credential", async (req, res) => {
    const json = req.body
    const anonCredsCredentialExchangeRecord = await offerCred(req.steward, json.connectionId, json.credentialDefinitionId, json.first_name, json.last_name)
    res.json({ anonCredsCredentialExchangeRecord });
})

router.post("/:credentialRecordId/accept-offer", async (req, res) => {
    res.send(req.params.credentialRecordId);
})

router.post("/:credentialRecordId/accept-request", async (req, res) => {
    res.send(req.params.credentialRecordId);
})

router.post("/:credentialRecordId/accept-credential", async (req, res) => {
    res.send(req.params.credentialRecordId);
})

router.delete("/:credentialRecordId", async (req, res) => {
    res.send(req.params.credentialRecordId);
})

export default router;