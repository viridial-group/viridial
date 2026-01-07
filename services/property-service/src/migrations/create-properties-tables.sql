-- Create properties table
CREATE TABLE IF NOT EXISTS "properties" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "user_id" uuid NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'draft',
  "type" varchar(20) NOT NULL,
  "price" decimal(12, 2) NOT NULL,
  "currency" varchar(3) NOT NULL DEFAULT 'EUR',
  "latitude" decimal(10, 8),
  "longitude" decimal(11, 8),
  "street" varchar(255),
  "postal_code" varchar(20),
  "city" varchar(100),
  "region" varchar(100),
  "country" varchar(100),
  "media_urls" jsonb,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "published_at" timestamp,
  CONSTRAINT "PK_properties" PRIMARY KEY ("id")
);

-- Create property_translations table
CREATE TABLE IF NOT EXISTS "property_translations" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "property_id" uuid NOT NULL,
  "language" varchar(5) NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "notes" text,
  "meta_title" varchar(255),
  "meta_description" text,
  CONSTRAINT "PK_property_translations" PRIMARY KEY ("id"),
  CONSTRAINT "FK_property_translations_property_id" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE,
  CONSTRAINT "UQ_property_translations_property_language" UNIQUE ("property_id", "language")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "IDX_properties_user_id" ON "properties" ("user_id");
CREATE INDEX IF NOT EXISTS "IDX_properties_status" ON "properties" ("status");
CREATE INDEX IF NOT EXISTS "IDX_properties_postal_code" ON "properties" ("postal_code");
CREATE INDEX IF NOT EXISTS "IDX_properties_city" ON "properties" ("city");
CREATE INDEX IF NOT EXISTS "IDX_properties_country" ON "properties" ("country");
CREATE INDEX IF NOT EXISTS "IDX_property_translations_property_id" ON "property_translations" ("property_id");
CREATE INDEX IF NOT EXISTS "IDX_property_translations_language" ON "property_translations" ("language");

