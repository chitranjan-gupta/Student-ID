import { Router } from "express"

const router = Router()

router.get("/:schemaId", async (req,res) => {
    res.send(req.params.schemaId);
})

router.post("/", async (req,res) => {
    res.send("");
})

export default router;