import { Router } from "express"

const router = Router()

router.get("/:credentialDefinitionId", async (req,res) => {
    res.send(req.params.credentialDefinitionId);
})

router.post("/", async (req,res) => {
    res.send("");
})

export default router;