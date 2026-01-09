CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"beach_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beaches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"country" varchar(255) NOT NULL,
	"region" varchar(255),
	"lat" double precision NOT NULL,
	"lon" double precision NOT NULL,
	"description" text,
	"short_description" text,
	"crowd_level" varchar(100),
	"accessibility" varchar(255),
	"entry_fee" varchar(255),
	"rating" double precision DEFAULT 0,
	"review_count" integer DEFAULT 0,
	"fetched_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "beaches_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "best_months" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"beach_id" uuid NOT NULL,
	"month" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"beach_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"beach_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"beach_id" uuid NOT NULL,
	"url" text NOT NULL,
	"thumbnail" text,
	"photographer" varchar(255),
	"photographer_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vibes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"beach_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_beach_id_beaches_id_fk" FOREIGN KEY ("beach_id") REFERENCES "public"."beaches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "best_months" ADD CONSTRAINT "best_months_beach_id_beaches_id_fk" FOREIGN KEY ("beach_id") REFERENCES "public"."beaches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_beach_id_beaches_id_fk" FOREIGN KEY ("beach_id") REFERENCES "public"."beaches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_beach_id_beaches_id_fk" FOREIGN KEY ("beach_id") REFERENCES "public"."beaches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_beach_id_beaches_id_fk" FOREIGN KEY ("beach_id") REFERENCES "public"."beaches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vibes" ADD CONSTRAINT "vibes_beach_id_beaches_id_fk" FOREIGN KEY ("beach_id") REFERENCES "public"."beaches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "beaches_slug_idx" ON "beaches" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "beaches_country_idx" ON "beaches" USING btree ("country");