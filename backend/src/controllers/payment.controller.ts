import { Request, Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth";
import { sendInvoiceEmail } from "../services/email.service";
import { PlanType } from "@prisma/client";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret",
});

const getPlanAmount = (plan: string): number => {
  switch (plan) {
    case "BRONZE": return 100;
    case "SILVER": return 300;
    case "GOLD": return 1000;
    default: return 0;
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { plan } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const amount = getPlanAmount(plan);
    if (amount === 0) {
      res.status(400).json({ error: "Invalid plan selected" });
      return;
    }

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);

    await prisma.payment.create({
      data: {
        userId,
        razorpayOrderId: order.id,
        amount,
        plan: plan as PlanType,
      }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Could not create order" });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "test_secret";
    
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature) {
      res.status(400).json({ error: "Transaction not legit!" });
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId }
    });

    if (!payment) {
      res.status(404).json({ error: "Payment record not found" });
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { razorpayOrderId },
      data: { 
        status: "SUCCESS", 
        razorpayPaymentId 
      }
    });

    // Create Subscription
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month validity

    await prisma.subscription.create({
      data: {
        userId,
        plan: payment.plan,
        endDate
      }
    });

    // Update user plan & reset tweet count
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        plan: payment.plan,
        tweetsCount: 0 // Resetting tweet counts
      }
    });

    // Create invoice record
    const invoice = await prisma.invoice.create({
      data: {
        paymentId: payment.id,
        pdfContent: "Invoice content pending..."
      }
    });

    // Send Email
    await sendInvoiceEmail(user.email, user.name || "User", payment.plan, payment.amount, invoice.id);

    res.json({ 
      success: true, 
      message: "Payment verified successfully",
      plan: payment.plan
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
};
