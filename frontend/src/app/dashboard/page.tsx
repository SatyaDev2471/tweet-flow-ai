"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "@/components/ui/button";
import PaymentModal from "@/components/PaymentModal";
import { LogOut, Send, Trash2, Crown } from "lucide-react";
import Script from "next/script";

interface Tweet {
  id: string;
  content: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [newTweet, setNewTweet] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setFetching(true);
      const [tweetsRes, profileRes] = await Promise.all([
        axios.post("https://tweet-flow-ai-production.up.railway.app/api/auth/login", {}, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("https://tweet-flow-ai-production.up.railway.app/api/auth/profile", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setTweets(tweetsRes.data.tweets);
      
      const limits: Record<string, number> = { FREE: 1, BRONZE: 3, SILVER: 5, GOLD: Infinity };
      const currentPlan = profileRes.data.user.plan;
      const count = profileRes.data.user.tweetsCount;
      setRemaining(limits[currentPlan] - count);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handlePostTweet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTweet.trim()) return;

    if (remaining <= 0) {
      setIsModalOpen(true);
      return;
    }

    try {
      await axios.post(
        "https://tweet-flow-ai-production.up.railway.app/api/tweets",
        { content: newTweet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTweet("");
      fetchData();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setIsModalOpen(true);
      } else {
        setError("Failed to post tweet");
      }
    }
  };

  const handleDeleteTweet = async (id: string) => {
    try {
      await axios.delete(`https://tweet-flow-ai-production.up.railway.app/api/tweets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !user) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-space text-white">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Crown size={16} className="text-neon-cyan" />
              <span className="text-sm font-medium">{user.plan} Plan</span>
            </div>
            <Button variant="ghost" onClick={logout} className="text-gray-400 hover:text-white">
              <LogOut size={18} className="mr-2" /> Logout
            </Button>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content - Tweet Composer */}
          <div className="md:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Compose Tweet</h2>
              <form onSubmit={handlePostTweet}>
                <textarea
                  value={newTweet}
                  onChange={(e) => setNewTweet(e.target.value)}
                  placeholder="What's happening?"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white resize-none h-32 focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                />
                <div className="flex justify-between items-center mt-4">
                  <span className={`text-sm ${remaining <= 0 ? 'text-destructive' : 'text-gray-400'}`}>
                    {remaining === Infinity ? 'Unlimited' : remaining} tweets remaining
                  </span>
                  <Button 
                    type="submit" 
                    variant="premium"
                    disabled={fetching || remaining <= 0}
                  >
                    <Send size={16} className="mr-2" /> Post Tweet
                  </Button>
                </div>
              </form>
            </motion.div>

            {/* Tweet Feed */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">Your Tweets</h3>
              {tweets.length === 0 && !fetching && (
                <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">
                  No tweets yet. Start posting!
                </div>
              )}
              {tweets.map((tweet) => (
                <motion.div 
                  key={tweet.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between group"
                >
                  <div>
                    <p className="text-white">{tweet.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(tweet.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeleteTweet(tweet.id)}
                    className="text-gray-500 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar - Stats & Upgrade */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 border-neon-blue/30"
            >
              <h3 className="font-semibold mb-2">Current Plan</h3>
              <div className="text-3xl font-bold font-space mb-4 text-gradient">
                {user.plan}
              </div>
              <p className="text-sm text-gray-400 mb-6">
                You have {remaining === Infinity ? 'unlimited' : remaining} tweets remaining for your current billing cycle.
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-white text-black hover:bg-gray-200"
              >
                Upgrade Plan
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <PaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
