import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resend = new Resend(process.env.RESEND_API_KEY || "");

export const sendInvoiceEmail = async (email: string, name: string, plan: string, amount: number, paymentId: string) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #fff; padding: 20px; border-radius: 10px;">
      <h1 style="color: #00d2ff; text-align: center;">TweetFlow AI</h1>
      <h2 style="text-align: center;">Payment Receipt</h2>
      <p>Hi ${name || 'User'},</p>
      <p>Thank you for your purchase! Your subscription to the <strong>${plan}</strong> plan has been activated.</p>
      
      <div style="background-color: #111; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Invoice ID:</strong> ${paymentId}</p>
        <p style="margin: 5px 0;"><strong>Plan:</strong> ${plan}</p>
        <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${amount}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <p>You can now log in and start using your new limits.</p>
      <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
        © ${new Date().getFullYear()} TweetFlow AI. All rights reserved.
      </p>
    </div>
  `;

  try {
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')) {
      await resend.emails.send({
        from: 'TweetFlow AI <billing@tweetflow.ai>',
        to: email,
        subject: 'Your TweetFlow AI Subscription Invoice',
        html: htmlContent
      });
      console.log('Email sent via Resend');
    } else {
      // Fallback to nodemailer for local testing if credentials are provided
      console.log('Resend key not found or invalid, using Nodemailer fallback or skipping.');
      // You can add nodemailer config here if needed, or simply log to console.
      console.log('Invoice Email Content:', htmlContent);
    }
  } catch (error) {
    console.error('Failed to send email', error);
  }
};
