CREATE TABLE IF NOT EXISTS "Product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"categoryId" uuid NOT NULL,
	"specification" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit" varchar(50) DEFAULT 'piece' NOT NULL,
	"size" varchar(100),
	"weight" numeric(8, 3),
	"volume" numeric(8, 3),
	"dimensions" varchar(100),
	"productType" varchar(50),
	"isKit" boolean DEFAULT false NOT NULL,
	"kitContents" json,
	"shelfLife" integer,
	"storageConditions" varchar(100),
	"isHalal" boolean DEFAULT false,
	"isKosher" boolean DEFAULT false,
	"isVegetarian" boolean DEFAULT false,
	"isVegan" boolean DEFAULT false,
	"isActive" boolean DEFAULT true NOT NULL,
	"isAvailable" boolean DEFAULT true NOT NULL,
	"referencePicture" varchar(200),
	"itemCode" varchar(50),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProductCategory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"color" varchar(7),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProductInventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productId" uuid NOT NULL,
	"currentStock" integer DEFAULT 0 NOT NULL,
	"reservedStock" integer DEFAULT 0 NOT NULL,
	"minimumStock" integer DEFAULT 0 NOT NULL,
	"maximumStock" integer,
	"warehouseLocation" varchar(200),
	"storageZone" varchar(50),
	"expiryDate" timestamp,
	"batchNumber" varchar(100),
	"unitCost" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RegionalProductPreference" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region" varchar(100) NOT NULL,
	"productId" uuid NOT NULL,
	"preferenceLevel" integer DEFAULT 3 NOT NULL,
	"isPreferred" boolean DEFAULT true NOT NULL,
	"isAvoided" boolean DEFAULT false NOT NULL,
	"culturalNotes" text,
	"dietaryRestrictions" json,
	"seasonalAvailability" json,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_ProductCategory_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."ProductCategory"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProductInventory" ADD CONSTRAINT "ProductInventory_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RegionalProductPreference" ADD CONSTRAINT "RegionalProductPreference_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
