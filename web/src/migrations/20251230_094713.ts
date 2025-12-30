import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "trips_blocks_full_day" DROP COLUMN "region_province";
  ALTER TABLE "trips_blocks_waypoint" DROP COLUMN "region_province";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "trips_blocks_full_day" ADD COLUMN "region_province" varchar;
  ALTER TABLE "trips_blocks_waypoint" ADD COLUMN "region_province" varchar;`)
}
