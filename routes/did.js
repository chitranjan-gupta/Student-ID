import { Router } from "express";

const router = Router();

router.get("/:did", async (req, res) => {
  res.send(req.params.did);
});

export default router;
