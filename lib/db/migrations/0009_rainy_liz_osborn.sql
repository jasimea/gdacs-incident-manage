ALTER TABLE "Message_v2" ADD COLUMN "content" json NOT NULL;--> statement-breakpoint
ALTER TABLE "Message" ADD COLUMN "parts" json NOT NULL;--> statement-breakpoint
ALTER TABLE "Message" ADD COLUMN "attachments" json NOT NULL;--> statement-breakpoint
ALTER TABLE "Message_v2" DROP COLUMN "parts";--> statement-breakpoint
ALTER TABLE "Message_v2" DROP COLUMN "attachments";--> statement-breakpoint
ALTER TABLE "Message" DROP COLUMN "content";