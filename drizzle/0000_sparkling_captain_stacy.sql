CREATE TABLE `coffees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`photo` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `loads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`machine` text NOT NULL,
	`coffee_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`coffee_id`) REFERENCES `coffees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`machine` text NOT NULL,
	`coffee_id` integer NOT NULL,
	`drink` text NOT NULL,
	`stars` integer NOT NULL,
	`intensity` integer,
	`bitterness` integer,
	`acidity` integer,
	`body` integer,
	`notes` text,
	`again` integer,
	`comment` text,
	`name` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`coffee_id`) REFERENCES `coffees`(`id`) ON UPDATE no action ON DELETE no action
);
