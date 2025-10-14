import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Step 1: Add slug column as nullable
  await db.execute(sql`
    ALTER TABLE "trips" ADD COLUMN "slug" varchar;
  `)
  
  // Step 2: Generate slugs for existing trips from their titles
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
    WHERE "slug" IS NULL AND "title" IS NOT NULL;
  `)
  
  // Step 3: Create unique index on slug
  await db.execute(sql`
    CREATE UNIQUE INDEX "trips_slug_idx" ON "trips" USING btree ("slug");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "trips_slug_idx";
  ALTER TABLE "trips" DROP COLUMN "slug";`)
}
