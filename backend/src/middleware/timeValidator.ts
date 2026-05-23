import { Request, Response, NextFunction } from "express";

export const validatePaymentTime = (req: Request, res: Response, next: NextFunction): void => {
  // Get current time in Asia/Kolkata timezone
  const now = new Date();
  
  // Format options for IST
  const options = { timeZone: 'Asia/Kolkata', hour12: false, hour: 'numeric', minute: 'numeric' } as const;
  const formatter = new Intl.DateTimeFormat('en-US', options);
  
  const timeString = formatter.format(now);
  const [hourStr, minuteStr] = timeString.split(':');
  
  // Handle edge cases in formatting depending on Node version
  const match = timeString.match(/(\d+):(\d+)/);
  if (!match) {
    res.status(500).json({ error: "Time formatting error" });
    return;
  }
  
  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  
  // IST Time is now hour:minute (24h format)
  // Check if it's strictly between 10:00 and 11:00 (exclusive of 11:00, or inclusive, usually 10:00:00 to 10:59:59)
  // The requirement says "between 10:00 AM IST and 11:00 AM IST"
  if (hour === 10) {
    next();
  } else {
    res.status(403).json({ 
      error: "Payments are only allowed between 10:00 AM and 11:00 AM IST",
      nextWindow: "10:00 AM IST"
    });
  }
};
