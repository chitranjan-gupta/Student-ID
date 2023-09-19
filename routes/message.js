import { Router } from "express"
import { send } from "../utils/chat.js";

const router = Router()

router.get("/:connectionId", async (req, res) => {
    res.send(req.params.connectionId);
})

router.post("/:connectionId", async (req, res) => {
    const agent = req.container.get("agent");
    const json = req.body
    const basicMessageRecord = await send(agent, req.params.connectionId, json.msg)
    res.json({ basicMessageRecord });
})

export default router;