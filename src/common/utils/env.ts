import { config } from "dotenv";

config();

// Backend
export const JWT_SECRET = process.env.JWT_SECRET!;

// AI Service
export const AI_API_BASE_URL = process.env.AI_API_BASE_URL!;
export const AI_API_TOKEN = process.env.AI_API_TOKEN!;

// Google
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

// Frontend
export const FRONTEND_DASHBOARD_URL = process.env.FRONTEND_DASHBOARD_URL!
export const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL!

// NodeMailer
export const EMAIL_ADMIN = process.env.EMAIL_ADMIN!
export const EMAIL_PASS = process.env.EMAIL_PASS!

// Fonte
export const FONNTE_BASE_URL = process.env.FONNTE_BASE_URL!
export const FONNTE_API_KEY = process.env.FONNTE_API_KEY!