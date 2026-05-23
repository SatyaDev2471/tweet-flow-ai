# TweetFlow AI - Premium SaaS Application

## Setup Instructions

Since your system currently lacks `powershell` in its PATH, the automatic installation of dependencies could not be run. Please follow these manual steps to start the application.

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Razorpay Account (for testing payments)
- Resend API Key (for invoice emails)

### 1. Backend Setup

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   - Edit the `backend/.env` file with your PostgreSQL database URL, Razorpay Keys, and Resend API Key.

4. Initialize Prisma and Database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`.

### Core Features Included:
- **Authentication**: JWT-based login and registration.
- **Role & Plan Management**: FREE, BRONZE, SILVER, and GOLD plans with varying tweet limits.
- **Razorpay Integration**: Handles payments to upgrade subscriptions.
- **Time Validation Restriction**: Payments are ONLY allowed between 10:00 AM IST and 11:00 AM IST. Handled by backend middleware and UI indicator.
- **Invoicing**: Resend email integration sends invoice receipts after successful payment.
- **Premium UI**: Framer Motion animations, Glassmorphism, Neon glows, and Tailwind CSS.

### Important Note about Time Restrictions:
If you try to test the payment system outside the 10:00 AM - 11:00 AM IST window, the "Select Plan" buttons will be disabled. You can temporarily adjust your local computer time, or temporarily modify `frontend/src/components/PaymentModal.tsx` and `backend/src/middleware/timeValidator.ts` to test.
