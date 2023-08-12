import { Router } from "express"
import { createNewInvitation, acceptInvitation } from "../utils/invitation.js"

const router = Router()

router.get("/", async (req, res) => {
    res.send("Hello");
})

router.get("/:outOfBandId", async (req, res) => {
    res.send(req.params.outOfBandId);
})

router.post("/create-invitation", async (req, res) => {
    const { invitationUrl, outOfBandRecord } = await createNewInvitation(req.steward);
    res.json({ invitationUrl: invitationUrl, outOfBandRecord: outOfBandRecord });
})

router.post("/create-legacy-invitation", async (req, res) => {
    res.send("");
})

router.post("/create-legacy-connectionless-invitation", async (req, res) => {
    res.send("Hello");
})

router.post("/receive-invitation", async (req, res) => {
    res.send("Hello");
})

router.post("/receive-invitation-url", async (req, res) => {
    res.send("");
})

router.post("/:outOfBandId/accept-invitation", async (req, res) => {
    const { outOfBandRecord, connectionRecord } = acceptInvitation(req.steward, req.params.outOfBandId);
    res.json({ outOfBandRecord: outOfBandRecord, connectionRecord: connectionRecord })
})

router.delete("/:outOfBandId", async (req, res) => {
    res.send(req.params.outOfBandId);
})

export default router;