import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_trips_blocks_point_point_type" AS ENUM('intermediate', 'start', 'end');
  CREATE TYPE "public"."enum_trips_blocks_point_transportation_arrival_method" AS ENUM('walking', 'rental_car', 'public_bus', 'taxi', 'train', 'flight', 'boat', 'bicycle', 'hitchhiking', 'tour_bus', 'other');
  CREATE TYPE "public"."enum_trips_blocks_point_transportation_departure_method" AS ENUM('walking', 'rental_car', 'public_bus', 'taxi', 'train', 'flight', 'boat', 'bicycle', 'hitchhiking', 'tour_bus', 'other');
  CREATE TYPE "public"."enum_trips_blocks_point_transportation_travel_time_unit" AS ENUM('minutes', 'hours', 'days');
  CREATE TYPE "public"."enum_trips_blocks_point_transportation_distance_unit" AS ENUM('km', 'mi');
  ALTER TYPE "public"."enum_trips_category" ADD VALUE 'diving';
  ALTER TYPE "public"."enum_trips_category" ADD VALUE 'wintersport';
  ALTER TYPE "public"."enum_trips_category" ADD VALUE 'culinary';
  CREATE TABLE "trips_blocks_point" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"location_name" varchar NOT NULL,
  	"description" varchar,
  	"location" geometry(Point),
  	"point_type" "enum_trips_blocks_point_point_type" DEFAULT 'intermediate',
  	"transportation_arrival_method" "enum_trips_blocks_point_transportation_arrival_method",
  	"transportation_departure_method" "enum_trips_blocks_point_transportation_departure_method",
  	"transportation_travel_time_value" numeric,
  	"transportation_travel_time_unit" "enum_trips_blocks_point_transportation_travel_time_unit" DEFAULT 'hours',
  	"transportation_distance_value" numeric,
  	"transportation_distance_unit" "enum_trips_blocks_point_transportation_distance_unit" DEFAULT 'km',
  	"transportation_transportation_notes" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "trips_blocks_point" ADD CONSTRAINT "trips_blocks_point_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "trips_blocks_point_order_idx" ON "trips_blocks_point" USING btree ("_order");
  CREATE INDEX "trips_blocks_point_parent_id_idx" ON "trips_blocks_point" USING btree ("_parent_id");
  CREATE INDEX "trips_blocks_point_path_idx" ON "trips_blocks_point" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "trips_blocks_point" CASCADE;
  ALTER TABLE "trips_category" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_trips_category";
  CREATE TYPE "public"."enum_trips_category" AS ENUM('city_trip', 'road_trip', 'backpacking', 'hiking', 'base_camp');
  ALTER TABLE "trips_category" ALTER COLUMN "value" SET DATA TYPE "public"."enum_trips_category" USING "value"::"public"."enum_trips_category";
  DROP TYPE "public"."enum_trips_blocks_point_point_type";
  DROP TYPE "public"."enum_trips_blocks_point_transportation_arrival_method";
  DROP TYPE "public"."enum_trips_blocks_point_transportation_departure_method";
  DROP TYPE "public"."enum_trips_blocks_point_transportation_travel_time_unit";
  DROP TYPE "public"."enum_trips_blocks_point_transportation_distance_unit";`)
}
