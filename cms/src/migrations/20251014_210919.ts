import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Check if slug column exists and has data before making it NOT NULL
  const result = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'slug'
  `)
  
  if (result.rows && result.rows.length > 0) {
    // Ensure all trips have slugs before making column NOT NULL
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
    
    // Now safely make slug NOT NULL
    await db.execute(sql`
      ALTER TABLE "trips" ALTER COLUMN "slug" SET NOT NULL;
    `)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Check if column exists before trying to modify it
  const result = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'slug'
  `)
  
  if (result.rows && result.rows.length > 0) {
    await db.execute(sql`
      ALTER TABLE "trips" ALTER COLUMN "slug" DROP NOT NULL;
    `)
  }
}
