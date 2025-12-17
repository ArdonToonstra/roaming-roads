import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_trips_category" ADD VALUE 'base_camp';
  CREATE TABLE "trips_category" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_trips_category",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  ALTER TABLE "trips_category" ADD CONSTRAINT "trips_category_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "trips_category_order_idx" ON "trips_category" USING btree ("order");
  CREATE INDEX "trips_category_parent_idx" ON "trips_category" USING btree ("parent_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  ALTER TABLE "trips" DROP COLUMN "category";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "trips_category" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  ALTER TABLE "trips" ALTER COLUMN "category" SET DATA TYPE text;
  DROP TYPE "public"."enum_trips_category";
  CREATE TYPE "public"."enum_trips_category" AS ENUM('city_trip', 'road_trip', 'backpacking', 'hiking');
  ALTER TABLE "trips" ALTER COLUMN "category" SET DATA TYPE "public"."enum_trips_category" USING "category"::"public"."enum_trips_category";
  ALTER TABLE "trips" ADD COLUMN "category" "enum_trips_category";`)
}
