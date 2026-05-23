import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth";
import { validatePaymentTime } from "../middleware/timeValidator";

const router = Router();

router.post("/create-order", authenticate, validatePaymentTime, createOrder);
router.post("/verify", authenticate, validatePaymentTime, verifyPayment);

export default router;
