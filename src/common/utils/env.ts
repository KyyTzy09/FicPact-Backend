import { config } from "dotenv";

config();

export const JWT_SECRET = process.env.JWT_SECRET!;
export const AI_API_BASE_URL = process.env.AI_API_BASE_URL!;
export const AI_API_TOKEN = process.env.AI_API_TOKEN!;