import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Safely add the important_preparations column if it doesn't exist
  await db.execute(sql`
    ALTER TABLE "trips" 
    ADD COLUMN IF NOT EXISTS "important_preparations" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Safely drop the important_preparations column if it exists
  await db.execute(sql`
    ALTER TABLE "trips" 
    DROP COLUMN IF EXISTS "important_preparations";`)
}
