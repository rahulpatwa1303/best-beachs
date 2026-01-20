CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"beach_id" uuid NOT NULL,
	"url" text NOT NULL,
	"thumbnail" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_beach_id_beaches_id_fk" FOREIGN KEY ("beach_id") REFERENCES "public"."beaches"("id") ON DELETE cascade ON UPDATE no action;