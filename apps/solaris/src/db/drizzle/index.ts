import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const dbUrl = `${process.env.DATABASE_URL}`;
const pool = new Pool({
  connectionString: dbUrl!,
});
const db = drizzle({ client: pool, schema });

export { db };
