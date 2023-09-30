import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  res.send("Hello");
});

router.get("/:connectionId", async (req, res) => {
  res.send(req.params.connectionId);
});

router.post("/:connectionId/accept-request", async (req, res) => {
  res.send(req.params.connectionId);
});

router.post("/:connectionId/accept-response", async (req, res) => {
  res.send(req.params.connectionId);
});

router.delete("/:connectionId", async (req, res) => {
  res.send(req.params.connectionId);
});

export default router;
