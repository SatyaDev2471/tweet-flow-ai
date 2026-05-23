"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { X, CheckCircle, AlertCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLANS = [
  { name: "BRONZE", price: 100, tweets: 3, color: "from-orange-400 to-amber-600" },
  { name: "SILVER", price: 300, tweets: 5, color: "from-gray-300 to-gray-500" },
  { name: "GOLD", price: 1000, tweets: "Unlimited", color: "from-yellow-300 to-yellow-600" },
];

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTimeValid, setIsTimeValid] = useState(false);

  useEffect(() => {
    // Check local time for UI purposes
    const checkTime = () => {
      const now = new Date();
      const options = { timeZone: 'Asia/Kolkata', hour12: false, hour: 'numeric' } as const;
      const hourStr = new Intl.DateTimeFormat('en-US', options).format(now);
      const hour = parseInt(hourStr, 10);
      setIsTimeValid(hour === 10); // 10:00 AM to 10:59 AM IST
    };
    
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handlePayment = async (plan: string) => {
    if (!isTimeValid) {
      setError("Payments are only available between 10:00 AM and 11:00 AM IST.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/payments/create-order",
        { plan },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "TweetFlow AI",
        description: `${plan} Subscription`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            await axios.post(
              "http://localhost:5000/api/payments/verify",
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            window.location.reload(); // Reload to get updated user info
          } catch (err: any) {
            setError("Payment verification failed.");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#00d2ff",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-4xl relative overflow-hidden"
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold font-space mb-2 text-white">Upgrade Your Plan</h2>
                <p className="text-gray-400">Unlock more tweets and premium features</p>
                
                {!isTimeValid && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-amber-500 bg-amber-500/10 border border-amber-500/20 py-2 px-4 rounded-lg inline-flex">
                    <AlertCircle size={18} />
                    <span>Payments are only accepted between 10:00 AM and 11:00 AM IST.</span>
                  </div>
                )}
                {error && (
                  <div className="mt-4 text-destructive bg-destructive/10 border border-destructive/20 py-2 px-4 rounded-lg inline-block">
                    {error}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {PLANS.map((plan) => (
                  <div 
                    key={plan.name}
                    className="glass-card p-6 flex flex-col relative group hover:-translate-y-2 transition-transform duration-300"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />
                    
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold mb-6 font-space">
                      ₹{plan.price}<span className="text-sm text-gray-400 font-sans">/mo</span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle size={16} className="text-neon-cyan" />
                        {plan.tweets} Tweets per month
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle size={16} className="text-neon-cyan" />
                        Premium Support
                      </li>
                    </ul>

                    <Button 
                      onClick={() => handlePayment(plan.name)}
                      disabled={!isTimeValid || loading}
                      className={`w-full ${isTimeValid ? `bg-gradient-to-r ${plan.color} text-white` : 'bg-white/10 text-gray-500'}`}
                    >
                      {loading ? "Processing..." : "Select Plan"}
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
