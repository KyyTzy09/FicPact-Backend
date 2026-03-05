import { config } from "dotenv";

config();

export const JWT_SECRET = process.env.JWT_SECRET!;
export const AI_API_BASE_URL = process.env.AI_API_BASE_URL!;
export const AI_API_TOKEN = process.env.AI_API_TOKEN!;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
export const FRONTEND_URL = process.env.FRONTEND_URL!