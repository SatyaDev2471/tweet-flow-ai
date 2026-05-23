import { Router } from "express";
import { createTweet, getTweets, deleteTweet } from "../controllers/tweet.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, createTweet);
router.get("/", authenticate, getTweets);
router.delete("/:id", authenticate, deleteTweet);

export default router;
