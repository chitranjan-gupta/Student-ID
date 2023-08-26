import { Router } from "express"
import { pullSchema, pushSchema } from "../utils/cred.js";

const router = Router()

router.get("/", async (req, res) => {
    const json = req.body
    const schemaResult = await pullSchema(req.steward, json.schemaId)
    res.json({ schemaResult });
})

router.post("/", async (req, res) => {
    const json = req.body
    const schemaResult = await pushSchema(req.steward, json.did, json.schema)
    res.json({ schemaResult });
})

export default router;