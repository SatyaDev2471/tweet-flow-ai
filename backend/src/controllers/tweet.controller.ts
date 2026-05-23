import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";

const getPlanLimits = (plan: string): number => {
  switch (plan) {
    case "FREE": return 1;
    case "BRONZE": return 3;
    case "SILVER": return 5;
    case "GOLD": return Infinity;
    default: return 0;
  }
};

export const createTweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const limit = getPlanLimits(user.plan);

    if (user.tweetsCount >= limit) {
      res.status(403).json({ 
        error: "Limit exceeded", 
        message: "You have reached your tweet limit for your current plan. Please upgrade to post more." 
      });
      return;
    }

    const tweet = await prisma.tweet.create({
      data: {
        userId,
        content
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { tweetsCount: { increment: 1 } }
    });

    res.status(201).json({ tweet, remaining: limit - (user.tweetsCount + 1) });
  } catch (error) {
    console.error("Create tweet error:", error);
    res.status(500).json({ error: "Could not create tweet" });
  }
};

export const getTweets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const tweets = await prisma.tweet.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    res.json({ tweets });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch tweets" });
  }
};

export const deleteTweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const tweet = await prisma.tweet.findUnique({ where: { id } });

    if (!tweet || tweet.userId !== userId) {
      res.status(404).json({ error: "Tweet not found or unauthorized" });
      return;
    }

    await prisma.tweet.delete({ where: { id } });

    // Optional: decrement count or keep it as lifetime usage?
    // Based on standard SaaS limits, if limits are per month, deleting doesn't restore quota usually, 
    // but let's assume we don't decrement to prevent abuse, or we can decrement. We'll leave it as is.
    // If they want to restore limit, we can decrement.
    await prisma.user.update({
      where: { id: userId },
      data: { tweetsCount: { decrement: 1 } }
    });

    res.json({ message: "Tweet deleted" });
  } catch (error) {
    res.status(500).json({ error: "Could not delete tweet" });
  }
};
