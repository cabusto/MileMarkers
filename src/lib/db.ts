import { neon } from "@neondatabase/serverless";

// Lazy so `next build` works without DATABASE_URL set.
export const db = () => neon(process.env.DATABASE_URL!);
