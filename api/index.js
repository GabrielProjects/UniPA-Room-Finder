// Vercel serverless function wrapper for Express app
// This file allows Vercel to run the Express app as serverless functions

import app from "../backend/server.js";

// Export as default handler for Vercel
export default app;

