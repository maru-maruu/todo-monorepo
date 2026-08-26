DROP TABLE `daily_tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`notes` text,
	`icon` text DEFAULT 'users' NOT NULL,
	`accent` text DEFAULT 'pink' NOT NULL,
	`start_date` text,
	`due_date` text,
	`due_time` text,
	`repeat_type` text,
	`repeat_weekdays` text,
	`completed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`last_modified_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
