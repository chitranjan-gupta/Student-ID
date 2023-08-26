import { Router } from "express"
import { pullCredDef, pushCredDef } from "../utils/cred.js"

const router = Router()

router.get("/", async (req, res) => {
    const json = req.body
    const credentialDefinitionResult = await pullCredDef(req.steward, json.credentialDefinitionId)
    res.json({ credentialDefinitionResult });
})

router.post("/", async (req, res) => {
    const json = req.body
    const credentialDefinitionResult = await pushCredDef(req.steward, json.did, json.schemaId)
    res.json({ credentialDefinitionResult });
})

export default router;