import 'dotenv/config';

import { neon } from 'drizzle-orm/neon-postgres';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql);

export { db, sql };
