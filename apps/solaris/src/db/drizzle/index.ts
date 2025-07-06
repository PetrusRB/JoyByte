import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const dbUrl = `${process.env.DATABASE_URL}`;

const sql = neon(dbUrl!);
const db = drizzle({ client: sql, schema });

export { db };
