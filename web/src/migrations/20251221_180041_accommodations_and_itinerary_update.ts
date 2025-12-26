import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_trips_blocks_waypoint_connection_type" AS ENUM('route', 'side_trip');
  CREATE TYPE "public"."enum_trips_blocks_waypoint_transportation_arrival_method" AS ENUM('walking', 'rental_car', 'public_bus', 'taxi', 'train', 'flight', 'boat', 'bicycle', 'hitchhiking', 'tour_bus', 'other');
  CREATE TYPE "public"."enum_trips_blocks_waypoint_transportation_departure_method" AS ENUM('walking', 'rental_car', 'public_bus', 'taxi', 'train', 'flight', 'boat', 'bicycle', 'hitchhiking', 'tour_bus', 'other');
  CREATE TYPE "public"."enum_trips_blocks_waypoint_transportation_travel_time_unit" AS ENUM('minutes', 'hours', 'days');
  CREATE TYPE "public"."enum_trips_blocks_waypoint_transportation_distance_unit" AS ENUM('km', 'mi');
  CREATE TABLE "accommodations_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "trips_blocks_waypoint" ADD COLUMN "connection_type" "enum_trips_blocks_waypoint_connection_type" DEFAULT 'route';
  ALTER TABLE "trips_blocks_waypoint" ADD COLUMN "transportation_arrival_method" "enum_trips_blocks_waypoint_transportation_arrival_method";
  ALTER TABLE "trips_blocks_waypoint" ADD COLUMN "transportation_departure_method" "enum_trips_blocks_waypoint_transportation_departure_method";
  ALTER TABLE "trips_blocks_waypoint" ADD COLUMN "transportation_travel_time_value" numeric;
  ALTER TABLE "trips_blocks_waypoint" ADD COLUMN "transportation_travel_time_unit" "enum_trips_blocks_waypoint_transportation_travel_time_unit" DEFAULT 'hours';
  ALTER TABLE "trips_blocks_waypoint" ADD COLUMN "transportation_distance_value" numeric;
  ALTER TABLE "trips_blocks_waypoint" ADD COLUMN "transportation_distance_unit" "enum_trips_blocks_waypoint_transportation_distance_unit" DEFAULT 'km';
  ALTER TABLE "trips_blocks_waypoint" ADD COLUMN "transportation_transportation_notes" varchar;
  ALTER TABLE "accommodations_rels" ADD CONSTRAINT "accommodations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."accommodations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "accommodations_rels" ADD CONSTRAINT "accommodations_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "accommodations_rels_order_idx" ON "accommodations_rels" USING btree ("order");
  CREATE INDEX "accommodations_rels_parent_idx" ON "accommodations_rels" USING btree ("parent_id");
  CREATE INDEX "accommodations_rels_path_idx" ON "accommodations_rels" USING btree ("path");
  CREATE INDEX "accommodations_rels_media_id_idx" ON "accommodations_rels" USING btree ("media_id");
  ALTER TABLE "accommodations" DROP COLUMN "price_range";
  DROP TYPE "public"."enum_accommodations_price_range";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_accommodations_price_range" AS ENUM('budget', 'midrange', 'luxury', 'ultra_luxury');
  DROP TABLE "accommodations_rels" CASCADE;
  ALTER TABLE "accommodations" ADD COLUMN "price_range" "enum_accommodations_price_range";
  ALTER TABLE "trips_blocks_waypoint" DROP COLUMN "connection_type";
  ALTER TABLE "trips_blocks_waypoint" DROP COLUMN "transportation_arrival_method";
  ALTER TABLE "trips_blocks_waypoint" DROP COLUMN "transportation_departure_method";
  ALTER TABLE "trips_blocks_waypoint" DROP COLUMN "transportation_travel_time_value";
  ALTER TABLE "trips_blocks_waypoint" DROP COLUMN "transportation_travel_time_unit";
  ALTER TABLE "trips_blocks_waypoint" DROP COLUMN "transportation_distance_value";
  ALTER TABLE "trips_blocks_waypoint" DROP COLUMN "transportation_distance_unit";
  ALTER TABLE "trips_blocks_waypoint" DROP COLUMN "transportation_transportation_notes";
  DROP TYPE "public"."enum_trips_blocks_waypoint_connection_type";
  DROP TYPE "public"."enum_trips_blocks_waypoint_transportation_arrival_method";
  DROP TYPE "public"."enum_trips_blocks_waypoint_transportation_departure_method";
  DROP TYPE "public"."enum_trips_blocks_waypoint_transportation_travel_time_unit";
  DROP TYPE "public"."enum_trips_blocks_waypoint_transportation_distance_unit";`)
}
