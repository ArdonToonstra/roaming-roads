import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE EXTENSION IF NOT EXISTS postgis;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_media_media_type" AS ENUM('photo', 'video', 'audio', 'document');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_media_usage_license_type" AS ENUM('own', 'cc', 'stock', 'permission', 'fair-use');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_trips_regions_visited_region_type" AS ENUM('province', 'region', 'oblast', 'state', 'territory', 'county', 'district', 'other');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_trips_blocks_full_day_transportation_arrival_method" AS ENUM('walking', 'rental_car', 'public_bus', 'taxi', 'train', 'flight', 'boat', 'bicycle', 'hitchhiking', 'tour_bus', 'other');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_trips_blocks_full_day_transportation_departure_method" AS ENUM('walking', 'rental_car', 'public_bus', 'taxi', 'train', 'flight', 'boat', 'bicycle', 'hitchhiking', 'tour_bus', 'other');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_trips_blocks_full_day_transportation_travel_time_unit" AS ENUM('minutes', 'hours', 'days');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_trips_blocks_full_day_transportation_distance_unit" AS ENUM('km', 'mi');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_trips_status" AS ENUM('draft', 'published');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_countries_best_time_to_visit" AS ENUM('january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_countries_main_religion" AS ENUM('christianity', 'islam', 'judaism', 'hinduism', 'buddhism', 'sikhism', 'secular', 'mixed', 'other');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_countries_safety_level" AS ENUM('very_safe', 'safe', 'moderate', 'caution', 'high_risk');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_accommodations_amenities_amenity" AS ENUM('wifi', 'parking', 'restaurant', 'bar', 'pool', 'spa', 'gym', 'laundry', 'kitchen', 'ac', 'heating', 'hot_water', 'breakfast', 'pet_friendly', 'family_friendly', 'accessible', 'luggage_storage', 'tour_desk', 'other');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_accommodations_suitable_for_traveler_type" AS ENUM('solo', 'couples', 'families', 'groups', 'backpackers', 'business', 'adventure', 'digital_nomads');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_accommodations_type" AS ENUM('hotel', 'hostel', 'camping', 'guesthouse', 'resort', 'apartment', 'yurt', 'wild_camping', 'homestay', 'ecolodge', 'other');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_accommodations_price_range" AS ENUM('budget', 'midrange', 'luxury', 'ultra_luxury');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_accommodations_quality_star_rating" AS ENUM('1', '2', '3', '4', '5', 'unrated');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_accommodations_quality_cleanliness" AS ENUM('excellent', 'very_good', 'good', 'fair', 'poor');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   DO $$ BEGIN
     CREATE TYPE "public"."enum_accommodations_quality_service" AS ENUM('excellent', 'very_good', 'good', 'fair', 'poor');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;
   CREATE TABLE IF NOT EXISTS "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "media_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "media_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"location_country_id" integer,
  	"location_location_name" varchar,
  	"location_gps" geometry(Point),
  	"related_trip_id" integer,
  	"media_type" "enum_media_media_type" DEFAULT 'photo',
  	"photography_info_camera" varchar,
  	"photography_info_lens" varchar,
  	"photography_info_settings_aperture" varchar,
  	"photography_info_settings_shutter_speed" varchar,
  	"photography_info_settings_iso" numeric,
  	"photography_info_settings_focal_length" numeric,
  	"usage_photographer" varchar,
  	"usage_license_type" "enum_media_usage_license_type" DEFAULT 'own',
  	"usage_attribution" varchar,
  	"seo_title" varchar,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_tablet_url" varchar,
  	"sizes_tablet_width" numeric,
  	"sizes_tablet_height" numeric,
  	"sizes_tablet_mime_type" varchar,
  	"sizes_tablet_filesize" numeric,
  	"sizes_tablet_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "trips_highlights_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"caption" varchar,
  	"order" numeric DEFAULT 1
  );
  
  CREATE TABLE IF NOT EXISTS "trips_regions_visited" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"region_name" varchar NOT NULL,
  	"region_type" "enum_trips_regions_visited_region_type" DEFAULT 'region',
  	"highlights" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "trips_featured_accommodations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"accommodation_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "trips_blocks_full_day_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"caption" varchar,
  	"is_highlight" boolean DEFAULT false
  );
  
  CREATE TABLE IF NOT EXISTS "trips_blocks_full_day" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"location_name" varchar NOT NULL,
  	"location" geometry(Point),
  	"region_province" varchar,
  	"description" varchar,
  	"activities" jsonb,
  	"accommodation_id" integer,
  	"transportation_arrival_method" "enum_trips_blocks_full_day_transportation_arrival_method",
  	"transportation_departure_method" "enum_trips_blocks_full_day_transportation_departure_method",
  	"transportation_travel_time_value" numeric,
  	"transportation_travel_time_unit" "enum_trips_blocks_full_day_transportation_travel_time_unit" DEFAULT 'hours',
  	"transportation_distance_value" numeric,
  	"transportation_distance_unit" "enum_trips_blocks_full_day_transportation_distance_unit" DEFAULT 'km',
  	"transportation_transportation_notes" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "trips_blocks_waypoint_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "trips_blocks_waypoint" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"location_name" varchar NOT NULL,
  	"description" varchar,
  	"activities" jsonb,
  	"location" geometry(Point),
  	"region_province" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "trips" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"status" "enum_trips_status" DEFAULT 'draft',
  	"cover_image_id" integer NOT NULL,
  	"description" varchar,
  	"country_id" integer NOT NULL,
  	"period" varchar,
  	"budget_amount" numeric,
  	"budget_currency" varchar DEFAULT 'EUR',
  	"budget_per_person" boolean DEFAULT true,
  	"activities" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "countries_official_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "countries_best_time_to_visit" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_countries_best_time_to_visit",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "countries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"country_code" varchar NOT NULL,
  	"capital" varchar NOT NULL,
  	"currency" varchar NOT NULL,
  	"currency_name" varchar,
  	"main_religion" "enum_countries_main_religion",
  	"main_religion_percentage" numeric,
  	"visa_requirements" jsonb,
  	"safety_level" "enum_countries_safety_level",
  	"emergency_numbers_police" varchar,
  	"emergency_numbers_medical" varchar,
  	"emergency_numbers_fire" varchar,
  	"emergency_numbers_tourist" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "accommodations_amenities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"amenity" "enum_accommodations_amenities_amenity",
  	"notes" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "accommodations_suitable_for" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"traveler_type" "enum_accommodations_suitable_for_traveler_type" NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "accommodations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_accommodations_type" NOT NULL,
  	"description" jsonb,
  	"location" geometry(Point),
  	"address_street" varchar,
  	"address_city" varchar,
  	"address_region" varchar,
  	"address_postal_code" varchar,
  	"address_country_id" integer NOT NULL,
  	"contact_website" varchar,
  	"contact_phone" varchar,
  	"contact_email" varchar,
  	"price_range" "enum_accommodations_price_range",
  	"quality_star_rating" "enum_accommodations_quality_star_rating",
  	"quality_cleanliness" "enum_accommodations_quality_cleanliness",
  	"quality_service" "enum_accommodations_quality_service",
  	"personal_notes_stay_date" timestamp(3) with time zone,
  	"personal_notes_would_recommend" boolean,
  	"personal_notes_highlights" varchar,
  	"personal_notes_drawbacks" varchar,
  	"personal_notes_tips" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"trips_id" integer,
  	"countries_id" integer,
  	"accommodations_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_seo_keywords" ADD CONSTRAINT "media_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_location_country_id_countries_id_fk" FOREIGN KEY ("location_country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_related_trip_id_trips_id_fk" FOREIGN KEY ("related_trip_id") REFERENCES "public"."trips"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips_highlights_media" ADD CONSTRAINT "trips_highlights_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips_highlights_media" ADD CONSTRAINT "trips_highlights_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_regions_visited" ADD CONSTRAINT "trips_regions_visited_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_featured_accommodations" ADD CONSTRAINT "trips_featured_accommodations_accommodation_id_accommodations_id_fk" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips_featured_accommodations" ADD CONSTRAINT "trips_featured_accommodations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_blocks_full_day_gallery" ADD CONSTRAINT "trips_blocks_full_day_gallery_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips_blocks_full_day_gallery" ADD CONSTRAINT "trips_blocks_full_day_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips_blocks_full_day"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_blocks_full_day" ADD CONSTRAINT "trips_blocks_full_day_accommodation_id_accommodations_id_fk" FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips_blocks_full_day" ADD CONSTRAINT "trips_blocks_full_day_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_blocks_waypoint_gallery" ADD CONSTRAINT "trips_blocks_waypoint_gallery_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips_blocks_waypoint_gallery" ADD CONSTRAINT "trips_blocks_waypoint_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips_blocks_waypoint"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_blocks_waypoint" ADD CONSTRAINT "trips_blocks_waypoint_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips" ADD CONSTRAINT "trips_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips" ADD CONSTRAINT "trips_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "countries_official_languages" ADD CONSTRAINT "countries_official_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "countries_best_time_to_visit" ADD CONSTRAINT "countries_best_time_to_visit_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "accommodations_amenities" ADD CONSTRAINT "accommodations_amenities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."accommodations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "accommodations_suitable_for" ADD CONSTRAINT "accommodations_suitable_for_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."accommodations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_address_country_id_countries_id_fk" FOREIGN KEY ("address_country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trips_fk" FOREIGN KEY ("trips_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_countries_fk" FOREIGN KEY ("countries_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accommodations_fk" FOREIGN KEY ("accommodations_id") REFERENCES "public"."accommodations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_seo_keywords_order_idx" ON "media_seo_keywords" USING btree ("_order");
  CREATE INDEX "media_seo_keywords_parent_id_idx" ON "media_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "media_tags_order_idx" ON "media_tags" USING btree ("_order");
  CREATE INDEX "media_tags_parent_id_idx" ON "media_tags" USING btree ("_parent_id");
  CREATE INDEX "media_location_location_country_idx" ON "media" USING btree ("location_country_id");
  CREATE INDEX "media_related_trip_idx" ON "media" USING btree ("related_trip_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_tablet_sizes_tablet_filename_idx" ON "media" USING btree ("sizes_tablet_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "trips_highlights_media_order_idx" ON "trips_highlights_media" USING btree ("_order");
  CREATE INDEX "trips_highlights_media_parent_id_idx" ON "trips_highlights_media" USING btree ("_parent_id");
  CREATE INDEX "trips_highlights_media_media_idx" ON "trips_highlights_media" USING btree ("media_id");
  CREATE INDEX "trips_regions_visited_order_idx" ON "trips_regions_visited" USING btree ("_order");
  CREATE INDEX "trips_regions_visited_parent_id_idx" ON "trips_regions_visited" USING btree ("_parent_id");
  CREATE INDEX "trips_featured_accommodations_order_idx" ON "trips_featured_accommodations" USING btree ("_order");
  CREATE INDEX "trips_featured_accommodations_parent_id_idx" ON "trips_featured_accommodations" USING btree ("_parent_id");
  CREATE INDEX "trips_featured_accommodations_accommodation_idx" ON "trips_featured_accommodations" USING btree ("accommodation_id");
  CREATE INDEX "trips_blocks_full_day_gallery_order_idx" ON "trips_blocks_full_day_gallery" USING btree ("_order");
  CREATE INDEX "trips_blocks_full_day_gallery_parent_id_idx" ON "trips_blocks_full_day_gallery" USING btree ("_parent_id");
  CREATE INDEX "trips_blocks_full_day_gallery_media_idx" ON "trips_blocks_full_day_gallery" USING btree ("media_id");
  CREATE INDEX "trips_blocks_full_day_order_idx" ON "trips_blocks_full_day" USING btree ("_order");
  CREATE INDEX "trips_blocks_full_day_parent_id_idx" ON "trips_blocks_full_day" USING btree ("_parent_id");
  CREATE INDEX "trips_blocks_full_day_path_idx" ON "trips_blocks_full_day" USING btree ("_path");
  CREATE INDEX "trips_blocks_full_day_accommodation_idx" ON "trips_blocks_full_day" USING btree ("accommodation_id");
  CREATE INDEX "trips_blocks_waypoint_gallery_order_idx" ON "trips_blocks_waypoint_gallery" USING btree ("_order");
  CREATE INDEX "trips_blocks_waypoint_gallery_parent_id_idx" ON "trips_blocks_waypoint_gallery" USING btree ("_parent_id");
  CREATE INDEX "trips_blocks_waypoint_gallery_media_idx" ON "trips_blocks_waypoint_gallery" USING btree ("media_id");
  CREATE INDEX "trips_blocks_waypoint_order_idx" ON "trips_blocks_waypoint" USING btree ("_order");
  CREATE INDEX "trips_blocks_waypoint_parent_id_idx" ON "trips_blocks_waypoint" USING btree ("_parent_id");
  CREATE INDEX "trips_blocks_waypoint_path_idx" ON "trips_blocks_waypoint" USING btree ("_path");
  CREATE INDEX "trips_cover_image_idx" ON "trips" USING btree ("cover_image_id");
  CREATE INDEX "trips_country_idx" ON "trips" USING btree ("country_id");
  CREATE INDEX "trips_updated_at_idx" ON "trips" USING btree ("updated_at");
  CREATE INDEX "trips_created_at_idx" ON "trips" USING btree ("created_at");
  CREATE INDEX "countries_official_languages_order_idx" ON "countries_official_languages" USING btree ("_order");
  CREATE INDEX "countries_official_languages_parent_id_idx" ON "countries_official_languages" USING btree ("_parent_id");
  CREATE INDEX "countries_best_time_to_visit_order_idx" ON "countries_best_time_to_visit" USING btree ("order");
  CREATE INDEX "countries_best_time_to_visit_parent_idx" ON "countries_best_time_to_visit" USING btree ("parent_id");
  CREATE UNIQUE INDEX "countries_name_idx" ON "countries" USING btree ("name");
  CREATE UNIQUE INDEX "countries_country_code_idx" ON "countries" USING btree ("country_code");
  CREATE INDEX "countries_updated_at_idx" ON "countries" USING btree ("updated_at");
  CREATE INDEX "countries_created_at_idx" ON "countries" USING btree ("created_at");
  CREATE INDEX "accommodations_amenities_order_idx" ON "accommodations_amenities" USING btree ("_order");
  CREATE INDEX "accommodations_amenities_parent_id_idx" ON "accommodations_amenities" USING btree ("_parent_id");
  CREATE INDEX "accommodations_suitable_for_order_idx" ON "accommodations_suitable_for" USING btree ("_order");
  CREATE INDEX "accommodations_suitable_for_parent_id_idx" ON "accommodations_suitable_for" USING btree ("_parent_id");
  CREATE INDEX "accommodations_address_address_country_idx" ON "accommodations" USING btree ("address_country_id");
  CREATE INDEX "accommodations_updated_at_idx" ON "accommodations" USING btree ("updated_at");
  CREATE INDEX "accommodations_created_at_idx" ON "accommodations" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_trips_id_idx" ON "payload_locked_documents_rels" USING btree ("trips_id");
  CREATE INDEX "payload_locked_documents_rels_countries_id_idx" ON "payload_locked_documents_rels" USING btree ("countries_id");
  CREATE INDEX "payload_locked_documents_rels_accommodations_id_idx" ON "payload_locked_documents_rels" USING btree ("accommodations_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media_seo_keywords" CASCADE;
  DROP TABLE "media_tags" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "trips_highlights_media" CASCADE;
  DROP TABLE "trips_regions_visited" CASCADE;
  DROP TABLE "trips_featured_accommodations" CASCADE;
  DROP TABLE "trips_blocks_full_day_gallery" CASCADE;
  DROP TABLE "trips_blocks_full_day" CASCADE;
  DROP TABLE "trips_blocks_waypoint_gallery" CASCADE;
  DROP TABLE "trips_blocks_waypoint" CASCADE;
  DROP TABLE "trips" CASCADE;
  DROP TABLE "countries_official_languages" CASCADE;
  DROP TABLE "countries_best_time_to_visit" CASCADE;
  DROP TABLE "countries" CASCADE;
  DROP TABLE "accommodations_amenities" CASCADE;
  DROP TABLE "accommodations_suitable_for" CASCADE;
  DROP TABLE "accommodations" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_media_media_type";
  DROP TYPE "public"."enum_media_usage_license_type";
  DROP TYPE "public"."enum_trips_regions_visited_region_type";
  DROP TYPE "public"."enum_trips_blocks_full_day_transportation_arrival_method";
  DROP TYPE "public"."enum_trips_blocks_full_day_transportation_departure_method";
  DROP TYPE "public"."enum_trips_blocks_full_day_transportation_travel_time_unit";
  DROP TYPE "public"."enum_trips_blocks_full_day_transportation_distance_unit";
  DROP TYPE "public"."enum_trips_status";
  DROP TYPE "public"."enum_countries_best_time_to_visit";
  DROP TYPE "public"."enum_countries_main_religion";
  DROP TYPE "public"."enum_countries_safety_level";
  DROP TYPE "public"."enum_accommodations_amenities_amenity";
  DROP TYPE "public"."enum_accommodations_suitable_for_traveler_type";
  DROP TYPE "public"."enum_accommodations_type";
  DROP TYPE "public"."enum_accommodations_price_range";
  DROP TYPE "public"."enum_accommodations_quality_star_rating";
  DROP TYPE "public"."enum_accommodations_quality_cleanliness";
  DROP TYPE "public"."enum_accommodations_quality_service";`)
}
