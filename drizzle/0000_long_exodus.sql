CREATE SCHEMA "core";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "core"."ad_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"external_id" text NOT NULL,
	"display_name" text NOT NULL,
	"backend" text DEFAULT 'mock' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ad_accounts_provider_external_id_unique" UNIQUE("provider","external_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "core"."customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"billing_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "core"."memberships" (
	"customer_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_customer_id_user_id_pk" PRIMARY KEY("customer_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core"."ad_accounts" ADD CONSTRAINT "ad_accounts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "core"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core"."memberships" ADD CONSTRAINT "memberships_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "core"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
