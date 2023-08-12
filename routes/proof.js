import { Router } from "express"

const router = Router()

router.get("/", async (req,res) => {
    res.send("Hello");
})

router.get("/:proofRecordId", async (req,res) => {
    res.send(req.params.proofRecordId);
})

router.post("/propose-proof", async (req,res) => {
    res.send("Hello");
})

router.post("/:proofRecordId/accept-proposal", async (req,res) => {
    res.send(req.params.proofRecordId);
})

router.post("/request-outofband-proof", async (req,res) => {
    res.send("Hello");
})

router.post("/request-proof", async (req,res) => {
    res.send("Hello");
})

router.post("/:proofRecordId/accept-request", async (req,res) => {
    res.send(req.params.proofRecordId);
})

router.post("/:proofRecordId/accept-presentation", async (req,res) => {
    res.send(req.params.proofRecordId);
})

router.delete("/:proofRecordId", async (req,res) => {
    res.send(req.params.proofRecordId);
})

export default router;