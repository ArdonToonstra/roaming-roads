import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_trips_category" AS ENUM('city_trip', 'road_trip', 'backpacking', 'hiking');
  CREATE TYPE "public"."enum_countries_continent" AS ENUM('africa', 'antarctica', 'asia', 'europe', 'north_america', 'oceania', 'south_america');
  ALTER TABLE "trips" ADD COLUMN "category" "enum_trips_category";
  ALTER TABLE "countries" ADD COLUMN "continent" "enum_countries_continent";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "trips" DROP COLUMN "category";
  ALTER TABLE "countries" DROP COLUMN "continent";
  DROP TYPE "public"."enum_trips_category";
  DROP TYPE "public"."enum_countries_continent";`)
}
