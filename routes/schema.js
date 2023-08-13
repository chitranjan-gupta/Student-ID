import { Router } from "express"
import { pullSchema } from "../utils/cred.js";

const router = Router()

router.get("/", async (req, res) => {
    const json = req.body
    const schemaResult = await pullSchema(req.steward, json.schemaId)
    res.json({ schemaResult });
})

router.post("/", async (req, res) => {
    res.send("");
})

export default router;