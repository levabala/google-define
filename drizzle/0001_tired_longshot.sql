ALTER TABLE "training_spelling" DROP CONSTRAINT "training_spelling_word_fkey";
--> statement-breakpoint
ALTER TABLE "pronunciation" DROP CONSTRAINT "pronunciation_word_fkey";
--> statement-breakpoint
ALTER TABLE "training" DROP CONSTRAINT "training_word_fkey";
--> statement-breakpoint

ALTER TABLE "word" DROP CONSTRAINT "drizzle-kit generate";--> statement-breakpoint
ALTER TABLE "training_spelling" ALTER COLUMN "id" SET MAXVALUE 9223372036854776000;--> statement-breakpoint
ALTER TABLE "pronunciation" ALTER COLUMN "id" SET MAXVALUE 9223372036854776000;--> statement-breakpoint
ALTER TABLE "training" ALTER COLUMN "id" SET MAXVALUE 9223372036854776000;--> statement-breakpoint
ALTER TABLE "word" ADD CONSTRAINT "word_word_user_pk" PRIMARY KEY("word","user");--> statement-breakpoint
ALTER TABLE "training_spelling" ADD CONSTRAINT "training_spelling_word_fkey" FOREIGN KEY ("word","user") REFERENCES "public"."word"("word","user") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pronunciation" ADD CONSTRAINT "pronunciation_word_fkey" FOREIGN KEY ("word","user") REFERENCES "public"."word"("word","user") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training" ADD CONSTRAINT "training_word_fkey" FOREIGN KEY ("word","user") REFERENCES "public"."word"("word","user") ON DELETE no action ON UPDATE no action;
