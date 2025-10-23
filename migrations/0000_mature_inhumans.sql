CREATE TYPE "public"."onboarding_step_enum" AS ENUM('preferences', 'resume', 'completed');--> statement-breakpoint
CREATE TYPE "public"."job_mode" AS ENUM('on-site', 'remote', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('full-time', 'part-time', 'contract', 'internship');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"onboarding_step" "onboarding_step_enum" DEFAULT 'preferences' NOT NULL,
	"onboarding_completed_at" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"roles" text[] NOT NULL,
	"type" "job_type"[] NOT NULL,
	"mode" "job_mode"[] NOT NULL,
	"location" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "job_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "resume_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resume_id" uuid NOT NULL,
	"role" text NOT NULL,
	"description" text NOT NULL,
	"analysis" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "resume_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"full_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"upload_date" timestamp DEFAULT now(),
	"resume_data_id" serial NOT NULL,
	"score" integer,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"phone" text,
	"address" text,
	"linkedin" text,
	"github" text,
	"portfolio" text,
	"summary" text,
	"skills" jsonb DEFAULT '[]'::jsonb,
	"certifications" jsonb DEFAULT '[]'::jsonb,
	"achievements" jsonb DEFAULT '[]'::jsonb,
	"languages" jsonb DEFAULT '[]'::jsonb,
	"experience" jsonb DEFAULT '[]'::jsonb,
	"projects" jsonb DEFAULT '[]'::jsonb,
	"education" jsonb DEFAULT '[]'::jsonb,
	"years_of_experience" numeric(4, 1) DEFAULT '0.0' NOT NULL,
	"primary_resume_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"location" text NOT NULL,
	"type" "job_type" NOT NULL,
	"mode" "job_mode" NOT NULL,
	"description" text NOT NULL,
	"responsibilities" jsonb,
	"requirements" jsonb,
	"skills" jsonb,
	"min_salary" integer,
	"max_salary" integer,
	"salary_currency" varchar(10) DEFAULT 'USD',
	"experience_level" varchar(50) DEFAULT 'mid',
	"industry" varchar(100),
	"posted_at" timestamp DEFAULT now(),
	"deadline" timestamp,
	"is_active" boolean DEFAULT true,
	"source" varchar(100) DEFAULT 'internal',
	"url" text,
	"keywords" jsonb
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_preferences" ADD CONSTRAINT "job_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_analyses" ADD CONSTRAINT "resume_analyses_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_data" ADD CONSTRAINT "resume_data_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_resume_data_id_resume_data_id_fk" FOREIGN KEY ("resume_data_id") REFERENCES "public"."resume_data"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;