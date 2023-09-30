import { Router } from "express";
import {
  createNewInvitation,
  acceptInvitation,
  receiveInvitation,
} from "../utils/invitation.js";

const router = Router();

router.get("/", async (req, res) => {
  res.send("Hello");
});

router.get("/:outOfBandId", async (req, res) => {
  res.send(req.params.outOfBandId);
});

router.post("/create-invitation", async (req, res) => {
  const agent = req.container.get("agent");
  const { invitationUrl, outOfBandRecord } = await createNewInvitation(agent);
  res.json({ invitationUrl: invitationUrl, outOfBandRecord: outOfBandRecord });
});

router.post("/create-legacy-invitation", async (req, res) => {
  res.send("");
});

router.post("/create-legacy-connectionless-invitation", async (req, res) => {
  res.send("Hello");
});

router.post("/receive-invitation", async (req, res) => {
  res.send("Hello");
});

router.post("/receive-invitation-url", async (req, res) => {
  const agent = req.container.get("agent");
  const json = req.body;
  const outOfBandRecord = await receiveInvitation(agent, json.invitationUrl);
  res.json({ outOfBandRecord });
});

router.post("/:outOfBandId/accept-invitation", async (req, res) => {
  const agent = req.container.get("agent");
  const { outOfBandRecord, connectionRecord } = acceptInvitation(
    agent,
    req.params.outOfBandId
  );
  res.json({ outOfBandRecord, connectionRecord });
});

router.delete("/:outOfBandId", async (req, res) => {
  res.send(req.params.outOfBandId);
});

export default router;
