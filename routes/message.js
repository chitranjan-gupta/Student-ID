import { Router } from "express"

const router = Router()

router.get("/:connectionId", async (req,res) => {
    res.send(req.params.connectionId);
})

router.post("/:connectionId", async (req,res) => {
    res.send(req.params.connectionId);
})

export default router;