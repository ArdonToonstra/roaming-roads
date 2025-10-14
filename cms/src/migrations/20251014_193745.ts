import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Step 1: Add slug column if it doesn't exist (safe approach)
  await db.execute(sql`
    ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "slug" varchar;
  `)
  
  // Step 2: Generate slugs for existing trips that don't have them
  await db.execute(sql`
    UPDATE "trips" 
    SET "slug" = LOWER(
      TRIM(
        REGEXP_REPLACE(
          REGEXP_REPLACE("title", '[^a-zA-Z0-9\s\-]', '', 'g'),
          '\s+', '-', 'g'
        )
      )
    )
    WHERE ("slug" IS NULL OR "slug" = '') AND "title" IS NOT NULL;
  `)
  
  // Step 3: Create unique index on slug if it doesn't exist
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "trips_slug_idx" ON "trips" USING btree ("slug");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "trips_slug_idx";
    ALTER TABLE "trips" DROP COLUMN IF EXISTS "slug";
  `)
}
