import { Router } from "express"

const router = Router()

router.get("/", async (req,res) => {
    res.send("Hello");
})

router.get("/:credentialRecordId", async (req,res) => {
    res.send(req.params.credentialRecordId);
})

router.post("/propose-credential", async (req,res) => {
    res.send("Hello");
})

router.post("/:credentialRecordId/accept-proposal", async (req,res) => {
    res.send(req.params.credentialRecordId);
})

router.post("/create-offer", async (req,res) => {
    res.send("Hello");
})

router.post("/offer-credential", async (req,res) => {
    res.send("Hello");
})

router.post("/:credentialRecordId/accept-offer", async (req,res) => {
    res.send(req.params.credentialRecordId);
})

router.post("/:credentialRecordId/accept-request", async (req,res) => {
    res.send(req.params.credentialRecordId);
})

router.post("/:credentialRecordId/accept-credential", async (req,res) => {
    res.send(req.params.credentialRecordId);
})

router.delete("/:credentialRecordId", async (req,res) => {
    res.send(req.params.credentialRecordId);
})

export default router;