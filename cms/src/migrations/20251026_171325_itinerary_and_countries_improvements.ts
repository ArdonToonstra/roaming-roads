import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_countries_main_religion" ADD VALUE 'catholicism' BEFORE 'islam';
  CREATE TABLE "trips_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"countries_id" integer
  );
  
  ALTER TABLE "media_seo_keywords" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_tags" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media_seo_keywords" CASCADE;
  DROP TABLE "media_tags" CASCADE;
  ALTER TABLE "media" RENAME COLUMN "location_country_id" TO "country_id";
  ALTER TABLE "media" DROP CONSTRAINT "media_location_country_id_countries_id_fk";
  
  ALTER TABLE "trips" DROP CONSTRAINT "trips_country_id_countries_id_fk";
  
  DROP INDEX "media_location_location_country_idx";
  DROP INDEX "trips_country_idx";
  ALTER TABLE "media" ALTER COLUMN "alt" DROP NOT NULL;
  ALTER TABLE "countries" ADD COLUMN "travel_time_from_brussels" numeric;
  ALTER TABLE "trips_rels" ADD CONSTRAINT "trips_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_rels" ADD CONSTRAINT "trips_rels_countries_fk" FOREIGN KEY ("countries_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "trips_rels_order_idx" ON "trips_rels" USING btree ("order");
  CREATE INDEX "trips_rels_parent_idx" ON "trips_rels" USING btree ("parent_id");
  CREATE INDEX "trips_rels_path_idx" ON "trips_rels" USING btree ("path");
  CREATE INDEX "trips_rels_countries_id_idx" ON "trips_rels" USING btree ("countries_id");
  ALTER TABLE "media" ADD CONSTRAINT "media_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_country_idx" ON "media" USING btree ("country_id");
  ALTER TABLE "media" DROP COLUMN "location_location_name";
  ALTER TABLE "media" DROP COLUMN "location_gps";
  ALTER TABLE "media" DROP COLUMN "media_type";
  ALTER TABLE "media" DROP COLUMN "photography_info_camera";
  ALTER TABLE "media" DROP COLUMN "photography_info_lens";
  ALTER TABLE "media" DROP COLUMN "photography_info_settings_aperture";
  ALTER TABLE "media" DROP COLUMN "photography_info_settings_shutter_speed";
  ALTER TABLE "media" DROP COLUMN "photography_info_settings_iso";
  ALTER TABLE "media" DROP COLUMN "photography_info_settings_focal_length";
  ALTER TABLE "media" DROP COLUMN "usage_photographer";
  ALTER TABLE "media" DROP COLUMN "usage_license_type";
  ALTER TABLE "media" DROP COLUMN "usage_attribution";
  ALTER TABLE "media" DROP COLUMN "seo_title";
  ALTER TABLE "media" DROP COLUMN "featured";
  ALTER TABLE "trips_highlights_media" DROP COLUMN "caption";
  ALTER TABLE "trips_highlights_media" DROP COLUMN "order";
  ALTER TABLE "trips_regions_visited" DROP COLUMN "region_type";
  ALTER TABLE "trips_regions_visited" DROP COLUMN "highlights";
  ALTER TABLE "trips_blocks_full_day_gallery" DROP COLUMN "caption";
  ALTER TABLE "trips_blocks_full_day_gallery" DROP COLUMN "is_highlight";
  ALTER TABLE "trips" DROP COLUMN "country_id";
  ALTER TABLE "countries" DROP COLUMN "emergency_numbers_police";
  ALTER TABLE "countries" DROP COLUMN "emergency_numbers_medical";
  ALTER TABLE "countries" DROP COLUMN "emergency_numbers_fire";
  ALTER TABLE "countries" DROP COLUMN "emergency_numbers_tourist";
  DROP TYPE "public"."enum_media_media_type";
  DROP TYPE "public"."enum_media_usage_license_type";
  DROP TYPE "public"."enum_trips_regions_visited_region_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_media_media_type" AS ENUM('photo', 'video', 'audio', 'document');
  CREATE TYPE "public"."enum_media_usage_license_type" AS ENUM('own', 'cc', 'stock', 'permission', 'fair-use');
  CREATE TYPE "public"."enum_trips_regions_visited_region_type" AS ENUM('province', 'region', 'oblast', 'state', 'territory', 'county', 'district', 'other');
  CREATE TABLE "media_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE "media_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  ALTER TABLE "trips_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "trips_rels" CASCADE;
  ALTER TABLE "media" RENAME COLUMN "country_id" TO "location_country_id";
  ALTER TABLE "media" DROP CONSTRAINT "media_country_id_countries_id_fk";
  
  ALTER TABLE "countries" ALTER COLUMN "main_religion" SET DATA TYPE text;
  DROP TYPE "public"."enum_countries_main_religion";
  CREATE TYPE "public"."enum_countries_main_religion" AS ENUM('christianity', 'islam', 'judaism', 'hinduism', 'buddhism', 'sikhism', 'secular', 'mixed', 'other');
  ALTER TABLE "countries" ALTER COLUMN "main_religion" SET DATA TYPE "public"."enum_countries_main_religion" USING "main_religion"::"public"."enum_countries_main_religion";
  DROP INDEX "media_country_idx";
  ALTER TABLE "media" ALTER COLUMN "alt" SET NOT NULL;
  ALTER TABLE "media" ADD COLUMN "location_location_name" varchar;
  ALTER TABLE "media" ADD COLUMN "location_gps" geometry(Point);
  ALTER TABLE "media" ADD COLUMN "media_type" "enum_media_media_type" DEFAULT 'photo';
  ALTER TABLE "media" ADD COLUMN "photography_info_camera" varchar;
  ALTER TABLE "media" ADD COLUMN "photography_info_lens" varchar;
  ALTER TABLE "media" ADD COLUMN "photography_info_settings_aperture" varchar;
  ALTER TABLE "media" ADD COLUMN "photography_info_settings_shutter_speed" varchar;
  ALTER TABLE "media" ADD COLUMN "photography_info_settings_iso" numeric;
  ALTER TABLE "media" ADD COLUMN "photography_info_settings_focal_length" numeric;
  ALTER TABLE "media" ADD COLUMN "usage_photographer" varchar;
  ALTER TABLE "media" ADD COLUMN "usage_license_type" "enum_media_usage_license_type" DEFAULT 'own';
  ALTER TABLE "media" ADD COLUMN "usage_attribution" varchar;
  ALTER TABLE "media" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "media" ADD COLUMN "featured" boolean DEFAULT false;
  ALTER TABLE "trips_highlights_media" ADD COLUMN "caption" varchar;
  ALTER TABLE "trips_highlights_media" ADD COLUMN "order" numeric DEFAULT 1;
  ALTER TABLE "trips_regions_visited" ADD COLUMN "region_type" "enum_trips_regions_visited_region_type" DEFAULT 'region';
  ALTER TABLE "trips_regions_visited" ADD COLUMN "highlights" varchar;
  ALTER TABLE "trips_blocks_full_day_gallery" ADD COLUMN "caption" varchar;
  ALTER TABLE "trips_blocks_full_day_gallery" ADD COLUMN "is_highlight" boolean DEFAULT false;
  ALTER TABLE "trips" ADD COLUMN "country_id" integer NOT NULL;
  ALTER TABLE "countries" ADD COLUMN "emergency_numbers_police" varchar;
  ALTER TABLE "countries" ADD COLUMN "emergency_numbers_medical" varchar;
  ALTER TABLE "countries" ADD COLUMN "emergency_numbers_fire" varchar;
  ALTER TABLE "countries" ADD COLUMN "emergency_numbers_tourist" varchar;
  ALTER TABLE "media_seo_keywords" ADD CONSTRAINT "media_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_seo_keywords_order_idx" ON "media_seo_keywords" USING btree ("_order");
  CREATE INDEX "media_seo_keywords_parent_id_idx" ON "media_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "media_tags_order_idx" ON "media_tags" USING btree ("_order");
  CREATE INDEX "media_tags_parent_id_idx" ON "media_tags" USING btree ("_parent_id");
  ALTER TABLE "media" ADD CONSTRAINT "media_location_country_id_countries_id_fk" FOREIGN KEY ("location_country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips" ADD CONSTRAINT "trips_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_location_location_country_idx" ON "media" USING btree ("location_country_id");
  CREATE INDEX "trips_country_idx" ON "trips" USING btree ("country_id");
  ALTER TABLE "countries" DROP COLUMN "travel_time_from_brussels";`)
}
