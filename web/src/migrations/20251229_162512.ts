import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_trips_status" ADD VALUE 'coming_soon' BEFORE 'published';
  ALTER TABLE "trips_regions_visited" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accommodations_amenities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "accommodations_suitable_for" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "trips_regions_visited" CASCADE;
  DROP TABLE "accommodations_amenities" CASCADE;
  DROP TABLE "accommodations_suitable_for" CASCADE;
  ALTER TABLE "accommodations" RENAME COLUMN "address_country_id" TO "country_id";
  ALTER TABLE "accommodations" RENAME COLUMN "contact_website" TO "website";
  ALTER TABLE "accommodations" DROP CONSTRAINT "accommodations_address_country_id_countries_id_fk";
  
  DROP INDEX "accommodations_address_address_country_idx";
  ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "accommodations_country_idx" ON "accommodations" USING btree ("country_id");
  ALTER TABLE "accommodations" DROP COLUMN "location";
  ALTER TABLE "accommodations" DROP COLUMN "address_street";
  ALTER TABLE "accommodations" DROP COLUMN "address_city";
  ALTER TABLE "accommodations" DROP COLUMN "address_region";
  ALTER TABLE "accommodations" DROP COLUMN "address_postal_code";
  ALTER TABLE "accommodations" DROP COLUMN "contact_phone";
  ALTER TABLE "accommodations" DROP COLUMN "contact_email";
  ALTER TABLE "accommodations" DROP COLUMN "quality_star_rating";
  ALTER TABLE "accommodations" DROP COLUMN "quality_cleanliness";
  ALTER TABLE "accommodations" DROP COLUMN "quality_service";
  ALTER TABLE "accommodations" DROP COLUMN "personal_notes_stay_date";
  ALTER TABLE "accommodations" DROP COLUMN "personal_notes_would_recommend";
  ALTER TABLE "accommodations" DROP COLUMN "personal_notes_highlights";
  ALTER TABLE "accommodations" DROP COLUMN "personal_notes_drawbacks";
  ALTER TABLE "accommodations" DROP COLUMN "personal_notes_tips";
  DROP TYPE "public"."enum_accommodations_amenities_amenity";
  DROP TYPE "public"."enum_accommodations_suitable_for_traveler_type";
  DROP TYPE "public"."enum_accommodations_quality_star_rating";
  DROP TYPE "public"."enum_accommodations_quality_cleanliness";
  DROP TYPE "public"."enum_accommodations_quality_service";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_accommodations_amenities_amenity" AS ENUM('wifi', 'parking', 'restaurant', 'bar', 'pool', 'spa', 'gym', 'laundry', 'kitchen', 'ac', 'heating', 'hot_water', 'breakfast', 'pet_friendly', 'family_friendly', 'accessible', 'luggage_storage', 'tour_desk', 'other');
  CREATE TYPE "public"."enum_accommodations_suitable_for_traveler_type" AS ENUM('solo', 'couples', 'families', 'groups', 'backpackers', 'business', 'adventure', 'digital_nomads');
  CREATE TYPE "public"."enum_accommodations_quality_star_rating" AS ENUM('1', '2', '3', '4', '5', 'unrated');
  CREATE TYPE "public"."enum_accommodations_quality_cleanliness" AS ENUM('excellent', 'very_good', 'good', 'fair', 'poor');
  CREATE TYPE "public"."enum_accommodations_quality_service" AS ENUM('excellent', 'very_good', 'good', 'fair', 'poor');
  CREATE TABLE "trips_regions_visited" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"region_name" varchar NOT NULL
  );
  
  CREATE TABLE "accommodations_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"amenity" "enum_accommodations_amenities_amenity",
  	"notes" varchar
  );
  
  CREATE TABLE "accommodations_suitable_for" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"traveler_type" "enum_accommodations_suitable_for_traveler_type" NOT NULL
  );
  
  ALTER TABLE "accommodations" DROP CONSTRAINT "accommodations_country_id_countries_id_fk";
  
  ALTER TABLE "trips" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "trips" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_trips_status";
  CREATE TYPE "public"."enum_trips_status" AS ENUM('draft', 'published');
  ALTER TABLE "trips" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."enum_trips_status";
  ALTER TABLE "trips" ALTER COLUMN "status" SET DATA TYPE "public"."enum_trips_status" USING "status"::"public"."enum_trips_status";
  DROP INDEX "accommodations_country_idx";
  ALTER TABLE "accommodations" ADD COLUMN "location" geometry(Point);
  ALTER TABLE "accommodations" ADD COLUMN "address_street" varchar;
  ALTER TABLE "accommodations" ADD COLUMN "address_city" varchar;
  ALTER TABLE "accommodations" ADD COLUMN "address_region" varchar;
  ALTER TABLE "accommodations" ADD COLUMN "address_postal_code" varchar;
  ALTER TABLE "accommodations" ADD COLUMN "address_country_id" integer NOT NULL;
  ALTER TABLE "accommodations" ADD COLUMN "contact_website" varchar;
  ALTER TABLE "accommodations" ADD COLUMN "contact_phone" varchar;
  ALTER TABLE "accommodations" ADD COLUMN "contact_email" varchar;
  ALTER TABLE "accommodations" ADD COLUMN "quality_star_rating" "enum_accommodations_quality_star_rating";
  ALTER TABLE "accommodations" ADD COLUMN "quality_cleanliness" "enum_accommodations_quality_cleanliness";
  ALTER TABLE "accommodations" ADD COLUMN "quality_service" "enum_accommodations_quality_service";
  ALTER TABLE "accommodations" ADD COLUMN "personal_notes_stay_date" timestamp(3) with time zone;
  ALTER TABLE "accommodations" ADD COLUMN "personal_notes_would_recommend" boolean;
  ALTER TABLE "accommodations" ADD COLUMN "personal_notes_highlights" varchar;
  ALTER TABLE "accommodations" ADD COLUMN "personal_notes_drawbacks" varchar;
  ALTER TABLE "accommodations" ADD COLUMN "personal_notes_tips" jsonb;
  ALTER TABLE "trips_regions_visited" ADD CONSTRAINT "trips_regions_visited_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "accommodations_amenities" ADD CONSTRAINT "accommodations_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."accommodations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "accommodations_suitable_for" ADD CONSTRAINT "accommodations_suitable_for_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."accommodations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "trips_regions_visited_order_idx" ON "trips_regions_visited" USING btree ("_order");
  CREATE INDEX "trips_regions_visited_parent_id_idx" ON "trips_regions_visited" USING btree ("_parent_id");
  CREATE INDEX "accommodations_amenities_order_idx" ON "accommodations_amenities" USING btree ("_order");
  CREATE INDEX "accommodations_amenities_parent_id_idx" ON "accommodations_amenities" USING btree ("_parent_id");
  CREATE INDEX "accommodations_suitable_for_order_idx" ON "accommodations_suitable_for" USING btree ("_order");
  CREATE INDEX "accommodations_suitable_for_parent_id_idx" ON "accommodations_suitable_for" USING btree ("_parent_id");
  ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_address_country_id_countries_id_fk" FOREIGN KEY ("address_country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "accommodations_address_address_country_idx" ON "accommodations" USING btree ("address_country_id");
  ALTER TABLE "accommodations" DROP COLUMN "country_id";
  ALTER TABLE "accommodations" DROP COLUMN "website";`)
}
